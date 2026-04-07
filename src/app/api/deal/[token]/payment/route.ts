import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';

// Record payment after successful Razorpay payment or bank transfer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await dbConnect();
    const { token } = await params;
    const { paymentMethod, razorpayPaymentId, amount } = await request.json();

    const org = await Organization.findOne({ 'onboarding.token': token });

    if (!org) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Check if already paid
    if (org.dealPage?.advancePaid) {
      return NextResponse.json({ error: 'Advance already paid' }, { status: 400 });
    }

    // Check if agreement is signed
    if (!org.dealPage?.signedAt) {
      return NextResponse.json({ error: 'Please sign the agreement first' }, { status: 400 });
    }

    const paymentAmount = amount || org.dealPage?.advanceWithGst || org.payment?.minimumPayment || 0;

    // Record the payment
    org.payment.payments.push({
      amount: paymentAmount,
      date: new Date(),
      note: paymentMethod === 'razorpay' ? 'Advance payment via Razorpay' : 'Advance payment via Bank Transfer',
      razorpayPaymentId: razorpayPaymentId || undefined,
    });

    // Update deal page status
    org.dealPage = {
      ...org.dealPage,
      advancePaid: true,
      advancePaidAt: new Date(),
    };

    // Update onboarding status
    org.onboarding.minimumPaymentPaid = true;

    await org.save();

    return NextResponse.json({ 
      success: true,
      advancePaid: true,
      advancePaidAt: org.dealPage.advancePaidAt,
    });
  } catch (error) {
    console.error('Payment record error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
