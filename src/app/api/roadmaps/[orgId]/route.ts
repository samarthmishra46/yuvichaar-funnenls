import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Roadmap, Task, ROADMAP_PHASES, ROADMAP_DAY_TITLES, DEFAULT_SUBTASKS } from '@/models/Roadmap';
import Organization from '@/models/Organization';
import RoadmapTemplate from '@/models/RoadmapTemplate';

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
    const roadmap = await Roadmap.findOne({ orgId }).lean() as any;
    
    if (!roadmap) {
      // Return available templates for selection
      const templates = await RoadmapTemplate.find().sort({ isDefault: -1, createdAt: -1 }).lean();
      return NextResponse.json({ 
        roadmap: null, 
        tasks: [],
        phases: ROADMAP_PHASES,
        dayTitles: ROADMAP_DAY_TITLES,
        templates,
      });
    }

    const tasks = await Task.find({ roadmapId: roadmap._id.toString() })
      .sort({ dayNumber: 1, createdAt: 1 })
      .lean();

    // Always fetch templates for change template functionality
    const templates = await RoadmapTemplate.find().sort({ isDefault: -1, createdAt: -1 }).lean();

    // If roadmap has templateId, fetch template for phases/dayTitles
    let phases = ROADMAP_PHASES;
    let dayTitles: Record<number, { title: string; milestone?: boolean }> = ROADMAP_DAY_TITLES;

    if (roadmap.templateId) {
      const template = await RoadmapTemplate.findById(roadmap.templateId).lean();
      if (template) {
        phases = template.phases;
        dayTitles = {};
        for (const day of template.days) {
          dayTitles[day.dayNumber] = { title: day.title, milestone: day.milestone };
        }
      }
    }

    return NextResponse.json({ 
      roadmap, 
      tasks,
      phases,
      dayTitles,
      templates,
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

    const { startDate, templateId } = await request.json();
    const start = startDate ? new Date(startDate) : new Date();

    let totalDays = 60;
    let title = `60-Day Growth Marathon - ${org.name}`;
    let phases = ROADMAP_PHASES;
    let dayTitles: Record<number, { title: string; milestone?: boolean }> = ROADMAP_DAY_TITLES;
    let defaultSubtasks: Record<number, string[]> = DEFAULT_SUBTASKS;

    // If templateId provided, use that template
    if (templateId) {
      const template = await RoadmapTemplate.findById(templateId).lean();
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }

      totalDays = template.totalDays;
      title = `${template.name} - ${org.name}`;
      phases = template.phases;
      dayTitles = {};
      defaultSubtasks = {};

      for (const day of template.days) {
        dayTitles[day.dayNumber] = { title: day.title, milestone: day.milestone };
        if (day.subtasks && day.subtasks.length > 0) {
          defaultSubtasks[day.dayNumber] = day.subtasks;
        }
      }
    }

    const end = new Date(start);
    end.setDate(end.getDate() + totalDays - 1);

    // Create roadmap
    const roadmap = await Roadmap.create({
      orgId,
      title,
      description: templateId ? 'Custom roadmap from template' : 'Complete brand transformation and growth program',
      startDate: start,
      endDate: end,
      totalDays,
      templateId: templateId || undefined,
    });

    // Create tasks from template
    const tasksToCreate: any[] = [];
    
    for (const [dayStr, subtasks] of Object.entries(defaultSubtasks)) {
      const dayNumber = parseInt(dayStr);
      for (const taskTitle of subtasks) {
        tasksToCreate.push({
          roadmapId: roadmap._id.toString(),
          orgId,
          dayNumber,
          title: taskTitle,
          status: 'pending',
        });
      }
    }

    if (tasksToCreate.length > 0) {
      await Task.insertMany(tasksToCreate);
    }

    const tasks = await Task.find({ roadmapId: roadmap._id.toString() })
      .sort({ dayNumber: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({ 
      roadmap, 
      tasks,
      phases,
      dayTitles,
    }, { status: 201 });
  } catch (error) {
    console.error('Create roadmap error:', error);
    return NextResponse.json({ error: 'Failed to create roadmap' }, { status: 500 });
  }
}

// DELETE - Delete roadmap and all associated tasks
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;

  await dbConnect();

  try {
    const roadmap = await Roadmap.findOne({ orgId });
    if (!roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }

    // Delete all tasks associated with this roadmap
    await Task.deleteMany({ roadmapId: roadmap._id.toString() });

    // Delete the roadmap
    await Roadmap.findByIdAndDelete(roadmap._id);

    return NextResponse.json({ success: true, message: 'Roadmap deleted' });
  } catch (error) {
    console.error('Delete roadmap error:', error);
    return NextResponse.json({ error: 'Failed to delete roadmap' }, { status: 500 });
  }
}
