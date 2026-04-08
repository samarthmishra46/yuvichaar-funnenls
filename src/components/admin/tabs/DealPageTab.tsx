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
