import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ClientRequest from '@/models/ClientRequest';
import Organization from '@/models/Organization';
import { sendEmail, getRequestStatusEmailTemplate } from '@/lib/email';

// PATCH - Update client request status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await params;
    const { status, adminResponse } = await request.json();

    if (!status || !['pending', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      );
    }

    // Get old status before update
    const oldRequest = await ClientRequest.findById(id);
    const oldStatus = oldRequest?.status || 'pending';

    const clientRequest = await ClientRequest.findByIdAndUpdate(
      id,
      {
        status,
        adminResponse: adminResponse || '',
        respondedAt: new Date(),
        respondedBy: session.user.email,
      },
      { new: true }
    );

    if (!clientRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Send email notification to client if status changed
    if (oldStatus !== status) {
      const org = await Organization.findById(clientRequest.orgId);
      if (org?.email) {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        await sendEmail({
          to: org.email,
          subject: `Request Update - ${clientRequest.title}`,
          html: getRequestStatusEmailTemplate({
            organizationName: org.name,
            requestTitle: clientRequest.title,
            oldStatus,
            newStatus: status,
            adminNote: adminResponse,
            dashboardLink: `${baseUrl}/client`,
          }),
        });
      }
    }

    return NextResponse.json({ request: clientRequest });
  } catch (error) {
    console.error('Update client request error:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
