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
      companyAddress: org.address || '',
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
      performanceFeeAmount: (() => {
        const bonuses = dealPage.performanceBonuses || [];
        if (bonuses.length > 0) {
          const total = bonuses.reduce((sum, b) => sum + (parseInt(b.amount.replace(/[₹,\s]/g, '')) || 0), 0);
          return `₹${total.toLocaleString()}`;
        }
        // Fallback to legacy fields - only if they exist
        const b1 = dealPage.perfBonus1Amount ? (parseInt(dealPage.perfBonus1Amount.replace(/[₹,\s]/g, '')) || 0) : 0;
        const b2 = dealPage.perfBonus2Amount ? (parseInt(dealPage.perfBonus2Amount.replace(/[₹,\s]/g, '')) || 0) : 0;
        return `₹${(b1 + b2).toLocaleString()}`;
      })(),
      performanceBonuses: (() => {
        // If performanceBonuses exists and has data, use it
        if (dealPage.performanceBonuses && dealPage.performanceBonuses.length > 0) {
          return dealPage.performanceBonuses;
        }
        // Otherwise, migrate from legacy fields - only add if there's actual data
        const migrated: Array<{ trigger: string; amount: string }> = [];
        if (dealPage.perfBonus1Amount && dealPage.perfBonus1Trigger) {
          migrated.push({
            trigger: dealPage.perfBonus1Trigger,
            amount: dealPage.perfBonus1Amount
          });
        }
        if (dealPage.perfBonus2Amount && dealPage.perfBonus2Trigger) {
          migrated.push({
            trigger: dealPage.perfBonus2Trigger,
            amount: dealPage.perfBonus2Amount
          });
        }
        // Return migrated or empty array (no defaults)
        return migrated;
      })(),
      // Legacy fields for backward compatibility
      perfBonus1Trigger: dealPage.perfBonus1Trigger || '',
      perfBonus1Amount: dealPage.perfBonus1Amount || '',
      perfBonus2Trigger: dealPage.perfBonus2Trigger || '',
      perfBonus2Amount: dealPage.perfBonus2Amount || '',
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
      funnelDiagram: dealPage.funnelDiagram || {
        topNote: 'People scrolling Instagram & Facebook',
        nodes: [
          { emoji: '🎬', label: 'They see your ads', description: '{adsCount} video ads · Netflix-grade cameras · multiple angles' },
          { emoji: '📱', label: 'They check your social media', description: 'Optimised profile · {socialVideosCount} trust-building videos · blue tick' },
          { emoji: '🏠', label: 'They land on your funnel page', description: 'VSL · social proof · urgency · single-click checkout' }
        ],
        buyBranch: {
          title: 'They buy ✓',
          items: [
            { text: 'Added to WhatsApp community' },
            { text: 'Repeat purchase sequences fire' },
            { text: 'Cross-sell + upsell video flows' },
            { text: 'Close to zero CAC on repeat' }
          ]
        },
        noBuyBranch: {
          title: "They don't buy",
          items: [
            { text: 'Retargeted with new ads' },
            { text: 'WhatsApp video sequences fire' },
            { text: 'Email cart abandonment' },
            { text: 'AI calling for high-intent visitors' }
          ]
        },
        outcomeLabel: 'The outcome',
        outcomeText: 'Predictable customers · Lower CAC · Higher LTV'
      },
      agreementIntro: dealPage.agreementIntro || 'This agreement defines the exact terms of the engagement. Read every clause. By signing, you confirm you have read, understood, and agreed to all terms.',
      clauseSections: dealPage.clauseSections?.length ? dealPage.clauseSections : [
        {
          title: 'Section A — Scope of Work',
          clauses: [
            { number: 'Clause 1', title: 'Services to be delivered', body: 'Yuvichaar Funnels ("the Agency") agrees to design and execute the {proposalTitle} for {company}, commencing {startDate}:', listItems: ['{adsCount} performance video ads — scripted, shot, edited, Meta-ready', '{socialVideosCount} social media videos + full Instagram profile optimisation', '{landingPagesCount} high-converting landing page(s) including Video Sales Letter', 'Checkout experience — single-click checkout, order bumps, copy optimisation', 'WATI WhatsApp automations — cart abandonment + repeat purchase + cross-sell + upsell (video + text sequences)', 'Email automations — cart abandonment + post-purchase sequences', 'ManyChat Instagram DM automations', 'AI calling integration for high-intent visitors', '60-day Meta campaign management'] },
            { number: 'Clause 2', title: 'Production and quality standards', body: 'All video content will be shot on professional Netflix-approved cameras. All deliverables meet Meta advertising specifications. Landing pages will be mobile-first, load under 3 seconds, and meet the conversion standards in the proposal. All automation sequences will be fully tested before launch.', listItems: [] },
            { number: 'Clause 3', title: 'Timeline', body: 'The engagement runs for 60 days from the confirmed start date. Campaigns go live by Day 21. Some phases run in parallel. If the Client delays feedback, access, or approvals, the Agency will notify the Client of the timeline impact and agree a revised schedule.', listItems: [] }
          ]
        },
        {
          title: 'Section B — Payment Terms',
          clauses: [
            { number: 'Clause 4', title: 'Fee structure and payment schedule', body: 'The fixed fee for this engagement is ₹{fixedFee} excluding GST at 18%. Payment is in two equal instalments:', listItems: ['Advance: ₹{advanceAmount} + GST (₹{advanceWithGst} total) — due on signing. This activates the engagement.', 'Balance: ₹{balanceAmount} + GST (₹{balanceWithGst} total) — due on Day 30, regardless of delivery status unless there is a material breach by the Agency.', 'All fixed fee payments are non-refundable once the corresponding phase of work has commenced.'] },
            { number: 'Clause 5', title: 'Performance bonuses', body: 'A performance fee of ₹2,00,000 + GST is payable in two tranches only upon confirmed achievement of revenue milestones:', listItems: ['{perfBonus1Amount} + GST — upon hitting {perfBonus1Trigger} in attributed revenue', '{perfBonus2Amount} + GST — upon hitting {perfBonus2Trigger} in attributed revenue', 'Performance bonuses are not due unless the stated revenue milestones are met and verified. If milestones are not reached, no performance fee is payable.'] },
            { number: 'Clause 6', title: 'Ad spend budget', body: 'The fees above cover campaign management only. Meta ad spend is not included. The Agency will fund up to ₹25,000 in initial test spend. Thereafter, the Client is responsible for funding ad spend. The Agency cannot be held responsible for campaign results if the Client does not fund adequate spend.', listItems: [] }
          ]
        },
        {
          title: 'Section C — Mutual Responsibilities',
          clauses: [
            { number: 'Clause 7', title: 'Agency commitments', body: '', listItems: ['Deliver every item in Clause 1 within the agreed timeline', 'Assign a dedicated POC who sends the Client a daily update', "Provide real-time visibility via the Client's dedicated portal", 'Cover automation tool subscription costs for the first 2 months', 'Fund ₹25,000 in initial Meta test spend', 'Share weekly performance reports during the campaign period'] },
            { number: 'Clause 8', title: 'Client responsibilities', body: '', listItems: ['Provide feedback on all deliverables within 48 hours. Delays impact launch timing.', 'Grant platform access (Meta BM, website, WhatsApp API, Instagram) by end of Week 1', 'Designate one decision-maker with authority to approve scripts, creatives, and copy', 'Fund ad spend budget as agreed at kickoff', 'Provide brand assets, product imagery, and testimonials as requested'] }
          ]
        },
        {
          title: 'Section D — Revisions, Reshoots, Scope',
          clauses: [
            { number: 'Clause 9', title: 'Revision policy', body: 'Included at no cost: minor script adjustments before production, subtitle/text corrections, minor editing changes aligned with approved concept. Not included: complete concept changes after production, additional creatives beyond the agreed quantity, new deliverables not in this agreement.', listItems: [] },
            { number: 'Clause 10', title: 'Reshoot policy', body: 'Reshoots at no cost only when the Agency deviates from the approved script (missed lines, wrong wording, technical equipment failure). Not provided for subjective dissatisfaction including acting preferences or creative direction changes formed after production.', listItems: [] },
            { number: 'Clause 11', title: 'Scope limitations', body: 'Outside scope unless separately agreed in writing:', listItems: ['Additional video ads or landing pages beyond the quantity in Clause 1', 'Website development outside the funnel landing page', 'Additional automation systems beyond those in Clause 1', 'Customer service handling on behalf of the Client'] }
          ]
        },
        {
          title: 'Section E — Outcomes and Liability',
          clauses: [
            { number: 'Clause 12', title: 'No guarantee of revenue outcomes', body: "The Agency installs the infrastructure and manages campaigns. Revenue outcomes are not guaranteed — they depend on market demand, pricing, competition, and platform dynamics outside the Agency's control. The Agency commits to delivering the best possible system and campaigns.", listItems: [] },
            { number: 'Clause 13', title: 'Automation subscriptions after 2 months', body: "The Agency covers WATI, email, and ManyChat subscription costs for the first 2 months. After that, all renewals are the Client's responsibility. The Agency provides all credentials and documentation required to manage subscriptions independently.", listItems: [] },
            { number: 'Clause 14', title: 'Governing law', body: 'This agreement is governed by the laws of India. Disputes are subject to the jurisdiction of the courts of Jaipur, Rajasthan. Both parties agree to attempt amicable resolution before pursuing legal remedies.', listItems: [] }
          ]
        }
      ],
      confirmationItems: dealPage.confirmationItems || [
        { text: 'The exact deliverables and quantities in Clause 1' },
        { text: 'The payment schedule — advance on signing, balance on Day 30 (Clause 4)' },
        { text: 'Performance bonuses are only triggered on revenue milestones (Clause 5)' },
        { text: 'Revenue outcomes are not guaranteed (Clause 12)' },
        { text: 'My 48-hour feedback responsibility and scope limitations (Clauses 8 & 11)' }
      ],
    };

    return NextResponse.json({ deal });
  } catch (error) {
    console.error('Get deal error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
