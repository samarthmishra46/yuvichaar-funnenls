import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ClientTask from '@/models/ClientTask';

// PATCH - Update client task (client responds, staff/admin marks complete)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await params;
    const body = await request.json();

    const task = await ClientTask.findById(id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Client can only respond to tasks for their organization
    if (session.user.role === 'client') {
      if (task.orgId !== session.user.orgId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Client is responding to the task
      if (body.clientResponse !== undefined) {
        task.clientResponse = body.clientResponse;
        task.clientRespondedAt = new Date();
        task.status = 'in_progress';
      }
    }

    // Staff/Admin can mark as complete
    if (['staff', 'admin'].includes(session.user.role)) {
      if (body.status) {
        task.status = body.status;
        if (body.status === 'completed') {
          task.completedAt = new Date();
          task.completedBy = session.user.email;
        }
      }
    }

    await task.save();

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Update client task error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE - Delete client task (staff/admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !['staff', 'admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await params;
    await ClientTask.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete client task error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
