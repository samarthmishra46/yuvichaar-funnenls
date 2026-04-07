import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';
import Razorpay from 'razorpay';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  await dbConnect();

  try {
    const org = await Organization.findOne({ 'onboarding.token': token });

    if (!org) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Check if agreement is signed
    if (!org.dealPage?.signedAt) {
      return NextResponse.json({ error: 'Agreement must be signed first' }, { status: 400 });
    }

    // Check if already paid
    if (org.dealPage?.advancePaid) {
      return NextResponse.json({ error: 'Advance already paid' }, { status: 400 });
    }

    // Get advance amount with GST
    const amount = org.dealPage?.advanceWithGst || org.payment?.minimumPayment || 0;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `deal_${org._id.toString().slice(-12)}_${Date.now()}`.slice(0, 40),
      notes: {
        organization_id: org._id.toString(),
        organization_name: org.name,
        type: 'deal_advance',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      prefill: {
        name: org.name,
        email: org.email,
        contact: org.phone || '',
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
