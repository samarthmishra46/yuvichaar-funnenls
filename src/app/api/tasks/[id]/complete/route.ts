import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Task } from '@/models/Roadmap';
import Organization from '@/models/Organization';
import Staff from '@/models/Staff';
import { sendEmail, getTaskCompletionEmailTemplate } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await dbConnect();

  try {
    const { proofOfWork } = await request.json();

    if (!proofOfWork || !proofOfWork.type) {
      return NextResponse.json(
        { error: 'Proof of work is required' },
        { status: 400 }
      );
    }

    const task = await Task.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          proofOfWork,
        },
      },
      { new: true }
    ).lean();

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Send email notifications
    const org = await Organization.findById(task.orgId).select('name email').lean();
    
    if (org) {
      // Get staff name if assigned
      let staffName = task.assignedTo;
      if (task.assignedTo) {
        const staff = await Staff.findOne({ email: task.assignedTo }).lean();
        if (staff) {
          staffName = staff.name;
        }
      }

      const proofText =
        proofOfWork.type === 'text'
          ? proofOfWork.content
          : proofOfWork.type === 'image'
          ? 'Image uploaded'
          : 'File uploaded';

      // Email to client
      await sendEmail({
        to: org.email,
        subject: `Task Completed - Day ${task.dayNumber}`,
        html: getTaskCompletionEmailTemplate({
          organizationName: org.name,
          taskTitle: task.title,
          dayNumber: task.dayNumber,
          staffName,
          proofOfWork: proofText,
        }),
      });

      // Email to admin (get from env or config)
      if (process.env.ADMIN_EMAIL) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `Task Completed - ${org.name} - Day ${task.dayNumber}`,
          html: getTaskCompletionEmailTemplate({
            organizationName: org.name,
            taskTitle: task.title,
            dayNumber: task.dayNumber,
            staffName,
            proofOfWork: proofText,
          }),
        });
      }
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Complete task error:', error);
    return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
  }
}
