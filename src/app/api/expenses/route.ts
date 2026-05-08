import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Organization from '@/models/Organization';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'staff')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const period = searchParams.get('period');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status'); // pending | approved | rejected | all
    const scope = searchParams.get('scope'); // 'company' | 'client' | 'all'

    const filter: any = {};

    if (orgId && orgId !== 'all') {
      filter.orgId = orgId;
      filter.isCompanyExpense = false;
    } else if (scope === 'company') {
      filter.isCompanyExpense = true;
    } else if (scope === 'client') {
      filter.isCompanyExpense = { $ne: true };
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (period && period !== 'all') {
      const now = new Date();
      const fromDate = new Date();

      switch (period) {
        case '1month':
          fromDate.setMonth(now.getMonth() - 1);
          break;
        case '2months':
          fromDate.setMonth(now.getMonth() - 2);
          break;
        case '3months':
          fromDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          fromDate.setMonth(now.getMonth() - 6);
          break;
        case '1year':
          fromDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filter.date = { $gte: fromDate };
    }

    const expensesRaw = await Expense.find(filter).sort({ date: -1 }).lean();

    // Backwards-compat: old expenses without status are treated as approved
    const expenses = expensesRaw.map((e: any) => ({
      ...e,
      status: e.status || 'approved',
      isCompanyExpense: !!e.isCompanyExpense,
    }));

    const orgIds = [...new Set(expenses.filter((e: any) => e.orgId).map((e: any) => e.orgId))];
    const orgs = await Organization.find({ _id: { $in: orgIds } })
      .select('name logo')
      .lean();
    const orgMap = new Map(orgs.map((o: any) => [o._id.toString(), o]));

    const expensesWithOrg = expenses.map((expense: any) => ({
      ...expense,
      organization: expense.orgId ? orgMap.get(expense.orgId) || null : null,
    }));

    // Summary uses only APPROVED expenses
    const approvedExpenses = expenses.filter((e: any) => e.status === 'approved');
    const totalExpenses = approvedExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    const pendingCount = expenses.filter((e: any) => e.status === 'pending').length;

    // Revenue scope: only when looking at client expenses
    let totalRevenue = 0;
    const revenueByOrg: Record<string, number> = {};
    if (scope !== 'company') {
      const revenueFilter: any = {};
      if (orgId && orgId !== 'all') {
        revenueFilter._id = orgId;
      }

      const organizations = await Organization.find(revenueFilter)
        .select('name payment')
        .lean();

      organizations.forEach((org: any) => {
        let orgRevenue = 0;
        const payments = org.payment?.payments || [];

        payments.forEach((p: any) => {
          const paymentDate = new Date(p.date);

          if (filter.date) {
            if (filter.date.$gte && paymentDate < filter.date.$gte) return;
            if (filter.date.$lte && paymentDate > filter.date.$lte) return;
          }

          orgRevenue += p.amount;
        });

        totalRevenue += orgRevenue;
        revenueByOrg[org._id.toString()] = orgRevenue;
      });
    }

    const expensesByCategory: Record<string, number> = {};
    approvedExpenses.forEach((e: any) => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    const expensesBySubcategory: Record<string, number> = {};
    approvedExpenses.forEach((e: any) => {
      if (e.subcategory) {
        const key = `${e.category}::${e.subcategory}`;
        expensesBySubcategory[key] = (expensesBySubcategory[key] || 0) + e.amount;
      }
    });

    const expensesByOrg: Record<string, number> = {};
    approvedExpenses.forEach((e: any) => {
      if (e.orgId) {
        expensesByOrg[e.orgId] = (expensesByOrg[e.orgId] || 0) + e.amount;
      }
    });

    const totalCompanyExpenses = approvedExpenses
      .filter((e: any) => e.isCompanyExpense)
      .reduce((sum: number, e: any) => sum + e.amount, 0);

    return NextResponse.json({
      expenses: expensesWithOrg,
      summary: {
        totalRevenue,
        totalExpenses,
        totalCompanyExpenses,
        profit: totalRevenue - totalExpenses,
        pendingCount,
        expensesByCategory,
        expensesBySubcategory,
        expensesByOrg,
        revenueByOrg,
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'staff')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await request.json();
    const {
      orgId,
      isCompanyExpense,
      category,
      subcategory,
      description,
      amount,
      date,
      notes,
      attachmentUrl,
      creatorBreakdown,
    } = body;

    const isCompany = !!isCompanyExpense;

    if (!category || !description || amount === undefined) {
      return NextResponse.json(
        { error: 'Category, description, and amount are required' },
        { status: 400 }
      );
    }

    if (!isCompany && !orgId) {
      return NextResponse.json(
        { error: 'Organization is required for client expenses' },
        { status: 400 }
      );
    }

    // Only admin can create company-wide expenses
    if (isCompany && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create company-wide expenses' },
        { status: 403 }
      );
    }

    if (!isCompany) {
      const org = await Organization.findById(orgId);
      if (!org) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    }

    // Validate creator breakdown sum (if provided)
    let totalAmount = Number(amount);
    let normalizedBreakdown: { name: string; amount: number; notes?: string }[] | undefined;
    if (Array.isArray(creatorBreakdown) && creatorBreakdown.length > 0) {
      normalizedBreakdown = creatorBreakdown
        .filter((c: any) => c && c.name && c.amount !== undefined)
        .map((c: any) => ({
          name: String(c.name).trim(),
          amount: Number(c.amount),
          notes: c.notes ? String(c.notes) : undefined,
        }));
      const breakdownTotal = normalizedBreakdown.reduce((s, c) => s + c.amount, 0);
      // If amount is 0 or not provided meaningfully, derive from breakdown
      if (!totalAmount || totalAmount === 0) {
        totalAmount = breakdownTotal;
      }
    }

    const role = session.user.role as 'admin' | 'staff';

    const expense = await Expense.create({
      orgId: isCompany ? null : orgId,
      isCompanyExpense: isCompany,
      category,
      subcategory: subcategory || undefined,
      description,
      amount: totalAmount,
      date: date ? new Date(date) : new Date(),
      notes: notes || undefined,
      attachmentUrl: attachmentUrl || undefined,
      creatorBreakdown: normalizedBreakdown,
      status: role === 'admin' ? 'approved' : 'pending',
      createdBy: session.user.email,
      createdByRole: role,
      verifiedBy: role === 'admin' ? session.user.email : undefined,
      verifiedAt: role === 'admin' ? new Date() : undefined,
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error: any) {
    console.error('Create expense error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create expense' },
      { status: 500 }
    );
  }
}
