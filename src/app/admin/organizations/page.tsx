'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Organization {
  _id: string;
  name: string;
  email: string;
  status: string;
  industry?: string;
  accountManager?: string;
  createdAt: string;
}

const statusBadgeVariant: Record<string, 'success' | 'warning' | 'error' | 'purple'> = {
  active: 'success',
  onboarding: 'purple',
  paused: 'warning',
  churned: 'error',
};

export default function OrganizationsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/organizations?${params.toString()}`);
      const data = await res.json();
      setOrgs(data.organizations || []);
    } catch {
      setOrgs([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Organizations</h1>
          <p className="text-sm text-[#64748b] mt-1">
            Manage your client organizations
          </p>
        </div>
        <Link href="/admin/organizations/new">
          <Button>
            <Plus className="w-4 h-4" />
            New Organization
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white text-sm placeholder:text-[#475569] outline-none focus:border-[#9333ea] focus:ring-2 focus:ring-[rgba(147,51,234,0.15)] transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white text-sm outline-none focus:border-[#9333ea] cursor-pointer appearance-none min-w-[140px]"
        >
          <option value="all">All Statuses</option>
          <option value="onboarding">Onboarding</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="churned">Churned</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full !bg-[rgba(255,255,255,0.04)]" />
          ))}
        </div>
      ) : orgs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#64748b] text-sm">No organizations found</p>
          <Link href="/admin/organizations/new" className="inline-block mt-4">
            <Button variant="outline" className="!border-[rgba(255,255,255,0.1)] !text-[#94a3b8]">
              <Plus className="w-4 h-4" />
              Create your first organization
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)]">
          <table className="w-full text-sm">
            <thead className="bg-[rgba(255,255,255,0.03)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden md:table-cell">
                  Industry
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">
                  Manager
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {orgs.map((org) => (
                <tr
                  key={org._id}
                  onClick={() => router.push(`/admin/organizations/${org._id}`)}
                  className="cursor-pointer hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="font-semibold text-white">{org.name}</p>
                      <p className="text-xs text-[#64748b] mt-0.5">{org.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[#94a3b8] hidden md:table-cell">
                    {org.industry || '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={statusBadgeVariant[org.status] || 'default'}>
                      {org.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-[#94a3b8] hidden lg:table-cell">
                    {org.accountManager || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-[#64748b] text-xs hidden lg:table-cell">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
