import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';

// PUT /api/sections/[sectionId] — update a custom section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sectionId } = await params;

  await dbConnect();

  try {
    const body = await request.json();

    // Build the update object dynamically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: any = {};
    if (body.title !== undefined) updateFields['customSections.$.title'] = body.title;
    if (body.contentType !== undefined) updateFields['customSections.$.contentType'] = body.contentType;
    if (body.content !== undefined) updateFields['customSections.$.content'] = body.content;
    if (body.fileUrl !== undefined) updateFields['customSections.$.fileUrl'] = body.fileUrl;
    if (body.bunnyVideoId !== undefined) updateFields['customSections.$.bunnyVideoId'] = body.bunnyVideoId;
    if (body.bunnyStreamUrl !== undefined) updateFields['customSections.$.bunnyStreamUrl'] = body.bunnyStreamUrl;

    const org = await Organization.findOneAndUpdate(
      { 'customSections.id': sectionId },
      { $set: updateFields },
      { new: true }
    )
      .select('customSections')
      .lean();

    if (!org) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    return NextResponse.json({ sections: org.customSections });
  } catch (error) {
    console.error('Update section error:', error);
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}

// DELETE /api/sections/[sectionId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sectionId } = await params;

  await dbConnect();

  const org = await Organization.findOneAndUpdate(
    { 'customSections.id': sectionId },
    { $pull: { customSections: { id: sectionId } } },
    { new: true }
  )
    .select('customSections')
    .lean();

  if (!org) {
    return NextResponse.json({ error: 'Section not found' }, { status: 404 });
  }

  return NextResponse.json({ sections: org.customSections });
}
