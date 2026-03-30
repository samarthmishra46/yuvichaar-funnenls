import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';
import AdVideo from '@/models/AdVideo';
import ResearchEntry from '@/models/ResearchEntry';
import bcrypt from 'bcryptjs';

// GET /api/organizations/[id] — get single org
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await dbConnect();

  const org = await Organization.findById(id).select('-password').lean();

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  // Clients can only view their own org
  if (session.user.role === 'client' && session.user.orgId !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ organization: org });
}

// PUT /api/organizations/[id] — update org fields (with optional password change)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await dbConnect();

  try {
    const body = await request.json();

    // Handle password change separately
    if (body.newPassword) {
      if (body.newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      const hashedPassword = await bcrypt.hash(body.newPassword, 12);
      await Organization.findByIdAndUpdate(id, { password: hashedPassword });
    }

    // Remove password fields from the general update
    delete body.password;
    delete body.newPassword;

    // Only update other fields if there are any left
    const hasOtherFields = Object.keys(body).length > 0;

    let org;
    if (hasOtherFields) {
      org = await Organization.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true, runValidators: true }
      )
        .select('-password')
        .lean();
    } else {
      org = await Organization.findById(id).select('-password').lean();
    }

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ organization: org });
  } catch (error) {
    console.error('Update org error:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id] — delete org and all related data
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await dbConnect();

  try {
    // Delete related data
    await AdVideo.deleteMany({ orgId: id });
    await ResearchEntry.deleteMany({ orgId: id });

    // Delete the organization
    const deleted = await Organization.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete org error:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
