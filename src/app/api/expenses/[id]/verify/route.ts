import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';

export async function POST(
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
    const { action, rejectionReason } = await request.json();

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updates: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      verifiedBy: session.user.email,
      verifiedAt: new Date(),
    };

    if (action === 'reject') {
      updates.rejectionReason = rejectionReason || '';
    } else {
      updates.rejectionReason = undefined;
    }

    const expense = await Expense.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ expense });
  } catch (error: any) {
    console.error('Verify expense error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to verify expense' },
      { status: 500 }
    );
  }
}
