import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';
import bcrypt from 'bcryptjs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await dbConnect();
    const { token } = await params;
    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const org = await Organization.findOne({ 'onboarding.token': token });

    if (!org) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Check if payment is done
    if (!org.dealPage?.advancePaid) {
      return NextResponse.json({ error: 'Please complete payment first' }, { status: 400 });
    }

    // Hash and save password
    const hashedPassword = await bcrypt.hash(password, 12);
    org.password = hashedPassword;
    org.onboarding.passwordSetup = true;
    org.status = 'active';

    await org.save();

    return NextResponse.json({ 
      success: true,
      email: org.email,
    });
  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
