import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  await dbConnect();

  try {
    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const org = await Organization.findOne({ 'onboarding.token': token });

    if (!org) {
      return NextResponse.json({ error: 'Invalid onboarding token' }, { status: 404 });
    }

    if (!org.onboarding.minimumPaymentPaid) {
      return NextResponse.json({ error: 'Payment must be completed first' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Organization.findByIdAndUpdate(org._id, {
      $set: {
        password: hashedPassword,
        'onboarding.passwordSetup': true,
        status: 'active',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json({ error: 'Failed to set password' }, { status: 500 });
  }
}
