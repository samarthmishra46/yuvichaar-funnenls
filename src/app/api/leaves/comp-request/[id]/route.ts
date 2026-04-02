import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { CompRequest, StaffLeaveBalance } from '@/models/Leave';

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

// PATCH - Approve/reject compensatory leave request (admin only)
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

    const compRequest = await CompRequest.findById(id);
    if (!compRequest) {
      return NextResponse.json({ error: 'Compensatory request not found' }, { status: 404 });
    }

    // If approving, add 1 day to compensatory leave balance
    if (status === 'approved' && compRequest.status !== 'approved') {
      const fiscalYear = getCurrentFiscalYear();
      
      // Get or create balance
      let balance = await StaffLeaveBalance.findOne({ 
        staffId: compRequest.staffId, 
        fiscalYear 
      });

      if (!balance) {
        balance = await StaffLeaveBalance.create({
          staffId: compRequest.staffId,
          staffEmail: compRequest.staffEmail,
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

      // Add 1 day to compensatory balance
      await StaffLeaveBalance.findOneAndUpdate(
        { staffId: compRequest.staffId, fiscalYear },
        { 
          $inc: {
            'balances.compensatory.total': 1,
            'balances.compensatory.available': 1,
          },
          $set: { updatedAt: new Date() }
        }
      );
    }

    // If rejecting a previously approved request, remove the day
    if (status === 'rejected' && compRequest.status === 'approved') {
      const fiscalYear = getCurrentFiscalYear();
      
      await StaffLeaveBalance.findOneAndUpdate(
        { staffId: compRequest.staffId, fiscalYear },
        { 
          $inc: {
            'balances.compensatory.total': -1,
            'balances.compensatory.available': -1,
          },
          $set: { updatedAt: new Date() }
        }
      );
    }

    compRequest.status = status;
    compRequest.adminResponse = adminResponse || '';
    compRequest.respondedAt = new Date();
    compRequest.respondedBy = session.user.email;
    await compRequest.save();

    return NextResponse.json({ compRequest });
  } catch (error) {
    console.error('Update comp request error:', error);
    return NextResponse.json({ error: 'Failed to update compensatory request' }, { status: 500 });
  }
}
