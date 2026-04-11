import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// GET /api/organizations — list all orgs (admin only)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (status && status !== 'all') {
    filter.status = status;
  }

  const organizations = await Organization.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ organizations });
}

// POST /api/organizations — create new org (admin only)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existing = await Organization.findOne({ email: body.email });
    if (existing) {
      return NextResponse.json(
        { error: 'An organization with this email already exists' },
        { status: 400 }
      );
    }

    // Generate temporary password and onboarding token
    const tempPassword = uuidv4();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    const onboardingToken = uuidv4();

    const org = await Organization.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      phone: body.phone || '',
      website: body.website || '',
      address: body.address || '',
      logo: body.logo || '',
      industry: body.industry || '',
      accountManager: body.accountManager || '',
      status: 'onboarding',
      payment: {
        totalAmount: 0,
        minimumPayment: 0,
        payments: [],
      },
      onboarding: {
        token: onboardingToken,
        minimumPaymentPaid: false,
        passwordSetup: false,
      },
    });

    // Return without password
    const { password: _pw, ...orgObj } = org.toObject();

    return NextResponse.json({ organization: orgObj }, { status: 201 });
  } catch (error) {
    console.error('Create org error:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
