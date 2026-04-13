'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StaffLandingPageTabProps {
  orgId: string;
}

interface OrgData {
  landingPageUrl?: string;
  landingPageNotes?: string;
}

export default function StaffLandingPageTab({ orgId }: StaffLandingPageTabProps) {
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await fetch(`/api/organizations/${orgId}`);
        const data = await res.json();
        setOrgData({
          landingPageUrl: data.organization?.landingPageUrl || '',
          landingPageNotes: data.organization?.landingPageNotes || '',
        });
      } catch {
        setOrgData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, [orgId]);

  if (loading) {
    return <Skeleton className="h-96 w-full !bg-[#f8f9fa]" />;
  }

  if (!orgData?.landingPageUrl) {
    return (
      <div className="text-center py-12">
        <Globe className="w-10 h-10 mx-auto text-[#475569] mb-3" />
        <p className="text-[#64748b] text-sm">No landing page URL set yet</p>
        <p className="text-xs text-[#94a3b8] mt-1">The admin will add the landing page URL</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-[#0f172a] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#e91e8c]" />
                Landing Page
              </h4>
              <p className="text-sm text-[#64748b] mt-1">{orgData.landingPageUrl}</p>
            </div>
            <a
              href={orgData.landingPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f8f9fa] text-[#64748b] text-sm hover:bg-[#f1f5f9] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
          </div>

          {orgData.landingPageNotes && (
            <div className="mt-4 p-3 bg-[#f8f9fa] rounded-lg">
              <p className="text-xs text-[#475569] font-semibold mb-1">Notes</p>
              <p className="text-sm text-[#64748b]">{orgData.landingPageNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-[#0f172a] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#e91e8c]" />
              Page Preview
            </h4>
          </div>

          {iframeError ? (
            <div className="bg-[#f8f9fa] rounded-xl p-8 text-center">
              <p className="text-[#64748b] text-sm mb-2">
                This page cannot be previewed in an iframe.
              </p>
              <a
                href={orgData.landingPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e91e8c] text-sm hover:underline inline-flex items-center gap-1"
              >
                Open in new tab <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-[#e2e8f0]">
              <iframe
                src={orgData.landingPageUrl}
                className="w-full h-[500px]"
                onError={() => setIframeError(true)}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Only Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>View Only:</strong> Landing page settings can only be edited by admins.
        </p>
      </div>
    </div>
  );
}
