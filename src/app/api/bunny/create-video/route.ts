import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

// POST /api/bunny/create-video — create Bunny video object + return upload auth
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title } = await request.json();

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
  const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    return NextResponse.json({ error: 'Bunny Stream not configured' }, { status: 500 });
  }

  try {
    // Create video object in Bunny
    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          AccessKey: BUNNY_API_KEY,
        },
        body: JSON.stringify({ title }),
      }
    );

    if (!createRes.ok) {
      const errorText = await createRes.text();
      console.error('Bunny create video error:', errorText);
      return NextResponse.json({ error: 'Failed to create video on Bunny' }, { status: 500 });
    }

    const videoData = await createRes.json();
    const videoId = videoData.guid;

    // Generate TUS upload auth
    const expirationTime = Math.floor(Date.now() / 1000) + 86400; // 24h
    const signatureString = `${BUNNY_LIBRARY_ID}${BUNNY_API_KEY}${expirationTime}${videoId}`;
    const signature = crypto
      .createHash('sha256')
      .update(signatureString)
      .digest('hex');

    const streamUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;

    return NextResponse.json({
      videoId,
      libraryId: BUNNY_LIBRARY_ID,
      authSignature: signature,
      authExpire: expirationTime,
      streamUrl,
    });
  } catch (error) {
    console.error('Bunny create video error:', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
