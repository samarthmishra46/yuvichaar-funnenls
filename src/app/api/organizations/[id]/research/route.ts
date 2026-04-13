import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ResearchEntry from '@/models/ResearchEntry';

// GET /api/organizations/[id]/research
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Clients can only see their own research
  if (session.user.role === 'client' && session.user.orgId !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  const entries = await ResearchEntry.find({ orgId: id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ entries });
}

// POST /api/organizations/[id]/research
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'staff')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await dbConnect();

  try {
    const body = await request.json();

    if (!body.title || !body.type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }

    const entry = await ResearchEntry.create({
      orgId: id,
      title: body.title,
      type: body.type,
      fileUrl: body.fileUrl || '',
      docLink: body.docLink || '',
      description: body.description || '',
      uploadedBy: body.uploadedBy || session.user.email || '',
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Create research error:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}
