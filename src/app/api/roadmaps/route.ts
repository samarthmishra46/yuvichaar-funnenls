import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Roadmap } from '@/models/Roadmap';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { orgId, title, description, totalDays } = await request.json();

    if (!orgId || !title) {
      return NextResponse.json(
        { error: 'Organization ID and title are required' },
        { status: 400 }
      );
    }

    const existing = await Roadmap.findOne({ orgId });
    if (existing) {
      return NextResponse.json(
        { error: 'Roadmap already exists for this organization' },
        { status: 400 }
      );
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (totalDays || 60));

    const roadmap = await Roadmap.create({
      orgId,
      title,
      description: description || '',
      startDate,
      endDate,
      totalDays: totalDays || 60,
    });

    return NextResponse.json({ roadmap }, { status: 201 });
  } catch (error) {
    console.error('Create roadmap error:', error);
    return NextResponse.json({ error: 'Failed to create roadmap' }, { status: 500 });
  }
}
