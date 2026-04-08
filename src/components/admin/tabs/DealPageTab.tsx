'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Deliverable {
  name: string;
  description: string;
  quantity: string;
  enabled: boolean;
}

interface TimelineItem {
  week: string;
  phase: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

interface FunnelNode {
  emoji: string;
  label: string;
  description: string;
}

interface FunnelBranchItem {
  text: string;
}

interface FunnelBranch {
  title: string;
  items: FunnelBranchItem[];
}

interface FunnelDiagram {
  topNote: string;
  nodes: FunnelNode[];
  buyBranch: FunnelBranch;
  noBuyBranch: FunnelBranch;
  outcomeLabel: string;
  outcomeText: string;
}

interface ConfirmationItem {
  text: string;
}

interface Clause {
  number: string;
  title: string;
  body: string;
  listItems?: string[];
}

interface ClauseSection {
  title: string;
  clauses: Clause[];
}

interface DealPage {
  proposalTitle?: string;
  goal?: string;
  target?: string;
  startDate?: string;
  adsCount?: number;
  socialVideosCount?: number;
  landingPagesCount?: number;
  fixedFee?: number;
  advanceAmount?: number;
  advanceWithGst?: number;
  balanceAmount?: number;
  balanceWithGst?: number;
  hasPerformanceFee?: boolean;
  perfBonus1Trigger?: string;
  perfBonus1Amount?: string;
  perfBonus2Trigger?: string;
  perfBonus2Amount?: string;
  customDeliverable?: string;
  customDeliverableDesc?: string;
  portfolioUrl?: string;
  whatsappNumber?: string;
  razorpayLink?: string;
  successItems?: string[];
  nextStepText?: string;
  deliverables?: Deliverable[];
  timeline?: TimelineItem[];
  stats?: Stat[];
  funnelDiagram?: FunnelDiagram;
  agreementIntro?: string;
  clauseSections?: ClauseSection[];
  confirmationItems?: ConfirmationItem[];
}

interface Organization {
  _id: string;
  name: string;
  onboarding?: {
    token?: string;
  };
  dealPage?: DealPage;
}

interface DealPageTabProps {
  org: Organization;
  onUpdate: () => void;
}

const getDefaultClauseSections = (): ClauseSection[] => [
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
];

export default function DealPageTab({ org, onUpdate }: DealPageTabProps) {
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<DealPage>({
    proposalTitle: org.dealPage?.proposalTitle || '60 Day Growth Marathon',
    goal: org.dealPage?.goal || 'Build an end-to-end D2C marketing funnel',
    target: org.dealPage?.target || '1,000 paying customers',
    startDate: org.dealPage?.startDate || '',
    adsCount: org.dealPage?.adsCount || 15,
    socialVideosCount: org.dealPage?.socialVideosCount || 12,
    landingPagesCount: org.dealPage?.landingPagesCount || 1,
    fixedFee: org.dealPage?.fixedFee || 449000,
    advanceAmount: org.dealPage?.advanceAmount || 224500,
    advanceWithGst: org.dealPage?.advanceWithGst || 264910,
    balanceAmount: org.dealPage?.balanceAmount || 224500,
    balanceWithGst: org.dealPage?.balanceWithGst || 264910,
    hasPerformanceFee: org.dealPage?.hasPerformanceFee !== false,
    perfBonus1Trigger: org.dealPage?.perfBonus1Trigger || '₹25,00,000',
    perfBonus1Amount: org.dealPage?.perfBonus1Amount || '₹1,00,000',
    perfBonus2Trigger: org.dealPage?.perfBonus2Trigger || '₹50,00,000',
    perfBonus2Amount: org.dealPage?.perfBonus2Amount || '₹1,00,000',
    customDeliverable: org.dealPage?.customDeliverable || '',
    customDeliverableDesc: org.dealPage?.customDeliverableDesc || '',
    portfolioUrl: org.dealPage?.portfolioUrl || '',
    whatsappNumber: org.dealPage?.whatsappNumber || '919999900001',
    razorpayLink: org.dealPage?.razorpayLink || '',
    successItems: org.dealPage?.successItems || [
      'Client portal is live and ready',
      'Signed MoU + receipt sent to your email',
      'WhatsApp group created with your team',
      'Kickoff call link sent on WhatsApp',
      'Brand question form sent on WhatsApp',
      "Yuvraj's personal welcome video sent"
    ],
    nextStepText: org.dealPage?.nextStepText || 'Check your WhatsApp — Yuvraj sent a personal welcome message and your kickoff call link is there.',
    deliverables: org.dealPage?.deliverables || [
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
    timeline: org.dealPage?.timeline || [
      { week: 'Week 1', phase: 'Strategy', description: 'Kickoff · brand deep-dive · funnel architecture · creative angles · audience framework' },
      { week: 'Wk 2–3', phase: 'Creative production', description: 'Scripts · storyboards · shoot days · editing · social media content' },
      { week: 'Wk 3–4', phase: 'Funnel build', description: 'Landing pages · checkout · profile optimised · all automations built and tested' },
      { week: 'Wk 4–5', phase: 'Approvals + QA', description: 'Ads reviewed · feedback incorporated · full funnel tested end to end' },
      { week: 'Day 21', phase: '🚀 Campaigns go live', description: 'Ads live · automations active · landing page live · marathon officially running' },
      { week: 'Wk 5–8', phase: 'Optimise + scale', description: 'Weekly reviews · scale winners · creative refresh · final push Days 50–60' },
      { week: 'Day 60', phase: 'Wrap + handover', description: '60-day results report · wrap call · all assets and logins handed over' }
    ],
    stats: org.dealPage?.stats || [
      { value: '75+', label: 'D2C brands trust us with their growth' },
      { value: '6×', label: 'Peak ROAS achieved for clients' },
      { value: '27%', label: 'Average landing page conversion rate' },
      { value: '60', label: 'Days fixed. Full funnel built and live.' }
    ],
    funnelDiagram: org.dealPage?.funnelDiagram || {
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
    agreementIntro: org.dealPage?.agreementIntro || 'This agreement defines the exact terms of the engagement. Read every clause. By signing, you confirm you have read, understood, and agreed to all terms.',
    clauseSections: org.dealPage?.clauseSections?.length ? org.dealPage.clauseSections : getDefaultClauseSections(),
    confirmationItems: org.dealPage?.confirmationItems || [
      { text: 'The exact deliverables and quantities in Clause 1' },
      { text: 'The payment schedule — advance on signing, balance on Day 30 (Clause 4)' },
      { text: 'Performance bonuses are only triggered on revenue milestones (Clause 5)' },
      { text: 'Revenue outcomes are not guaranteed (Clause 12)' },
      { text: 'My 48-hour feedback responsibility and scope limitations (Clauses 8 & 11)' }
    ],
  });

  // Sync form state when org prop changes (after save/refetch)
  useEffect(() => {
    setForm({
      proposalTitle: org.dealPage?.proposalTitle || '60 Day Growth Marathon',
      goal: org.dealPage?.goal || 'Build an end-to-end D2C marketing funnel',
      target: org.dealPage?.target || '1,000 paying customers',
      startDate: org.dealPage?.startDate || '',
      adsCount: org.dealPage?.adsCount || 15,
      socialVideosCount: org.dealPage?.socialVideosCount || 12,
      landingPagesCount: org.dealPage?.landingPagesCount || 1,
      fixedFee: org.dealPage?.fixedFee || 449000,
      advanceAmount: org.dealPage?.advanceAmount || 224500,
      advanceWithGst: org.dealPage?.advanceWithGst || 264910,
      balanceAmount: org.dealPage?.balanceAmount || 224500,
      balanceWithGst: org.dealPage?.balanceWithGst || 264910,
      hasPerformanceFee: org.dealPage?.hasPerformanceFee !== false,
      perfBonus1Trigger: org.dealPage?.perfBonus1Trigger || '₹25,00,000',
      perfBonus1Amount: org.dealPage?.perfBonus1Amount || '₹1,00,000',
      perfBonus2Trigger: org.dealPage?.perfBonus2Trigger || '₹50,00,000',
      perfBonus2Amount: org.dealPage?.perfBonus2Amount || '₹1,00,000',
      customDeliverable: org.dealPage?.customDeliverable || '',
      customDeliverableDesc: org.dealPage?.customDeliverableDesc || '',
      portfolioUrl: org.dealPage?.portfolioUrl || '',
      whatsappNumber: org.dealPage?.whatsappNumber || '919999900001',
      razorpayLink: org.dealPage?.razorpayLink || '',
      successItems: org.dealPage?.successItems || [
        'Client portal is live and ready',
        'Signed MoU + receipt sent to your email',
        'WhatsApp group created with your team',
        'Kickoff call link sent on WhatsApp',
        'Brand question form sent on WhatsApp',
        "Yuvraj's personal welcome video sent"
      ],
      nextStepText: org.dealPage?.nextStepText || 'Check your WhatsApp — Yuvraj sent a personal welcome message and your kickoff call link is there.',
      deliverables: org.dealPage?.deliverables || [
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
      timeline: org.dealPage?.timeline || [
        { week: 'Week 1', phase: 'Strategy', description: 'Kickoff · brand deep-dive · funnel architecture · creative angles · audience framework' },
        { week: 'Wk 2–3', phase: 'Creative production', description: 'Scripts · storyboards · shoot days · editing · social media content' },
        { week: 'Wk 3–4', phase: 'Funnel build', description: 'Landing pages · checkout · profile optimised · all automations built and tested' },
        { week: 'Wk 4–5', phase: 'Approvals + QA', description: 'Ads reviewed · feedback incorporated · full funnel tested end to end' },
        { week: 'Day 21', phase: '🚀 Campaigns go live', description: 'Ads live · automations active · landing page live · marathon officially running' },
        { week: 'Wk 5–8', phase: 'Optimise + scale', description: 'Weekly reviews · scale winners · creative refresh · final push Days 50–60' },
        { week: 'Day 60', phase: 'Wrap + handover', description: '60-day results report · wrap call · all assets and logins handed over' }
      ],
      stats: org.dealPage?.stats || [
        { value: '75+', label: 'D2C brands trust us with their growth' },
        { value: '6×', label: 'Peak ROAS achieved for clients' },
        { value: '27%', label: 'Average landing page conversion rate' },
        { value: '60', label: 'Days fixed. Full funnel built and live.' }
      ],
      funnelDiagram: org.dealPage?.funnelDiagram || {
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
      agreementIntro: org.dealPage?.agreementIntro || 'This agreement defines the exact terms of the engagement. Read every clause. By signing, you confirm you have read, understood, and agreed to all terms.',
      clauseSections: org.dealPage?.clauseSections?.length ? org.dealPage.clauseSections : getDefaultClauseSections(),
      confirmationItems: org.dealPage?.confirmationItems || [
        { text: 'The exact deliverables and quantities in Clause 1' },
        { text: 'The payment schedule — advance on signing, balance on Day 30 (Clause 4)' },
        { text: 'Performance bonuses are only triggered on revenue milestones (Clause 5)' },
        { text: 'Revenue outcomes are not guaranteed (Clause 12)' },
        { text: 'My 48-hour feedback responsibility and scope limitations (Clauses 8 & 11)' }
      ],
    });
  }, [org]);

  const dealPageUrl = org.onboarding?.token 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/deal/${org.onboarding.token}`
    : null;

  const updateField = (field: keyof DealPage, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('Saving form data:', JSON.stringify(form, null, 2));
      const res = await fetch(`/api/organizations/${org._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealPage: form }),
      });
      const data = await res.json();
      console.log('Save response:', JSON.stringify(data, null, 2));
      if (res.ok) {
        toast.success('Deal page settings saved');
        onUpdate();
      } else {
        toast.error('Failed to save: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Error saving deal page settings');
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    if (dealPageUrl) {
      navigator.clipboard.writeText(dealPageUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const calculateGst = (amount: number) => Math.round(amount * 1.18);

  const updateFixedFee = (value: number) => {
    const half = Math.round(value / 2);
    const halfWithGst = calculateGst(half);
    setForm(prev => ({
      ...prev,
      fixedFee: value,
      advanceAmount: half,
      advanceWithGst: halfWithGst,
      balanceAmount: half,
      balanceWithGst: halfWithGst,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Deal Page Link */}
      {dealPageUrl && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-purple-900 mb-1">Client Deal Page Link</p>
                <p className="text-xs text-purple-700 truncate">{dealPageUrl}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyLink}>
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
                <a href={dealPageUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proposal Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Proposal Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Proposal Title</label>
            <Input
              value={form.proposalTitle}
              onChange={(e) => updateField('proposalTitle', e.target.value)}
              placeholder="e.g., 60 Day Growth Marathon"
            />
            <p className="text-xs text-gray-500 mt-1">This appears as the main title on the deal page and in the service agreement.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Engagement Goal</label>
              <Input
                value={form.goal}
                onChange={(e) => updateField('goal', e.target.value)}
                placeholder="e.g., Build an end-to-end D2C marketing funnel"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Target Milestone</label>
              <Input
                value={form.target}
                onChange={(e) => updateField('target', e.target.value)}
                placeholder="e.g., 1,000 paying customers"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
            <Input
              value={form.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              placeholder="e.g., 15th January 2025"
            />
          </div>
        </CardContent>
      </Card>

      {/* Deliverables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Deliverables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">Toggle deliverables on/off and edit name, description, and quantity for each.</p>
          <div className="space-y-3">
            {form.deliverables?.map((deliverable, index) => (
              <div key={index} className={`p-4 rounded-lg border ${deliverable.enabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={deliverable.enabled}
                    onChange={() => {
                      const newDeliverables = [...(form.deliverables || [])];
                      newDeliverables[index] = { ...newDeliverables[index], enabled: !deliverable.enabled };
                      setForm(prev => ({ ...prev, deliverables: newDeliverables }));
                    }}
                    className="w-5 h-5 mt-1 rounded border-gray-300"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <div className="md:col-span-2">
                        <Input
                          value={deliverable.name}
                          onChange={(e) => {
                            const newDeliverables = [...(form.deliverables || [])];
                            newDeliverables[index] = { ...newDeliverables[index], name: e.target.value };
                            setForm(prev => ({ ...prev, deliverables: newDeliverables }));
                          }}
                          placeholder="Deliverable name"
                          className="font-medium"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          value={deliverable.quantity}
                          onChange={(e) => {
                            const newDeliverables = [...(form.deliverables || [])];
                            newDeliverables[index] = { ...newDeliverables[index], quantity: e.target.value };
                            setForm(prev => ({ ...prev, deliverables: newDeliverables }));
                          }}
                          placeholder="Quantity (e.g., 15 ads)"
                        />
                      </div>
                    </div>
                    <Input
                      value={deliverable.description}
                      onChange={(e) => {
                        const newDeliverables = [...(form.deliverables || [])];
                        newDeliverables[index] = { ...newDeliverables[index], description: e.target.value };
                        setForm(prev => ({ ...prev, deliverables: newDeliverables }));
                      }}
                      placeholder="Description"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newDeliverables = [...(form.deliverables || []), { name: 'New deliverable', description: 'Description here', quantity: 'Quantity', enabled: true }];
              setForm(prev => ({ ...prev, deliverables: newDeliverables }));
            }}
          >
            + Add Deliverable
          </Button>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">Edit the timeline phases shown on the deal page.</p>
          <div className="space-y-3">
            {form.timeline?.map((item, index) => (
              <div key={index} className="p-3 rounded-lg border bg-white border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                  <Input
                    value={item.week}
                    onChange={(e) => {
                      const newTimeline = [...(form.timeline || [])];
                      newTimeline[index] = { ...newTimeline[index], week: e.target.value };
                      setForm(prev => ({ ...prev, timeline: newTimeline }));
                    }}
                    placeholder="Week"
                    className="md:col-span-1"
                  />
                  <Input
                    value={item.phase}
                    onChange={(e) => {
                      const newTimeline = [...(form.timeline || [])];
                      newTimeline[index] = { ...newTimeline[index], phase: e.target.value };
                      setForm(prev => ({ ...prev, timeline: newTimeline }));
                    }}
                    placeholder="Phase"
                    className="md:col-span-2"
                  />
                  <Input
                    value={item.description}
                    onChange={(e) => {
                      const newTimeline = [...(form.timeline || [])];
                      newTimeline[index] = { ...newTimeline[index], description: e.target.value };
                      setForm(prev => ({ ...prev, timeline: newTimeline }));
                    }}
                    placeholder="Description"
                    className="md:col-span-3"
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newTimeline = [...(form.timeline || []), { week: 'Week X', phase: 'New phase', description: 'Description' }];
              setForm(prev => ({ ...prev, timeline: newTimeline }));
            }}
          >
            + Add Timeline Item
          </Button>
        </CardContent>
      </Card>

      {/* Stats (Why Yuvichaar Funnels) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Stats (Why Yuvichaar Funnels)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">Edit the stats shown in the &quot;Why Yuvichaar Funnels&quot; section.</p>
          <div className="space-y-3">
            {form.stats?.map((stat, index) => (
              <div key={index} className="p-3 rounded-lg border bg-white border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Input
                    value={stat.value}
                    onChange={(e) => {
                      const newStats = [...(form.stats || [])];
                      newStats[index] = { ...newStats[index], value: e.target.value };
                      setForm(prev => ({ ...prev, stats: newStats }));
                    }}
                    placeholder="Value (e.g., 75+)"
                    className="md:col-span-1 font-bold"
                  />
                  <Input
                    value={stat.label}
                    onChange={(e) => {
                      const newStats = [...(form.stats || [])];
                      newStats[index] = { ...newStats[index], label: e.target.value };
                      setForm(prev => ({ ...prev, stats: newStats }));
                    }}
                    placeholder="Label"
                    className="md:col-span-3"
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newStats = [...(form.stats || []), { value: '0', label: 'New stat' }];
              setForm(prev => ({ ...prev, stats: newStats }));
            }}
          >
            + Add Stat
          </Button>
        </CardContent>
      </Card>

      {/* Funnel Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Funnel Diagram</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">Edit the funnel diagram shown on the proposal page. Use {'{adsCount}'}, {'{socialVideosCount}'}, {'{landingPagesCount}'} as placeholders.</p>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Top Note</label>
            <Input
              value={form.funnelDiagram?.topNote || ''}
              onChange={(e) => setForm(prev => ({ ...prev, funnelDiagram: { ...prev.funnelDiagram!, topNote: e.target.value } }))}
              placeholder="e.g., People scrolling Instagram & Facebook"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Funnel Nodes</label>
            <div className="space-y-3">
              {form.funnelDiagram?.nodes?.map((node, index) => (
                <div key={index} className="p-3 rounded-lg border bg-white border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                    <Input
                      value={node.emoji}
                      onChange={(e) => {
                        const newNodes = [...(form.funnelDiagram?.nodes || [])];
                        newNodes[index] = { ...newNodes[index], emoji: e.target.value };
                        setForm(prev => ({ ...prev, funnelDiagram: { ...prev.funnelDiagram!, nodes: newNodes } }));
                      }}
                      placeholder="Emoji"
                      className="md:col-span-1"
                    />
                    <Input
                      value={node.label}
                      onChange={(e) => {
                        const newNodes = [...(form.funnelDiagram?.nodes || [])];
                        newNodes[index] = { ...newNodes[index], label: e.target.value };
                        setForm(prev => ({ ...prev, funnelDiagram: { ...prev.funnelDiagram!, nodes: newNodes } }));
                      }}
                      placeholder="Label"
                      className="md:col-span-2"
                    />
                    <Input
                      value={node.description}
                      onChange={(e) => {
                        const newNodes = [...(form.funnelDiagram?.nodes || [])];
                        newNodes[index] = { ...newNodes[index], description: e.target.value };
                        setForm(prev => ({ ...prev, funnelDiagram: { ...prev.funnelDiagram!, nodes: newNodes } }));
                      }}
                      placeholder="Description"
                      className="md:col-span-3"
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                const newNodes = [...(form.funnelDiagram?.nodes || []), { emoji: '📦', label: 'New step', description: 'Description' }];
                setForm(prev => ({ ...prev, funnelDiagram: { ...prev.funnelDiagram!, nodes: newNodes } }));
              }}
            >
              + Add Node
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Buy Branch Title</label>
              <Input
                value={form.funnelDiagram?.buyBranch?.title || ''}
                onChange={(e) => setForm(prev => ({ ...prev, funnelDiagram: { ...prev.funnelDiagram!, buyBranch: { ...prev.funnelDiagram!.buyBranch, title: e.target.value } } }))}
              />
              <div className="mt-2 space-y-2">
                {form.funnelDiagram?.buyBranch?.items?.map((item, index) => (
                  <Input
                    key={index}
                    value={item.text}
                    onChange={(e) => {
                      const newItems = [...(form.funnelDiagram?.buyBranch?.items || [])];
                      newItems[index] = { text: e.target.value };
                      setForm(prev => ({ ...prev, funnelDiagram: { ...prev.funnelDiagram!, buyBranch: { ...prev.funnelDiagram!.buyBranch, items: newItems } } }));
                    }}
                    placeholder="Item text"
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newItems = [...(form.funnelDiagram?.buyBranch?.items || []), { text: 'New item' }];
                    setForm(prev => ({ ...prev, funnelDiagram: { ...prev.funnelDiagram!, buyBranch: { ...prev.funnelDiagram!.buyBranch, items: newItems } } }));
                  }}
                >
                  + Add Item
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">No-Buy Branch Title</label>
              <Input
                value={form.funnelDiagram?.noBuyBranch?.title || ''}
                onChange={(e) => setForm(prev => ({ ...prev, funnelDiagram: { ...prev.funnelDiagram!, noBuyBranch: { ...prev.funnelDiagram!.noBuyBranch, title: e.target.value } } }))}
              />
              <div className="mt-2 space-y-2">
                {form.funnelDiagram?.noBuyBranch?.items?.map((item, index) => (
                  <Input
                    key={index}
                    value={item.text}
                    onChange={(e) => {
                      const newItems = [...(form.funnelDiagram?.noBuyBranch?.items || [])];
                      newItems[index] = { text: e.target.value };
                      setForm(prev => ({ ...prev, funnelDiagram: { ...prev.funnelDiagram!, noBuyBranch: { ...prev.funnelDiagram!.noBuyBranch, items: newItems } } }));
                    }}
                    placeholder="Item text"
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newItems = [...(form.funnelDiagram?.noBuyBranch?.items || []), { text: 'New item' }];
                    setForm(prev => ({ ...prev, funnelDiagram: { ...prev.funnelDiagram!, noBuyBranch: { ...prev.funnelDiagram!.noBuyBranch, items: newItems } } }));
                  }}
                >
                  + Add Item
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Outcome Label</label>
              <Input
                value={form.funnelDiagram?.outcomeLabel || ''}
                onChange={(e) => setForm(prev => ({ ...prev, funnelDiagram: { ...prev.funnelDiagram!, outcomeLabel: e.target.value } }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Outcome Text</label>
              <Input
                value={form.funnelDiagram?.outcomeText || ''}
                onChange={(e) => setForm(prev => ({ ...prev, funnelDiagram: { ...prev.funnelDiagram!, outcomeText: e.target.value } }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Agreement Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Agreement Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Agreement Intro Text</label>
            <Input
              value={form.agreementIntro || ''}
              onChange={(e) => updateField('agreementIntro', e.target.value)}
              placeholder="This agreement defines the exact terms..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Confirmation Checkboxes (before signing)</label>
            <div className="space-y-2">
              {form.confirmationItems?.map((item, index) => (
                <Input
                  key={index}
                  value={item.text}
                  onChange={(e) => {
                    const newItems = [...(form.confirmationItems || [])];
                    newItems[index] = { text: e.target.value };
                    setForm(prev => ({ ...prev, confirmationItems: newItems }));
                  }}
                  placeholder="Confirmation text"
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                const newItems = [...(form.confirmationItems || []), { text: 'New confirmation item' }];
                setForm(prev => ({ ...prev, confirmationItems: newItems }));
              }}
            >
              + Add Confirmation Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Service Agreement Clauses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Agreement Clauses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-500">Edit all clauses in the service agreement. Use placeholders like {'{company}'}, {'{proposalTitle}'}, {'{adsCount}'}, {'{fixedFee}'}, etc.</p>
          
          {form.clauseSections?.map((section, sectionIndex) => (
            <div key={sectionIndex} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Input
                  value={section.title}
                  onChange={(e) => {
                    const newSections = [...(form.clauseSections || [])];
                    newSections[sectionIndex] = { ...newSections[sectionIndex], title: e.target.value };
                    setForm(prev => ({ ...prev, clauseSections: newSections }));
                  }}
                  className="font-semibold text-purple-700"
                  placeholder="Section title"
                />
              </div>
              
              {section.clauses.map((clause, clauseIndex) => (
                <div key={clauseIndex} className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Input
                      value={clause.number}
                      onChange={(e) => {
                        const newSections = [...(form.clauseSections || [])];
                        newSections[sectionIndex].clauses[clauseIndex] = { ...clause, number: e.target.value };
                        setForm(prev => ({ ...prev, clauseSections: newSections }));
                      }}
                      placeholder="Clause #"
                      className="md:col-span-1"
                    />
                    <Input
                      value={clause.title}
                      onChange={(e) => {
                        const newSections = [...(form.clauseSections || [])];
                        newSections[sectionIndex].clauses[clauseIndex] = { ...clause, title: e.target.value };
                        setForm(prev => ({ ...prev, clauseSections: newSections }));
                      }}
                      placeholder="Clause title"
                      className="md:col-span-3"
                    />
                  </div>
                  <textarea
                    value={clause.body}
                    onChange={(e) => {
                      const newSections = [...(form.clauseSections || [])];
                      newSections[sectionIndex].clauses[clauseIndex] = { ...clause, body: e.target.value };
                      setForm(prev => ({ ...prev, clauseSections: newSections }));
                    }}
                    placeholder="Clause body text"
                    className="w-full p-2 border rounded text-sm min-h-[60px]"
                  />
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">List items (one per line)</label>
                    <textarea
                      value={(clause.listItems || []).join('\n')}
                      onChange={(e) => {
                        const newSections = [...(form.clauseSections || [])];
                        newSections[sectionIndex].clauses[clauseIndex] = { 
                          ...clause, 
                          listItems: e.target.value.split('\n').filter(item => item.trim()) 
                        };
                        setForm(prev => ({ ...prev, clauseSections: newSections }));
                      }}
                      placeholder="Enter list items, one per line"
                      className="w-full p-2 border rounded text-sm min-h-[80px]"
                    />
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newSections = [...(form.clauseSections || [])];
                  newSections[sectionIndex].clauses.push({ number: `Clause ${newSections[sectionIndex].clauses.length + 1}`, title: 'New clause', body: '', listItems: [] });
                  setForm(prev => ({ ...prev, clauseSections: newSections }));
                }}
              >
                + Add Clause to {section.title}
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const newSections = [...(form.clauseSections || []), { title: 'New Section', clauses: [] }];
              setForm(prev => ({ ...prev, clauseSections: newSections }));
            }}
          >
            + Add Section
          </Button>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Fixed Fee (₹)</label>
            <Input
              type="number"
              value={form.fixedFee}
              onChange={(e) => updateFixedFee(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 mt-1">Advance and balance will be auto-calculated as 50% each + 18% GST</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-xs text-gray-500">Advance (50%)</p>
              <p className="font-semibold">₹{form.advanceAmount?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Advance + GST</p>
              <p className="font-semibold">₹{form.advanceWithGst?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Balance (50%)</p>
              <p className="font-semibold">₹{form.balanceAmount?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Balance + GST</p>
              <p className="font-semibold">₹{form.balanceWithGst?.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="hasPerformanceFee"
              checked={form.hasPerformanceFee}
              onChange={(e) => updateField('hasPerformanceFee', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="hasPerformanceFee" className="text-sm font-medium text-gray-700">
              Include Performance Fee (₹2,00,000)
            </label>
          </div>

          {form.hasPerformanceFee && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Bonus 1 Trigger</label>
                <Input
                  value={form.perfBonus1Trigger}
                  onChange={(e) => updateField('perfBonus1Trigger', e.target.value)}
                  placeholder="e.g., ₹25,00,000"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Bonus 1 Amount</label>
                <Input
                  value={form.perfBonus1Amount}
                  onChange={(e) => updateField('perfBonus1Amount', e.target.value)}
                  placeholder="e.g., ₹1,00,000"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Bonus 2 Trigger</label>
                <Input
                  value={form.perfBonus2Trigger}
                  onChange={(e) => updateField('perfBonus2Trigger', e.target.value)}
                  placeholder="e.g., ₹50,00,000"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Bonus 2 Amount</label>
                <Input
                  value={form.perfBonus2Amount}
                  onChange={(e) => updateField('perfBonus2Amount', e.target.value)}
                  placeholder="e.g., ₹1,00,000"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Links & Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Links & Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Portfolio URL</label>
            <Input
              value={form.portfolioUrl}
              onChange={(e) => updateField('portfolioUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">WhatsApp Number (with country code)</label>
            <Input
              value={form.whatsappNumber}
              onChange={(e) => updateField('whatsappNumber', e.target.value)}
              placeholder="e.g., 919999900001"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Razorpay Payment Link</label>
            <Input
              value={form.razorpayLink}
              onChange={(e) => updateField('razorpayLink', e.target.value)}
              placeholder="https://rzp.io/..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Success Screen Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Success Screen (What Client Gets)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">These items appear on the success screen after payment. Toggle off items this client won&apos;t receive.</p>
          <div className="space-y-2">
            {form.successItems?.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => {
                    const newItems = form.successItems?.filter((_, i) => i !== index) || [];
                    setForm(prev => ({ ...prev, successItems: newItems }));
                  }}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Input
                  value={item}
                  onChange={(e) => {
                    const newItems = [...(form.successItems || [])];
                    newItems[index] = e.target.value;
                    setForm(prev => ({ ...prev, successItems: newItems }));
                  }}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newItems = [...(form.successItems || []), 'New item'];
              setForm(prev => ({ ...prev, successItems: newItems }));
            }}
          >
            + Add Item
          </Button>
          <div className="pt-4 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Next Step Text</label>
            <Input
              value={form.nextStepText}
              onChange={(e) => setForm(prev => ({ ...prev, nextStepText: e.target.value }))}
              placeholder="What the client should do next..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Deal Page Settings
        </Button>
      </div>
    </div>
  );
}
