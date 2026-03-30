import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';

// POST /api/payments/verify
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'client' || !session.user.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } =
      await request.json();

    // Verify signature
    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Save payment to org
    await dbConnect();

    const org = await Organization.findByIdAndUpdate(
      session.user.orgId,
      {
        $push: {
          'payment.payments': {
            amount: amount / 100, // convert from paise
            date: new Date(),
            note: 'Online payment',
            razorpayPaymentId: razorpay_payment_id,
          },
        },
      },
      { new: true }
    );

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
