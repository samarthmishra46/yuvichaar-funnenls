'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import BrandInfoTab from '@/components/admin/tabs/BrandInfoTab';
import BrandResearchTab from '@/components/admin/tabs/BrandResearchTab';
import AdVideosTab from '@/components/admin/tabs/AdVideosTab';
import LandingPageTab from '@/components/admin/tabs/LandingPageTab';
import PaymentsTab from '@/components/admin/tabs/PaymentsTab';
import CustomSectionsTab from '@/components/admin/tabs/CustomSectionsTab';

interface Organization {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  logo?: string;
  industry?: string;
  accountManager?: string;
  status: string;
  landingPageUrl?: string;
  landingPageNotes?: string;
  payment: {
    totalAmount: number;
    payments: Array<{
      amount: number;
      date: string;
      note?: string;
      razorpayPaymentId?: string;
    }>;
  };
  customSections: Array<{
    id: string;
    title: string;
    contentType: 'richtext' | 'file' | 'link' | 'video';
    content?: string;
    fileUrl?: string;
    bunnyVideoId?: string;
    bunnyStreamUrl?: string;
    createdAt: string;
  }>;
  createdAt: string;
}

const statusBadgeVariant: Record<string, 'success' | 'warning' | 'error' | 'purple'> = {
  active: 'success',
  onboarding: 'purple',
  paused: 'warning',
  churned: 'error',
};

export default function OrganizationDetailPage() {
  const params = useParams();
  const orgId = params.id as string;
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrg = useCallback(async () => {
    try {
      const res = await fetch(`/api/organizations/${orgId}`);
      const data = await res.json();
      setOrg(data.organization);
    } catch {
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchOrg();
  }, [fetchOrg]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 !bg-[rgba(255,255,255,0.04)]" />
        <Skeleton className="h-6 w-48 !bg-[rgba(255,255,255,0.04)]" />
        <Skeleton className="h-96 w-full !bg-[rgba(255,255,255,0.04)]" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-16">
        <p className="text-[#64748b]">Organization not found</p>
        <Link href="/admin/organizations" className="text-[#f472b6] text-sm mt-2 inline-block hover:underline">
          ← Back to organizations
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <Link
          href="/admin/organizations"
          className="p-2 rounded-xl hover:bg-white/5 transition-colors text-[#94a3b8] mt-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            {org.logo && (
              <img
                src={org.logo}
                alt={org.name}
                className="w-10 h-10 rounded-xl object-contain bg-white/5 border border-white/10 p-1"
              />
            )}
            <h1 className="text-2xl font-bold text-white">{org.name}</h1>
            <Badge variant={statusBadgeVariant[org.status] || 'default'}>
              {org.status}
            </Badge>
          </div>
          <p className="text-sm text-[#64748b] mt-1">{org.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="brand-info">
        <TabsList className="!border-[rgba(255,255,255,0.06)]">
          <TabsTrigger value="brand-info" className="data-[state=active]:!text-[#f472b6] data-[state=active]:!border-[#f472b6]">Brand Info</TabsTrigger>
          <TabsTrigger value="research" className="data-[state=active]:!text-[#f472b6] data-[state=active]:!border-[#f472b6]">Research</TabsTrigger>
          <TabsTrigger value="videos" className="data-[state=active]:!text-[#f472b6] data-[state=active]:!border-[#f472b6]">Ad Videos</TabsTrigger>
          <TabsTrigger value="landing-page" className="data-[state=active]:!text-[#f472b6] data-[state=active]:!border-[#f472b6]">Landing Page</TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:!text-[#f472b6] data-[state=active]:!border-[#f472b6]">Payments</TabsTrigger>
          <TabsTrigger value="custom-sections" className="data-[state=active]:!text-[#f472b6] data-[state=active]:!border-[#f472b6]">Custom Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="brand-info">
          <BrandInfoTab org={org} onUpdate={fetchOrg} />
        </TabsContent>
        <TabsContent value="research">
          <BrandResearchTab orgId={orgId} />
        </TabsContent>
        <TabsContent value="videos">
          <AdVideosTab orgId={orgId} />
        </TabsContent>
        <TabsContent value="landing-page">
          <LandingPageTab org={org} onUpdate={fetchOrg} />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsTab org={org} onUpdate={fetchOrg} />
        </TabsContent>
        <TabsContent value="custom-sections">
          <CustomSectionsTab orgId={orgId} sections={org.customSections || []} onUpdate={fetchOrg} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
