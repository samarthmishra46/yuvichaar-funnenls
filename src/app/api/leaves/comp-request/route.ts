import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { CompRequest, StaffLeaveBalance } from '@/models/Leave';
import AdminMessage from '@/models/AdminInbox';
import Staff from '@/models/Staff';

// Helper to get current fiscal year
function getCurrentFiscalYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 3) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  }
  return `${year - 1}-${year.toString().slice(-2)}`;
}

// POST - Create a compensatory leave request (staff worked on Sunday)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'staff') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { workDate, reason } = await request.json();

    if (!workDate || !reason) {
      return NextResponse.json(
        { error: 'Work date and reason are required' },
        { status: 400 }
      );
    }

    const date = new Date(workDate);
    
    // Verify it's a Sunday (0 = Sunday)
    if (date.getDay() !== 0) {
      return NextResponse.json(
        { error: 'Compensatory leave can only be requested for work done on Sundays' },
        { status: 400 }
      );
    }

    // Get staff details
    const staff = await Staff.findOne({ email: session.user.email }).lean();
    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Check if already requested for this date
    const existing = await CompRequest.findOne({
      staffEmail: session.user.email,
      workDate: date,
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Compensatory leave already requested for this date' },
        { status: 400 }
      );
    }

    const compRequest = await CompRequest.create({
      staffId: (staff as any)._id.toString(),
      staffEmail: session.user.email,
      staffName: (staff as any).name || session.user.name || 'Staff',
      workDate: date,
      reason,
      status: 'pending',
    });

    // Create admin inbox message
    await AdminMessage.create({
      type: 'leave_request',
      title: `Comp Leave Request: ${(staff as any).name || session.user.email}`,
      message: `${(staff as any).name || session.user.email} has requested compensatory leave for working on Sunday ${date.toLocaleDateString()}. Reason: ${reason}`,
      fromType: 'staff',
      fromId: (staff as any)._id.toString(),
      fromName: (staff as any).name || session.user.email,
      fromEmail: session.user.email,
      relatedId: compRequest._id.toString(),
      metadata: {
        leaveType: 'compensatory',
        startDate: date.toISOString(),
      },
      isRead: false,
    });

    return NextResponse.json({ compRequest }, { status: 201 });
  } catch (error) {
    console.error('Create comp request error:', error);
    return NextResponse.json({ error: 'Failed to create compensatory leave request' }, { status: 500 });
  }
}

// GET - Get compensatory leave requests
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    let filter: any = {};

    if (session.user.role === 'staff') {
      filter.staffEmail = session.user.email;
    }

    const compRequests = await CompRequest.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ compRequests });
  } catch (error) {
    console.error('Get comp requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch compensatory leave requests' }, { status: 500 });
  }
}
