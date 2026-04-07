import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await dbConnect();
    const { token } = await params;
    const { signatureName } = await request.json();

    if (!signatureName || signatureName.trim().length < 2) {
      return NextResponse.json({ error: 'Valid signature name is required' }, { status: 400 });
    }

    const org = await Organization.findOne({ 'onboarding.token': token });

    if (!org) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Check if already signed
    if (org.dealPage?.signedAt) {
      return NextResponse.json({ error: 'Agreement already signed' }, { status: 400 });
    }

    // Update the dealPage with signature info
    org.dealPage = {
      ...org.dealPage,
      signatureName: signatureName.trim(),
      signedAt: new Date(),
    };

    await org.save();

    return NextResponse.json({ 
      success: true, 
      signedAt: org.dealPage.signedAt,
      signatureName: org.dealPage.signatureName 
    });
  } catch (error) {
    console.error('Sign deal error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
