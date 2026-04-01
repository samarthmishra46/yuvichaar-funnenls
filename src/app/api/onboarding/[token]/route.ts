import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  await dbConnect();

  try {
    const org = await Organization.findOne({ 'onboarding.token': token })
      .select('-password')
      .lean();

    if (!org) {
      return NextResponse.json({ error: 'Invalid onboarding token' }, { status: 404 });
    }

    return NextResponse.json({ organization: org });
  } catch (error) {
    console.error('Get onboarding error:', error);
    return NextResponse.json({ error: 'Failed to fetch onboarding data' }, { status: 500 });
  }
}
