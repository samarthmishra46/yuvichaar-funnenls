import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import RoadmapTemplate from '@/models/RoadmapTemplate';
import { ROADMAP_PHASES, ROADMAP_DAY_TITLES, DEFAULT_SUBTASKS } from '@/models/Roadmap';

// GET /api/roadmap-templates - List all templates
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const templates = await RoadmapTemplate.find().sort({ isDefault: -1, createdAt: -1 }).lean();
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST /api/roadmap-templates - Create a new template
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await request.json();

    // If creating from default 60-day template
    if (body.createDefault) {
      // Check if default already exists
      const existingDefault = await RoadmapTemplate.findOne({ isDefault: true, totalDays: 60 });
      if (existingDefault) {
        return NextResponse.json({ template: existingDefault });
      }

      // Convert existing constants to template format
      const days = Object.entries(ROADMAP_DAY_TITLES).map(([dayNum, config]) => ({
        dayNumber: parseInt(dayNum),
        title: config.title,
        milestone: config.milestone || false,
        subtasks: DEFAULT_SUBTASKS[parseInt(dayNum)] || [],
      }));

      const template = await RoadmapTemplate.create({
        name: '60-Day Growth Marathon',
        description: 'The standard 60-day growth marathon template with 5 phases',
        totalDays: 60,
        phases: ROADMAP_PHASES,
        days,
        isDefault: true,
        createdBy: session.user.email,
      });

      return NextResponse.json({ template }, { status: 201 });
    }

    // Custom template creation
    if (!body.name || !body.totalDays || !body.phases || !body.days) {
      return NextResponse.json(
        { error: 'Name, totalDays, phases, and days are required' },
        { status: 400 }
      );
    }

    // Validate phases
    for (const phase of body.phases) {
      if (!phase.name || !phase.startDay || !phase.endDay || !phase.color) {
        return NextResponse.json(
          { error: 'Each phase must have name, startDay, endDay, and color' },
          { status: 400 }
        );
      }
      if (phase.endDay > body.totalDays) {
        return NextResponse.json(
          { error: `Phase "${phase.name}" endDay exceeds totalDays` },
          { status: 400 }
        );
      }
    }

    const template = await RoadmapTemplate.create({
      name: body.name,
      description: body.description || '',
      totalDays: body.totalDays,
      phases: body.phases.map((p: any, idx: number) => ({ ...p, id: idx + 1 })),
      days: body.days,
      isDefault: false,
      createdBy: session.user.email,
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
