import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ClientRequest from '@/models/ClientRequest';

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

    return NextResponse.json({ request: clientRequest });
  } catch (error) {
    console.error('Update client request error:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
