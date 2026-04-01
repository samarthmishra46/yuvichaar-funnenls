import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Staff from '@/models/Staff';
import bcrypt from 'bcryptjs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await params;
    const { email, name, role, password } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    const staff = await Staff.findById(id);
    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it's already taken
    if (email !== staff.email) {
      const existing = await Staff.findOne({ email });
      if (existing) {
        return NextResponse.json(
          { error: 'Email already in use by another staff member' },
          { status: 400 }
        );
      }
    }

    // Update fields
    staff.email = email;
    staff.name = name;
    staff.role = role || '';

    // Update password if provided
    if (password) {
      staff.password = await bcrypt.hash(password, 12);
    }

    await staff.save();

    const { password: _pw, ...staffWithoutPassword } = staff.toObject();

    return NextResponse.json({ staff: staffWithoutPassword });
  } catch (error) {
    console.error('Update staff error:', error);
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await params;
    const staff = await Staff.findByIdAndDelete(id);

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}
