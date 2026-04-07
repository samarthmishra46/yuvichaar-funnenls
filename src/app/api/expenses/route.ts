import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Organization from '@/models/Organization';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const period = searchParams.get('period'); // all, 1month, 2months, 3months, 6months, 1year
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const filter: any = {};
    
    if (orgId && orgId !== 'all') {
      filter.orgId = orgId;
    }

    // Date filtering
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (period && period !== 'all') {
      const now = new Date();
      let fromDate = new Date();
      
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

    const expenses = await Expense.find(filter).sort({ date: -1 }).lean();

    // Get organization details for each expense
    const orgIds = [...new Set(expenses.map((e: any) => e.orgId))];
    const orgs = await Organization.find({ _id: { $in: orgIds } })
      .select('name logo')
      .lean();
    const orgMap = new Map(orgs.map((o: any) => [o._id.toString(), o]));

    const expensesWithOrg = expenses.map((expense: any) => ({
      ...expense,
      organization: orgMap.get(expense.orgId) || null,
    }));

    // Calculate totals
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

    // Get revenue (payments) for the same period/org
    let revenueFilter: any = {};
    if (orgId && orgId !== 'all') {
      revenueFilter._id = orgId;
    }

    const organizations = await Organization.find(revenueFilter)
      .select('name payment')
      .lean();

    let totalRevenue = 0;
    const revenueByOrg: Record<string, number> = {};

    organizations.forEach((org: any) => {
      let orgRevenue = 0;
      const payments = org.payment?.payments || [];
      
      payments.forEach((p: any) => {
        const paymentDate = new Date(p.date);
        
        // Apply same date filter to revenue
        if (filter.date) {
          if (filter.date.$gte && paymentDate < filter.date.$gte) return;
          if (filter.date.$lte && paymentDate > filter.date.$lte) return;
        }
        
        orgRevenue += p.amount;
      });
      
      totalRevenue += orgRevenue;
      revenueByOrg[org._id.toString()] = orgRevenue;
    });

    // Calculate expenses by category
    const expensesByCategory: Record<string, number> = {};
    expenses.forEach((e: any) => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    // Calculate expenses by organization
    const expensesByOrg: Record<string, number> = {};
    expenses.forEach((e: any) => {
      expensesByOrg[e.orgId] = (expensesByOrg[e.orgId] || 0) + e.amount;
    });

    return NextResponse.json({
      expenses: expensesWithOrg,
      summary: {
        totalRevenue,
        totalExpenses,
        profit: totalRevenue - totalExpenses,
        expensesByCategory,
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
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { orgId, category, description, amount, date } = await request.json();

    if (!orgId || !category || !description || amount === undefined) {
      return NextResponse.json(
        { error: 'Organization, category, description, and amount are required' },
        { status: 400 }
      );
    }

    // Verify organization exists
    const org = await Organization.findById(orgId);
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const expense = await Expense.create({
      orgId,
      category,
      description,
      amount,
      date: date ? new Date(date) : new Date(),
      createdBy: session.user.email,
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
