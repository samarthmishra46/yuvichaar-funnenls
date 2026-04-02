import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Leave, StaffLeaveBalance } from '@/models/Leave';

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

// PATCH - Update leave status (admin only - approve/reject)
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
    const { status, adminResponse } = await request.json();

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (approved/rejected) is required' },
        { status: 400 }
      );
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return NextResponse.json({ error: 'Leave not found' }, { status: 404 });
    }

    // If approving, deduct from balance
    if (status === 'approved' && leave.status !== 'approved') {
      const fiscalYear = getCurrentFiscalYear();
      const balanceUpdate: any = {};
      balanceUpdate[`balances.${leave.leaveType}.used`] = leave.days;
      balanceUpdate[`balances.${leave.leaveType}.available`] = -leave.days;

      await StaffLeaveBalance.findOneAndUpdate(
        { staffId: leave.staffId, fiscalYear },
        { 
          $inc: balanceUpdate,
          $set: { updatedAt: new Date() }
        }
      );
    }

    // If rejecting a previously approved leave, restore balance
    if (status === 'rejected' && leave.status === 'approved') {
      const fiscalYear = getCurrentFiscalYear();
      const balanceUpdate: any = {};
      balanceUpdate[`balances.${leave.leaveType}.used`] = -leave.days;
      balanceUpdate[`balances.${leave.leaveType}.available`] = leave.days;

      await StaffLeaveBalance.findOneAndUpdate(
        { staffId: leave.staffId, fiscalYear },
        { 
          $inc: balanceUpdate,
          $set: { updatedAt: new Date() }
        }
      );
    }

    leave.status = status;
    leave.adminResponse = adminResponse || '';
    leave.respondedAt = new Date();
    leave.respondedBy = session.user.email;
    await leave.save();

    return NextResponse.json({ leave });
  } catch (error) {
    console.error('Update leave error:', error);
    return NextResponse.json({ error: 'Failed to update leave' }, { status: 500 });
  }
}
