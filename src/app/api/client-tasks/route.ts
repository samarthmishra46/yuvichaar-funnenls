import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ClientTask from '@/models/ClientTask';
import Organization from '@/models/Organization';
import { sendEmail, getClientTaskEmailTemplate } from '@/lib/email';

// POST - Create a client task (staff/admin only)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !['staff', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { orgId, title, description, taskType, priority } = await request.json();

    if (!orgId || !title || !description) {
      return NextResponse.json(
        { error: 'Organization, title, and description are required' },
        { status: 400 }
      );
    }

    // Get organization details
    const org = await Organization.findById(orgId).lean();
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const task = await ClientTask.create({
      orgId,
      orgName: (org as any).name,
      title,
      description,
      taskType: taskType || 'other',
      priority: priority || 'medium',
      status: 'pending',
      createdBy: session.user.name || session.user.email,
      createdByEmail: session.user.email,
      createdByRole: session.user.role,
    });

    // Send email notification to client
    if ((org as any).email) {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      await sendEmail({
        to: (org as any).email,
        subject: `Action Required - ${title}`,
        html: getClientTaskEmailTemplate({
          organizationName: (org as any).name,
          taskTitle: title,
          taskDescription: description,
          dashboardLink: `${baseUrl}/client`,
        }),
      });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create client task error:', error);
    return NextResponse.json({ error: 'Failed to create client task' }, { status: 500 });
  }
}

// GET - Get client tasks
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const status = searchParams.get('status');

    let filter: any = {};

    // Client can only see tasks for their organization
    if (session.user.role === 'client') {
      if (!session.user.orgId) {
        return NextResponse.json({ error: 'No organization assigned' }, { status: 400 });
      }
      filter.orgId = session.user.orgId;
    } else if (orgId) {
      filter.orgId = orgId;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const tasks = await ClientTask.find(filter).sort({ createdAt: -1 }).lean();

    // Count pending tasks for client
    const pendingCount = await ClientTask.countDocuments({
      ...filter,
      status: { $in: ['pending', 'in_progress'] },
    });

    return NextResponse.json({ tasks, pendingCount });
  } catch (error) {
    console.error('Get client tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch client tasks' }, { status: 500 });
  }
}
