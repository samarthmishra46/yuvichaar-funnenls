import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Task, Roadmap } from '@/models/Roadmap';
import Organization from '@/models/Organization';

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
    const withOrgDetails = searchParams.get('withOrgDetails') === 'true';

    const filter: any = {};
    if (orgId) filter.orgId = orgId;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter).sort({ dayNumber: 1, createdAt: 1 }).lean();

    // If withOrgDetails is requested, fetch organization and roadmap details
    if (withOrgDetails && tasks.length > 0) {
      const orgIds = [...new Set(tasks.map((t: any) => t.orgId))];
      const roadmapIds = [...new Set(tasks.map((t: any) => t.roadmapId))];
      
      const [orgs, roadmaps] = await Promise.all([
        Organization.find({ _id: { $in: orgIds } }).select('name logo').lean(),
        Roadmap.find({ _id: { $in: roadmapIds } }).select('orgId startDate totalDays').lean(),
      ]);

      const orgMap = new Map(orgs.map((o: any) => [o._id.toString(), o]));
      const roadmapMap = new Map(roadmaps.map((r: any) => [r._id.toString(), r]));

      const tasksWithDetails = tasks.map((task: any) => ({
        ...task,
        organization: orgMap.get(task.orgId) || null,
        roadmap: roadmapMap.get(task.roadmapId) || null,
      }));

      return NextResponse.json({ tasks: tasksWithDetails });
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
