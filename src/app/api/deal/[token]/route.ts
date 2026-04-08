import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Organization from '@/models/Organization';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await dbConnect();
    const { token } = await params;

    const org = await Organization.findOne({ 'onboarding.token': token });

    if (!org) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    const dealPage = org.dealPage || {};

    const deal = {
      company: org.name,
      email: org.email,
      phone: org.phone || '',
      proposalTitle: dealPage.proposalTitle || '60 Day Growth Marathon',
      goal: dealPage.goal || 'Build an end-to-end D2C marketing funnel',
      target: dealPage.target || '1,000 paying customers',
      startDate: dealPage.startDate || '',
      adsCount: dealPage.adsCount || 15,
      socialVideosCount: dealPage.socialVideosCount || 12,
      landingPagesCount: dealPage.landingPagesCount || 1,
      fixedFee: dealPage.fixedFee || 449000,
      advanceAmount: dealPage.advanceAmount || 224500,
      advanceWithGst: dealPage.advanceWithGst || 264910,
      balanceAmount: dealPage.balanceAmount || 224500,
      balanceWithGst: dealPage.balanceWithGst || 264910,
      hasPerformanceFee: dealPage.hasPerformanceFee !== false,
      perfBonus1Trigger: dealPage.perfBonus1Trigger || '₹25,00,000',
      perfBonus1Amount: dealPage.perfBonus1Amount || '₹1,00,000',
      perfBonus2Trigger: dealPage.perfBonus2Trigger || '₹50,00,000',
      perfBonus2Amount: dealPage.perfBonus2Amount || '₹1,00,000',
      customDeliverable: dealPage.customDeliverable || '',
      customDeliverableDesc: dealPage.customDeliverableDesc || '',
      portfolioUrl: dealPage.portfolioUrl || '',
      whatsappNumber: dealPage.whatsappNumber || '919999900001',
      razorpayLink: dealPage.razorpayLink || '',
      successItems: dealPage.successItems || [
        'Client portal is live and ready',
        'Signed MoU + receipt sent to your email',
        'WhatsApp group created with your team',
        'Kickoff call link sent on WhatsApp',
        'Brand question form sent on WhatsApp',
        "Yuvraj's personal welcome video sent"
      ],
      nextStepText: dealPage.nextStepText || 'Check your WhatsApp — Yuvraj sent a personal welcome message and your kickoff call link is there.',
      deliverables: dealPage.deliverables || [
        { name: 'Performance video ads', description: 'Scripted, shot on Netflix-approved cameras, edited · UGC + founder + comparison formats · 9:16 Meta-ready', quantity: '15 ads', enabled: true },
        { name: 'Social media content + profile', description: 'Instagram Reels · bio rewrite · highlights · blue tick · curated feed ready to launch', quantity: '12 videos', enabled: true },
        { name: 'High-converting landing page(s)', description: 'VSL · hero · social proof · objection handling · urgency · dark psychology · mobile-first', quantity: '1 page', enabled: true },
        { name: 'Checkout experience', description: 'Single-click checkout · order bumps · copy optimisation · payment gateway', quantity: 'Full setup', enabled: true },
        { name: 'WATI WhatsApp automations', description: 'Cart abandonment video + text sequences · repeat purchase · cross-sell + upsell video + text · 2 months subscription covered', quantity: 'Full suite', enabled: true },
        { name: 'Email automations', description: 'Cart abandonment sequences · post-purchase flows · retention nudges', quantity: 'Full suite', enabled: true },
        { name: 'ManyChat Instagram automations', description: 'Comment triggers · DM flows · lead capture · WhatsApp opt-in', quantity: 'Full setup', enabled: true },
        { name: 'AI calling integration', description: "Automated reminder calls for high-intent visitors who didn't convert", quantity: 'Integrated', enabled: true },
        { name: 'Meta Ads setup + management', description: 'Campaign structure · audience targeting · creative testing · daily optimisation · 60 days', quantity: '60 days', enabled: true },
        { name: 'Weekly strategy calls', description: 'Screen-share · performance review · next week plan · creative feedback', quantity: '8 calls', enabled: true }
      ],
      timeline: dealPage.timeline || [
        { week: 'Week 1', phase: 'Strategy', description: 'Kickoff · brand deep-dive · funnel architecture · creative angles · audience framework' },
        { week: 'Wk 2–3', phase: 'Creative production', description: 'Scripts · storyboards · shoot days · editing · social media content' },
        { week: 'Wk 3–4', phase: 'Funnel build', description: 'Landing pages · checkout · profile optimised · all automations built and tested' },
        { week: 'Wk 4–5', phase: 'Approvals + QA', description: 'Ads reviewed · feedback incorporated · full funnel tested end to end' },
        { week: 'Day 21', phase: '🚀 Campaigns go live', description: 'Ads live · automations active · landing page live · marathon officially running' },
        { week: 'Wk 5–8', phase: 'Optimise + scale', description: 'Weekly reviews · scale winners · creative refresh · final push Days 50–60' },
        { week: 'Day 60', phase: 'Wrap + handover', description: '60-day results report · wrap call · all assets and logins handed over' }
      ],
      stats: dealPage.stats || [
        { value: '75+', label: 'D2C brands trust us with their growth' },
        { value: '6×', label: 'Peak ROAS achieved for clients' },
        { value: '27%', label: 'Average landing page conversion rate' },
        { value: '60', label: 'Days fixed. Full funnel built and live.' }
      ],
    };

    return NextResponse.json({ deal });
  } catch (error) {
    console.error('Get deal error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
