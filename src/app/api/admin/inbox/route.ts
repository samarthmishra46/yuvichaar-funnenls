import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import AdminMessage from '@/models/AdminInbox';

// GET - Get admin inbox messages
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const orgId = searchParams.get('orgId');
    const isRead = searchParams.get('isRead');
    const limit = parseInt(searchParams.get('limit') || '50');

    const filter: any = {};

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (orgId) {
      filter.orgId = orgId;
    }

    if (isRead === 'true') {
      filter.isRead = true;
    } else if (isRead === 'false') {
      filter.isRead = false;
    }

    const messages = await AdminMessage.find(filter)
      .sort({ isRead: 1, createdAt: -1 }) // Unread first, then by date
      .limit(limit)
      .lean();

    // Get unread count
    const unreadCount = await AdminMessage.countDocuments({ isRead: false });

    // Get counts by type
    const [leaveCount, taskCount, clientCount] = await Promise.all([
      AdminMessage.countDocuments({ type: 'leave_request', isRead: false }),
      AdminMessage.countDocuments({ type: 'task_completed', isRead: false }),
      AdminMessage.countDocuments({ type: 'client_request', isRead: false }),
    ]);

    return NextResponse.json({
      messages,
      unreadCount,
      counts: {
        leave_request: leaveCount,
        task_completed: taskCount,
        client_request: clientCount,
      },
    });
  } catch (error) {
    console.error('Get inbox error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
