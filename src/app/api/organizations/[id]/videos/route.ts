import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import AdVideo from '@/models/AdVideo';

// GET /api/organizations/[id]/videos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  if (session.user.role === 'client' && session.user.orgId !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = { orgId: id };

  // Clients only see approved/live videos
  if (session.user.role === 'client') {
    filter.status = { $in: ['approved', 'live'] };
  }

  const videos = await AdVideo.find(filter).sort({ createdAt: -1 }).lean();

  return NextResponse.json({ videos });
}

// POST /api/organizations/[id]/videos
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await dbConnect();

  try {
    const body = await request.json();

    if (!body.title || !body.bunnyVideoId || !body.bunnyStreamUrl) {
      return NextResponse.json(
        { error: 'Title, videoId, and streamUrl are required' },
        { status: 400 }
      );
    }

    const video = await AdVideo.create({
      orgId: id,
      title: body.title,
      description: body.description || '',
      platform: body.platform || 'General',
      status: body.status || 'draft',
      bunnyVideoId: body.bunnyVideoId,
      bunnyStreamUrl: body.bunnyStreamUrl,
      thumbnailUrl: body.thumbnailUrl || '',
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error('Create video error:', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
