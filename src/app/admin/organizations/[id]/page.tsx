'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import BrandInfoTab from '@/components/admin/tabs/BrandInfoTab';
import BrandResearchTab from '@/components/admin/tabs/BrandResearchTab';
import AdVideosTab from '@/components/admin/tabs/AdVideosTab';
import LandingPageTab from '@/components/admin/tabs/LandingPageTab';
import PaymentsTab from '@/components/admin/tabs/PaymentsTab';
import CustomSectionsTab from '@/components/admin/tabs/CustomSectionsTab';
import RoadmapTab from '@/components/admin/tabs/RoadmapTab';
import ClientTasksTab from '@/components/admin/tabs/ClientTasksTab';
import DealPageTab from '@/components/admin/tabs/DealPageTab';

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
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

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
        <Skeleton className="h-10 w-64 !bg-[#f8f9fa]" />
        <Skeleton className="h-6 w-48 !bg-[#f8f9fa]" />
        <Skeleton className="h-96 w-full !bg-[#f8f9fa]" />
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
          className="p-2 rounded-xl hover:bg-[#f8f9fa] transition-colors text-[#64748b] mt-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            {org.logo && (
              <img
                src={org.logo}
                alt={org.name}
                className="w-10 h-10 rounded-xl object-contain bg-[#f8f9fa] border border-[#e2e8f0] p-1"
              />
            )}
            <h1 className="text-2xl font-bold text-[#0f172a]">{org.name}</h1>
            <Badge variant={statusBadgeVariant[org.status] || 'default'}>
              {org.status}
            </Badge>
          </div>
          <p className="text-sm text-[#64748b] mt-1">{org.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="!border-red-200 !text-red-600 hover:!bg-red-50"
          disabled={deleting}
          onClick={async () => {
            if (!confirm(`Are you sure you want to delete "${org.name}"? This will permanently delete all data including videos, research, roadmaps, and payments. This action cannot be undone.`)) {
              return;
            }
            setDeleting(true);
            try {
              const res = await fetch(`/api/organizations/${orgId}`, { method: 'DELETE' });
              if (res.ok) {
                toast.success('Organization deleted');
                router.push('/admin/organizations');
              } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to delete');
              }
            } catch {
              toast.error('Failed to delete organization');
            } finally {
              setDeleting(false);
            }
          }}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="brand-info">
        <TabsList className="!border-[rgba(255,255,255,0.06)]">
          <TabsTrigger value="brand-info" className="data-[state=active]:!text-[#f472b6] data-[state=active]:!border-[#f472b6]">Brand Info</TabsTrigger>
          <TabsTrigger value="research" className="data-[state=active]:!text-[#f472b6] data-[state=active]:!border-[#f472b6]">Research</TabsTrigger>
          <TabsTrigger value="videos" className="data-[state=active]:!text-[#f472b6] data-[state=active]:!border-[#f472b6]">Ad Videos</TabsTrigger>
          <TabsTrigger value="landing-page" className="data-[state=active]:!text-[#f472b6] data-[state=active]:!border-[#f472b6]">Landing Page</TabsTrigger>
          <TabsTrigger value="roadmap" className="data-[state=active]:!text-[#f472b6] data-[state=active]:!border-[#f472b6]">Roadmap</TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:!text-[#f472b6] data-[state=active]:!border-[#f472b6]">Payments</TabsTrigger>
          <TabsTrigger value="client-tasks" className="data-[state=active]:!text-[#f472b6] data-[state=active]:!border-[#f472b6]">Client Tasks</TabsTrigger>
          <TabsTrigger value="deal-page" className="data-[state=active]:!text-[#f472b6] data-[state=active]:!border-[#f472b6]">Deal Page</TabsTrigger>
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
        <TabsContent value="roadmap">
          <RoadmapTab orgId={orgId} />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsTab org={org} onUpdate={fetchOrg} />
        </TabsContent>
        <TabsContent value="client-tasks">
          <ClientTasksTab orgId={orgId} orgName={org.name} />
        </TabsContent>
        <TabsContent value="deal-page">
          <DealPageTab org={org} onUpdate={fetchOrg} />
        </TabsContent>
        <TabsContent value="custom-sections">
          <CustomSectionsTab orgId={orgId} sections={org.customSections || []} onUpdate={fetchOrg} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
