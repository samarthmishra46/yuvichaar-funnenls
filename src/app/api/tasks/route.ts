import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Task } from '@/models/Roadmap';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { roadmapId, orgId, dayNumber, title, description, assignedTo } = await request.json();

    if (!roadmapId || !orgId || !dayNumber || !title) {
      return NextResponse.json(
        { error: 'Roadmap ID, organization ID, day number, and title are required' },
        { status: 400 }
      );
    }

    const task = await Task.create({
      roadmapId,
      orgId,
      dayNumber,
      title,
      description: description || '',
      assignedTo: assignedTo || '',
      status: 'pending',
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const assignedTo = searchParams.get('assignedTo');

    const filter: any = {};
    if (orgId) filter.orgId = orgId;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter).sort({ dayNumber: 1, createdAt: 1 }).lean();

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
