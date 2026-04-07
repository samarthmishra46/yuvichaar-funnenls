import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';
import { sendEmail, getNewSectionEmailTemplate } from '@/lib/email';

// GET /api/organizations/[id]/sections
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

  const org = await Organization.findById(id).select('customSections').lean();

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  return NextResponse.json({ sections: org.customSections || [] });
}

// POST /api/organizations/[id]/sections
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

    if (!body.id || !body.title || !body.contentType) {
      return NextResponse.json(
        { error: 'id, title, and contentType are required' },
        { status: 400 }
      );
    }

    const org = await Organization.findByIdAndUpdate(
      id,
      {
        $push: {
          customSections: {
            id: body.id,
            title: body.title,
            contentType: body.contentType,
            content: body.content || '',
            fileUrl: body.fileUrl || '',
            bunnyVideoId: body.bunnyVideoId || '',
            bunnyStreamUrl: body.bunnyStreamUrl || '',
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    )
      .select('customSections')
      .lean();

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Send email notification to client
    const fullOrg = await Organization.findById(id).select('email name').lean();
    if (fullOrg?.email) {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      await sendEmail({
        to: fullOrg.email,
        subject: `New Content Added - ${body.title}`,
        html: getNewSectionEmailTemplate({
          organizationName: fullOrg.name,
          sectionTitle: body.title,
          sectionDescription: body.content?.substring(0, 200),
          dashboardLink: `${baseUrl}/client/sections/${body.id}`,
        }),
      });
    }

    return NextResponse.json({ sections: org.customSections }, { status: 201 });
  } catch (error) {
    console.error('Create section error:', error);
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}
