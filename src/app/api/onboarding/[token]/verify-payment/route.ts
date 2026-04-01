import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  await dbConnect();

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } =
      await request.json();

    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const org = await Organization.findOneAndUpdate(
      { 'onboarding.token': token },
      {
        $set: {
          'onboarding.minimumPaymentPaid': true,
        },
        $push: {
          'payment.payments': {
            amount: amount / 100,
            date: new Date(),
            note: 'Minimum payment (onboarding)',
            razorpayPaymentId: razorpay_payment_id,
          },
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
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
