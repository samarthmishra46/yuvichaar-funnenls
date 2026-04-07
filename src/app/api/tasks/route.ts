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
    const dateFilter = searchParams.get('date'); // today, yesterday, tomorrow, all, or specific date (YYYY-MM-DD)

    const filter: any = {};
    if (orgId) filter.orgId = orgId;
    if (assignedTo) filter.assignedTo = assignedTo;

    let tasks = await Task.find(filter).sort({ dayNumber: 1, createdAt: 1 }).lean();

    // Always fetch roadmaps for date filtering or org details
    const roadmapIds = [...new Set(tasks.map((t: any) => t.roadmapId))];
    const roadmaps = await Roadmap.find({ _id: { $in: roadmapIds } }).select('orgId startDate totalDays').lean();
    const roadmapMap = new Map(roadmaps.map((r: any) => [r._id.toString(), r]));

    // Calculate actual date for each task based on roadmap startDate + dayNumber
    const tasksWithDates = tasks.map((task: any) => {
      const roadmap = roadmapMap.get(task.roadmapId);
      let taskDate = null;
      if (roadmap) {
        const startDate = new Date(roadmap.startDate);
        taskDate = new Date(startDate);
        taskDate.setDate(startDate.getDate() + task.dayNumber - 1);
      }
      return { ...task, taskDate, roadmap };
    });

    // Apply date filter
    if (dateFilter && dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let targetDate: Date;
      
      if (dateFilter === 'today') {
        targetDate = today;
      } else if (dateFilter === 'yesterday') {
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() - 1);
      } else if (dateFilter === 'tomorrow') {
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + 1);
      } else {
        // Specific date in YYYY-MM-DD format
        targetDate = new Date(dateFilter);
        targetDate.setHours(0, 0, 0, 0);
      }

      tasks = tasksWithDates.filter((task: any) => {
        if (!task.taskDate) return false;
        const td = new Date(task.taskDate);
        td.setHours(0, 0, 0, 0);
        return td.getTime() === targetDate.getTime();
      });
    } else {
      tasks = tasksWithDates;
    }

    // If withOrgDetails is requested, fetch organization details
    if (withOrgDetails && tasks.length > 0) {
      const orgIds = [...new Set(tasks.map((t: any) => t.orgId))];
      const orgs = await Organization.find({ _id: { $in: orgIds } }).select('name logo').lean();
      const orgMap = new Map(orgs.map((o: any) => [o._id.toString(), o]));

      tasks = tasks.map((task: any) => ({
        ...task,
        organization: orgMap.get(task.orgId) || null,
      }));
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
