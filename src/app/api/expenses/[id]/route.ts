import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';

export async function GET(
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
    const expense = await Expense.findById(id).lean();
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
    return NextResponse.json({ expense });
  } catch (error) {
    console.error('Get expense error:', error);
    return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 });
  }
}

export async function PATCH(
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
    const updates = await request.json();
    const role = session.user.role as 'admin' | 'staff';

    const existing = await Expense.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Staff: can only edit own pending expenses (and not company expenses)
    if (role === 'staff') {
      if (existing.isCompanyExpense) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (existing.createdBy !== session.user.email) {
        return NextResponse.json(
          { error: 'You can only edit expenses you created' },
          { status: 403 }
        );
      }
      if (existing.status !== 'pending') {
        return NextResponse.json(
          { error: 'Cannot edit an expense once it has been verified' },
          { status: 403 }
        );
      }

      // Whitelist fields staff can update
      const allowed: any = {};
      const editable = [
        'category',
        'subcategory',
        'description',
        'amount',
        'date',
        'notes',
        'attachmentUrl',
        'creatorBreakdown',
      ];
      editable.forEach((field) => {
        if (updates[field] !== undefined) {
          allowed[field] = field === 'date' && updates[field] ? new Date(updates[field]) : updates[field];
        }
      });

      const updated = await Expense.findByIdAndUpdate(id, allowed, { new: true }).lean();
      return NextResponse.json({ expense: updated });
    }

    // Admin: can update most fields. Strip server-controlled ones.
    const sanitized = { ...updates };
    delete sanitized.createdBy;
    delete sanitized.createdByRole;
    delete sanitized.verifiedBy;
    delete sanitized.verifiedAt;
    if (sanitized.date) sanitized.date = new Date(sanitized.date);

    const expense = await Expense.findByIdAndUpdate(id, sanitized, { new: true }).lean();
    return NextResponse.json({ expense });
  } catch (error: any) {
    console.error('Update expense error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const role = session.user.role as 'admin' | 'staff';
    const existing = await Expense.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (role === 'staff') {
      if (existing.isCompanyExpense) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (existing.createdBy !== session.user.email) {
        return NextResponse.json(
          { error: 'You can only delete expenses you created' },
          { status: 403 }
        );
      }
      if (existing.status !== 'pending') {
        return NextResponse.json(
          { error: 'Cannot delete an expense once it has been verified' },
          { status: 403 }
        );
      }
    }

    await Expense.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
