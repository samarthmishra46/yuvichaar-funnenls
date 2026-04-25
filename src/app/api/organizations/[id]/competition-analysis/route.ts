import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import CompetitionAnalysis from '@/models/CompetitionAnalysis';
import { runCompetitionAnalysis } from '@/lib/runCompetitionAnalysis';

// GET /api/organizations/[id]/competition-analysis
// Returns the latest analysis job for this org (for polling)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  if (session.user.role === 'client' && session.user.orgId !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  const analysis = await CompetitionAnalysis.findOne({ orgId: id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ analysis: analysis || null });
}

// POST /api/organizations/[id]/competition-analysis
// Starts a new analysis job (admin or the org's own client)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  if (session.user.role === 'client' && session.user.orgId !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 });
  }

  await dbConnect();

  // Prevent duplicate processing jobs
  const inFlight = await CompetitionAnalysis.findOne({ orgId: id, status: 'processing' }).lean();
  if (inFlight) {
    return NextResponse.json(
      { error: 'Analysis already in progress', jobId: (inFlight as unknown as { _id: string })._id },
      { status: 409 }
    );
  }

  const job = await CompetitionAnalysis.create({
    orgId: id,
    status: 'processing',
    createdBy: session.user.email || session.user.role,
  });

  // Fire-and-forget: background job updates MongoDB when done
  runCompetitionAnalysis(id, job._id.toString()).catch(console.error);

  return NextResponse.json({ jobId: job._id, status: 'processing' }, { status: 202 });
}
