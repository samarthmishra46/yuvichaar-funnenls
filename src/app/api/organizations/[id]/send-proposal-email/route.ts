import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';
import { sendEmail, getOnboardingEmailTemplate } from '@/lib/email';

export async function POST(
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
    
    const org = await Organization.findById(id);
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    if (!org.onboarding?.token) {
      return NextResponse.json({ error: 'Organization has no onboarding token' }, { status: 400 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const onboardingLink = `${baseUrl}/deal/${org.onboarding.token}`;

    const result = await sendEmail({
      to: org.email,
      subject: 'Welcome to Yuvichaar - Complete Your Onboarding',
      html: getOnboardingEmailTemplate({
        organizationName: org.name,
        onboardingLink,
      }),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    // Update organization to track that email was sent
    await Organization.findByIdAndUpdate(id, {
      $set: { 'onboarding.proposalEmailSent': true, 'onboarding.proposalEmailSentAt': new Date() }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Proposal email sent successfully' 
    });
  } catch (error) {
    console.error('Send proposal email error:', error);
    return NextResponse.json(
      { error: 'Failed to send proposal email' },
      { status: 500 }
    );
  }
}
