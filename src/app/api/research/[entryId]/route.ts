import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ResearchEntry from '@/models/ResearchEntry';

// DELETE /api/research/[entryId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'staff')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { entryId } = await params;

  await dbConnect();

  // Find the entry first to check ownership
  const entry = await ResearchEntry.findById(entryId);

  if (!entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }

  // Staff can only delete their own uploads
  if (session.user.role === 'staff' && entry.uploadedBy !== session.user.email) {
    return NextResponse.json({ error: 'You can only delete entries you uploaded' }, { status: 403 });
  }

  await ResearchEntry.findByIdAndDelete(entryId);

  return NextResponse.json({ success: true });
}
