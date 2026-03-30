'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Building2, Mail, Phone, Globe, MapPin, Briefcase, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
}

const statusBadgeVariant: Record<string, 'success' | 'warning' | 'error' | 'purple'> = {
  active: 'success',
  onboarding: 'purple',
  paused: 'warning',
  churned: 'error',
};

export default function ClientBrandPage() {
  const { data: session } = useSession();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.orgId) {
      fetch(`/api/organizations/${session.user.orgId}`)
        .then((r) => r.json())
        .then((data) => setOrg(data.organization))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session?.user?.orgId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!org) return <p className="text-gray-500 text-center py-16">Unable to load brand info</p>;

  const fields = [
    { icon: Mail, label: 'Email', value: org.email },
    { icon: Phone, label: 'Phone', value: org.phone },
    { icon: Globe, label: 'Website', value: org.website },
    { icon: MapPin, label: 'Address', value: org.address },
    { icon: Briefcase, label: 'Industry', value: org.industry },
    { icon: User, label: 'Account Manager', value: org.accountManager },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Brand Info</h1>

      {/* Brand header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {org.logo ? (
            <img src={org.logo} alt={org.name} className="w-16 h-16 rounded-2xl object-contain bg-gray-50 border border-gray-100 p-2" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {org.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">{org.name}</h2>
              <Badge variant={statusBadgeVariant[org.status] || 'default'}>{org.status}</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">{org.email}</p>
          </div>
        </div>
      </div>

      {/* Info fields */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm divide-y divide-gray-100">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.label} className="flex items-center px-6 py-4">
              <div className="flex items-center gap-3 w-48 shrink-0">
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">{field.label}</span>
              </div>
              <span className="text-sm text-gray-900 font-medium">
                {field.value || <span className="text-gray-300">Not set</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
