'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Users, Video, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Organization {
  _id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  payment: {
    totalAmount: number;
    payments: Array<{ amount: number }>;
  };
}

interface Stats {
  totalOrgs: number;
  activeOrgs: number;
  totalVideos: number;
  totalDue: number;
}

const statusBadgeVariant: Record<string, 'success' | 'warning' | 'error' | 'purple'> = {
  active: 'success',
  onboarding: 'purple',
  paused: 'warning',
  churned: 'error',
};

export default function AdminDashboardPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [stats, setStats] = useState<Stats>({ totalOrgs: 0, activeOrgs: 0, totalVideos: 0, totalDue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/organizations');
        const data = await res.json();
        const organizations: Organization[] = data.organizations || [];
        setOrgs(organizations);

        // Calculate stats
        const activeOrgs = organizations.filter((o) => o.status === 'active').length;
        let totalDue = 0;
        organizations.forEach((org) => {
          const paid = (org.payment?.payments || []).reduce((s, p) => s + p.amount, 0);
          const due = (org.payment?.totalAmount || 0) - paid;
          if (due > 0) totalDue += due;
        });

        setStats({
          totalOrgs: organizations.length,
          activeOrgs,
          totalVideos: 0, // Will be calculated separately if needed
          totalDue,
        });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full !bg-[rgba(255,255,255,0.04)]" />
          ))}
        </div>
        <Skeleton className="h-64 w-full !bg-[rgba(255,255,255,0.04)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-[#64748b] mt-1">Overview of your organizations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-[rgba(147,51,234,0.1)]">
              <Building2 className="w-5 h-5 text-[#a855f7]" />
            </div>
            <span className="text-sm font-medium text-[#64748b]">Total Orgs</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalOrgs}</p>
        </div>

        <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-[rgba(34,197,94,0.1)]">
              <Users className="w-5 h-5 text-[#4ade80]" />
            </div>
            <span className="text-sm font-medium text-[#64748b]">Active Orgs</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.activeOrgs}</p>
        </div>

        <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-[rgba(244,114,182,0.1)]">
              <Video className="w-5 h-5 text-[#f472b6]" />
            </div>
            <span className="text-sm font-medium text-[#64748b]">Videos Uploaded</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalVideos}</p>
        </div>

        <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-[rgba(248,113,113,0.1)]">
              <CreditCard className="w-5 h-5 text-[#f87171]" />
            </div>
            <span className="text-sm font-medium text-[#64748b]">Payments Due</span>
          </div>
          <p className="text-3xl font-bold text-white">₹{stats.totalDue.toLocaleString()}</p>
        </div>
      </div>

      {/* Recent Organizations */}
      <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl">
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent Organizations</h2>
          <Link href="/admin/organizations" className="text-sm text-[#f472b6] hover:text-[#f9a8d4] transition-colors">
            View all →
          </Link>
        </div>

        {orgs.length === 0 ? (
          <p className="text-sm text-[#64748b] text-center py-10">No organizations yet</p>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.04)]">
            {orgs.slice(0, 5).map((org) => (
              <Link
                key={org._id}
                href={`/admin/organizations/${org._id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9333ea] to-[#e91e8c] flex items-center justify-center text-white font-bold text-sm">
                    {org.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{org.name}</p>
                    <p className="text-xs text-[#64748b]">{org.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusBadgeVariant[org.status] || 'default'}>{org.status}</Badge>
                  <span className="text-xs text-[#475569] hidden sm:inline">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
