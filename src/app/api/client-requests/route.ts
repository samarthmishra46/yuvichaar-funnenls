import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ClientRequest from '@/models/ClientRequest';
import AdminMessage from '@/models/AdminInbox';
import Organization from '@/models/Organization';

// POST - Create a new client request
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'client') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { requestType, title, description, attachmentUrl } = await request.json();

    if (!requestType || !title || !description) {
      return NextResponse.json(
        { error: 'Request type, title, and description are required' },
        { status: 400 }
      );
    }

    // Get organization details
    const org = await Organization.findById(session.user.orgId).select('name').lean();
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const clientRequest = await ClientRequest.create({
      orgId: session.user.orgId,
      orgName: (org as any).name,
      requestType,
      title,
      description,
      attachmentUrl: attachmentUrl || '',
      status: 'pending',
    });

    // Create admin inbox message
    const requestTypeLabels: Record<string, string> = {
      access: 'Access Request',
      information: 'Information Request',
      document: 'Document Request',
      other: 'Other Request',
    };

    await AdminMessage.create({
      type: 'client_request',
      title: `${requestTypeLabels[requestType]}: ${(org as any).name}`,
      message: `${(org as any).name} has submitted a request: ${title}. Details: ${description}`,
      fromType: 'client',
      fromId: session.user.orgId,
      fromName: (org as any).name,
      fromEmail: session.user.email,
      orgId: session.user.orgId,
      orgName: (org as any).name,
      relatedId: clientRequest._id.toString(),
      metadata: {
        requestType,
      },
      isRead: false,
    });

    return NextResponse.json({ request: clientRequest }, { status: 201 });
  } catch (error) {
    console.error('Create client request error:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

// GET - Get client requests
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const orgId = searchParams.get('orgId');

    let filter: any = {};

    // Clients can only see their own requests
    if (session.user.role === 'client') {
      filter.orgId = session.user.orgId;
    } else if (orgId) {
      filter.orgId = orgId;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const requests = await ClientRequest.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Get client requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}
