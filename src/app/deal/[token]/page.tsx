'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DealPageContent from '@/components/deal/DealPageContent';

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

interface DealData {
  company: string;
  email: string;
  phone?: string;
  proposalTitle: string;
  goal: string;
  target: string;
  startDate?: string;
  adsCount: number;
  socialVideosCount: number;
  landingPagesCount: number;
  fixedFee: number;
  advanceAmount: number;
  advanceWithGst: number;
  balanceAmount: number;
  balanceWithGst: number;
  hasPerformanceFee: boolean;
  performanceFeeAmount: string;
  performanceBonuses?: Array<{ trigger: string; amount: string }>;
  // Legacy fields for backward compatibility
  perfBonus1Trigger?: string;
  perfBonus1Amount?: string;
  perfBonus2Trigger?: string;
  perfBonus2Amount?: string;
  customDeliverable?: string;
  customDeliverableDesc?: string;
  portfolioUrl?: string;
  whatsappNumber: string;
  razorpayLink?: string;
  successItems: string[];
  nextStepText: string;
  deliverables: Deliverable[];
  timeline: TimelineItem[];
  stats: Stat[];
  funnelDiagram: FunnelDiagram;
  agreementIntro: string;
  clauseSections: ClauseSection[];
  confirmationItems: ConfirmationItem[];
}

export default function DealPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const res = await fetch(`/api/deal/${token}`);
        const result = await res.json();
        if (res.ok) {
          setData(result.deal);
        } else {
          setError(result.error || 'Deal not found');
        }
      } catch (err) {
        setError('Failed to load deal');
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Deal Not Found</h1>
          <p className="text-gray-500">{error || 'This deal link is invalid or has expired.'}</p>
        </div>
      </div>
    );
  }

  return <DealPageContent data={data} token={token} />;
}
