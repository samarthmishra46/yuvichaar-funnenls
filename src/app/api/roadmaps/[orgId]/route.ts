import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Roadmap, Task, ROADMAP_PHASES, ROADMAP_DAY_TITLES, DEFAULT_SUBTASKS } from '@/models/Roadmap';
import Organization from '@/models/Organization';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;

  await dbConnect();

  try {
    const roadmap = await Roadmap.findOne({ orgId }).lean();
    
    if (!roadmap) {
      return NextResponse.json({ 
        roadmap: null, 
        tasks: [],
        phases: ROADMAP_PHASES,
        dayTitles: ROADMAP_DAY_TITLES,
      });
    }

    const tasks = await Task.find({ roadmapId: roadmap._id.toString() })
      .sort({ dayNumber: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({ 
      roadmap, 
      tasks,
      phases: ROADMAP_PHASES,
      dayTitles: ROADMAP_DAY_TITLES,
    });
  } catch (error) {
    console.error('Get roadmap error:', error);
    return NextResponse.json({ error: 'Failed to fetch roadmap' }, { status: 500 });
  }
}

// POST - Initialize roadmap from template
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !['staff', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;

  await dbConnect();

  try {
    // Check if roadmap already exists
    const existingRoadmap = await Roadmap.findOne({ orgId });
    if (existingRoadmap) {
      return NextResponse.json({ error: 'Roadmap already exists for this organization' }, { status: 400 });
    }

    // Get organization
    const org = await Organization.findById(orgId);
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const { startDate } = await request.json();
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 59); // 60 days total

    // Create roadmap
    const roadmap = await Roadmap.create({
      orgId,
      title: `60-Day Growth Marathon - ${org.name}`,
      description: 'Complete brand transformation and growth program',
      startDate: start,
      endDate: end,
      totalDays: 60,
    });

    // Create tasks from template
    const tasksToCreate: any[] = [];
    
    for (const [dayStr, subtasks] of Object.entries(DEFAULT_SUBTASKS)) {
      const dayNumber = parseInt(dayStr);
      for (const title of subtasks) {
        tasksToCreate.push({
          roadmapId: roadmap._id.toString(),
          orgId,
          dayNumber,
          title,
          status: 'pending',
        });
      }
    }

    await Task.insertMany(tasksToCreate);

    const tasks = await Task.find({ roadmapId: roadmap._id.toString() })
      .sort({ dayNumber: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({ 
      roadmap, 
      tasks,
      phases: ROADMAP_PHASES,
      dayTitles: ROADMAP_DAY_TITLES,
    }, { status: 201 });
  } catch (error) {
    console.error('Create roadmap error:', error);
    return NextResponse.json({ error: 'Failed to create roadmap' }, { status: 500 });
  }
}
