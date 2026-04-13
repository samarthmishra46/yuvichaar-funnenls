import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import AdVideo from '@/models/AdVideo';

// PUT /api/videos/[videoId] — update video
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { videoId } = await params;

  await dbConnect();

  try {
    const body = await request.json();

    const video = await AdVideo.findByIdAndUpdate(
      videoId,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ video });
  } catch (error) {
    console.error('Update video error:', error);
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
  }
}

// DELETE /api/videos/[videoId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'staff')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { videoId } = await params;

  await dbConnect();

  // Find the video first to check ownership
  const video = await AdVideo.findById(videoId);

  if (!video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  // Staff can only delete their own uploads
  if (session.user.role === 'staff' && video.uploadedBy !== session.user.email) {
    return NextResponse.json({ error: 'You can only delete videos you uploaded' }, { status: 403 });
  }

  await AdVideo.findByIdAndDelete(videoId);

  return NextResponse.json({ success: true });
}
