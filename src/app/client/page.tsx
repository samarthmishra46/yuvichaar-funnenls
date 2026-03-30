'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Video, FileText, CreditCard, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Organization {
  _id: string;
  name: string;
  status: string;
  accountManager?: string;
  email?: string;
  phone?: string;
  payment: {
    totalAmount: number;
    payments: Array<{ amount: number }>;
  };
}

const statusBadgeVariant: Record<string, 'success' | 'warning' | 'error' | 'purple'> = {
  active: 'success',
  onboarding: 'purple',
  paused: 'warning',
  churned: 'error',
};

export default function ClientDashboard() {
  const { data: session } = useSession();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoCount, setVideoCount] = useState(0);
  const [researchCount, setResearchCount] = useState(0);

  useEffect(() => {
    if (session?.user?.orgId) {
      Promise.all([
        fetch(`/api/organizations/${session.user.orgId}`).then((r) => r.json()),
        fetch(`/api/organizations/${session.user.orgId}/videos`).then((r) => r.json()),
        fetch(`/api/organizations/${session.user.orgId}/research`).then((r) => r.json()),
      ])
        .then(([orgData, videosData, researchData]) => {
          setOrg(orgData.organization);
          setVideoCount(videosData.videos?.length || 0);
          setResearchCount(researchData.entries?.length || 0);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session?.user?.orgId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!org) {
    return <p className="text-gray-500 text-center py-16">Unable to load dashboard</p>;
  }

  const totalPaid = (org.payment?.payments || []).reduce((sum, p) => sum + p.amount, 0);
  const amountDue = (org.payment?.totalAmount || 0) - totalPaid;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {org.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
              <Badge variant={statusBadgeVariant[org.status] || 'default'}>
                {org.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">Welcome to your brand dashboard</p>
          </div>
        </div>

        {org.accountManager && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Account Manager:</span>
            <span className="text-sm font-semibold text-gray-700">{org.accountManager}</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-purple-50">
              <Video className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm font-medium text-gray-500">Videos Available</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{videoCount}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-pink-50">
              <FileText className="w-5 h-5 text-pink-500" />
            </div>
            <span className="text-sm font-medium text-gray-500">Research Docs</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{researchCount}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-red-50">
              <CreditCard className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-sm font-medium text-gray-500">Amount Due</span>
          </div>
          <p className={`text-3xl font-bold ${amountDue > 0 ? 'text-red-500' : 'text-green-500'}`}>
            ₹{Math.max(0, amountDue).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
