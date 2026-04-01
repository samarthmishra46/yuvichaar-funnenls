import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Roadmap, Task } from '@/models/Roadmap';

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
      return NextResponse.json({ roadmap: null, tasks: [] });
    }

    const tasks = await Task.find({ roadmapId: roadmap._id.toString() })
      .sort({ dayNumber: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({ roadmap, tasks });
  } catch (error) {
    console.error('Get roadmap error:', error);
    return NextResponse.json({ error: 'Failed to fetch roadmap' }, { status: 500 });
  }
}
