import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  await dbConnect();

  try {
    const { signature } = await request.json();

    if (!signature || !signature.trim()) {
      return NextResponse.json({ error: 'Signature is required' }, { status: 400 });
    }

    const org = await Organization.findOneAndUpdate(
      { 'onboarding.token': token },
      {
        $set: {
          'onboarding.signedAt': new Date(),
          'onboarding.signatureUrl': signature,
        },
      },
      { new: true }
    )
      .select('-password')
      .lean();

    if (!org) {
      return NextResponse.json({ error: 'Invalid onboarding token' }, { status: 404 });
    }

    return NextResponse.json({ success: true, organization: org });
  } catch (error) {
    console.error('Sign documents error:', error);
    return NextResponse.json({ error: 'Failed to sign documents' }, { status: 500 });
  }
}
