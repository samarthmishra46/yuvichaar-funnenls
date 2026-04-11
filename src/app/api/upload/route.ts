import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

// POST /api/upload — upload file to Bunny Storage
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !['admin', 'staff'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const BUNNY_STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY;
  const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
  const BUNNY_STORAGE_HOSTNAME = process.env.BUNNY_STORAGE_HOSTNAME || 'storage.bunnycdn.com';
  const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL;

  if (!BUNNY_STORAGE_API_KEY || !BUNNY_STORAGE_ZONE) {
    return NextResponse.json({ error: 'Bunny Storage not configured' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = (formData.get('type') as string) || 'file';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'file';
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const fileName = `${timestamp}-${uniqueId}.${ext}`;

    // Determine folder based on type
    const folder = type === 'logo' ? 'logos' : type === 'pdf' ? 'research' : type === 'image' ? 'images' : 'files';
    const filePath = `yuvichaar/${folder}/${fileName}`;

    // Upload to Bunny Storage with retry logic
    const uploadUrl = `https://${BUNNY_STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${filePath}`;
    
    let uploadRes: Response | null = null;
    let lastError: Error | null = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'AccessKey': BUNNY_STORAGE_API_KEY,
            'Content-Type': 'application/octet-stream',
          },
          body: buffer,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (uploadRes.ok) {
          break; // Success, exit retry loop
        }
      } catch (err) {
        lastError = err as Error;
        console.error(`Upload attempt ${attempt} failed:`, err);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      }
    }

    if (!uploadRes || !uploadRes.ok) {
      const errorText = uploadRes ? await uploadRes.text() : lastError?.message || 'Unknown error';
      console.error('Bunny Storage upload error:', errorText);
      return NextResponse.json({ error: 'Upload failed', details: errorText }, { status: 500 });
    }

    // Return CDN URL
    const cdnUrl = BUNNY_CDN_URL 
      ? `${BUNNY_CDN_URL}/${filePath}`
      : `https://${BUNNY_STORAGE_ZONE}.b-cdn.net/${filePath}`;

    return NextResponse.json({ url: cdnUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
