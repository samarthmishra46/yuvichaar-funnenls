'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Globe, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Organization {
  _id: string;
  landingPageUrl?: string;
  landingPageNotes?: string;
}

export default function ClientLandingPage() {
  const { data: session } = useSession();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

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
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!org) return <p className="text-gray-500 text-center py-16">Unable to load</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Landing Page</h1>

      {org.landingPageUrl ? (
        <>
          {/* Link button */}
          <a
            href={org.landingPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all"
          >
            <Globe className="w-5 h-5" />
            Visit Landing Page
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Notes */}
          {org.landingPageNotes && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{org.landingPageNotes}</p>
            </div>
          )}

          {/* Iframe preview */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Page Preview</span>
              <a href={org.landingPageUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-pink-500 hover:text-pink-600 flex items-center gap-1">
                Open <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            {!iframeError ? (
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={org.landingPageUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  onError={() => setIframeError(true)}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Globe className="w-8 h-8 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">This page cannot be embedded.</p>
                <a href={org.landingPageUrl} target="_blank" rel="noopener noreferrer" className="mt-2 text-sm text-pink-500 hover:underline">
                  Open directly →
                </a>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <Globe className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No landing page configured yet</p>
        </div>
      )}
    </div>
  );
}
