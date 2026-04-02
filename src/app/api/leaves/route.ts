import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Leave, StaffLeaveBalance, LEAVE_TYPES, LeaveType } from '@/models/Leave';
import AdminMessage from '@/models/AdminInbox';
import Staff from '@/models/Staff';

// Helper to get current fiscal year (April to March)
function getCurrentFiscalYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  // If month is April (3) or later, fiscal year is current-next, else previous-current
  if (month >= 3) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  }
  return `${year - 1}-${year.toString().slice(-2)}`;
}

// Helper to get or create staff leave balance
async function getOrCreateLeaveBalance(staffId: string, staffEmail: string) {
  const fiscalYear = getCurrentFiscalYear();
  
  let balance = await StaffLeaveBalance.findOne({ staffId, fiscalYear });
  
  if (!balance) {
    balance = await StaffLeaveBalance.create({
      staffId,
      staffEmail,
      fiscalYear,
      balances: {
        casual: { total: 10, used: 0, available: 10 },
        paid: { total: 15, used: 0, available: 15 },
        optional_holiday: { total: 2, used: 0, available: 2 },
        menstrual: { total: 12, used: 0, available: 12 },
        marriage: { total: 7, used: 0, available: 7 },
        rehabilitation: { total: 5, used: 0, available: 5 },
        public_holiday: { total: 13, used: 0, available: 13 },
        compensatory: { total: 0, used: 0, available: 0 },
      },
    });
  }
  
  return balance;
}

// POST - Create a new leave request (staff only)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'staff') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { leaveType, startDate, endDate, reason } = await request.json();

    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: 'Leave type, start date, end date, and reason are required' },
        { status: 400 }
      );
    }

    // Validate leave type
    if (!LEAVE_TYPES[leaveType as LeaveType]) {
      return NextResponse.json({ error: 'Invalid leave type' }, { status: 400 });
    }

    // Get staff details
    const staff = await Staff.findOne({ email: session.user.email }).lean();
    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Check leave balance
    const balance = await getOrCreateLeaveBalance((staff as any)._id.toString(), session.user.email);
    const leaveBalance = (balance.balances as any)[leaveType];
    
    if (leaveBalance.available < days) {
      return NextResponse.json(
        { error: `Insufficient ${LEAVE_TYPES[leaveType as LeaveType].name} balance. Available: ${leaveBalance.available} days` },
        { status: 400 }
      );
    }

    const leave = await Leave.create({
      staffId: (staff as any)._id.toString(),
      staffEmail: session.user.email,
      staffName: (staff as any).name || session.user.name || 'Staff',
      leaveType,
      startDate: start,
      endDate: end,
      days,
      reason,
      status: 'pending',
    });

    // Create admin inbox message
    const leaveInfo = LEAVE_TYPES[leaveType as LeaveType];
    await AdminMessage.create({
      type: 'leave_request',
      title: `${leaveInfo.name} Request: ${(staff as any).name || session.user.email}`,
      message: `${(staff as any).name || session.user.email} has requested ${days} day(s) of ${leaveInfo.name} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}. Reason: ${reason}`,
      fromType: 'staff',
      fromId: (staff as any)._id.toString(),
      fromName: (staff as any).name || session.user.email,
      fromEmail: session.user.email,
      relatedId: leave._id.toString(),
      metadata: {
        leaveType,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      isRead: false,
    });

    return NextResponse.json({ leave }, { status: 201 });
  } catch (error) {
    console.error('Create leave error:', error);
    return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
  }
}

// GET - Get leaves and balance (staff sees their own, admin sees all)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const includeBalance = searchParams.get('includeBalance') === 'true';

    let filter: any = {};
    let balance = null;

    // Staff can only see their own leaves
    if (session.user.role === 'staff') {
      filter.staffEmail = session.user.email;
      
      if (includeBalance) {
        const staff = await Staff.findOne({ email: session.user.email }).lean();
        if (staff) {
          balance = await getOrCreateLeaveBalance((staff as any)._id.toString(), session.user.email);
        }
      }
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      filter.status = status;
    }

    const leaves = await Leave.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ 
      leaves, 
      balance: balance?.balances || null,
      fiscalYear: getCurrentFiscalYear(),
      leaveTypes: LEAVE_TYPES,
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaves' }, { status: 500 });
  }
}
