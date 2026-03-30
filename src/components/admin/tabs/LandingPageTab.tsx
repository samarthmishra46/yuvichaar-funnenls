'use client';

import { useState } from 'react';
import { Loader2, ExternalLink, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface Organization {
  _id: string;
  landingPageUrl?: string;
  landingPageNotes?: string;
}

interface LandingPageTabProps {
  org: Organization;
  onUpdate: () => void;
}

export default function LandingPageTab({ org, onUpdate }: LandingPageTabProps) {
  const [saving, setSaving] = useState(false);
  const [url, setUrl] = useState(org.landingPageUrl || '');
  const [notes, setNotes] = useState(org.landingPageNotes || '');
  const [iframeError, setIframeError] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${org._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landingPageUrl: url, landingPageNotes: notes }),
      });

      if (!res.ok) {
        toast.error('Failed to save');
        return;
      }

      toast.success('Landing page info saved');
      onUpdate();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
        <CardContent className="space-y-5 pt-6">
          <Input
            id="lp-url"
            label="Landing Page URL"
            placeholder="https://client-landing.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setIframeError(false);
            }}
            className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white"
          />

          <Textarea
            id="lp-notes"
            label="Notes"
            placeholder="Any notes about the landing page..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white !min-h-[80px]"
          />

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {url && (
        <Card className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#f472b6]" />
                Page Preview
              </h4>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-[#f472b6] hover:text-[#f9a8d4] transition-colors"
              >
                Open in new tab
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {!iframeError ? (
              <div className="relative w-full rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)]" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={url}
                  className="absolute inset-0 w-full h-full border-0"
                  onError={() => setIframeError(true)}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-[rgba(255,255,255,0.1)] text-center">
                <Globe className="w-8 h-8 text-[#475569] mb-3" />
                <p className="text-sm text-[#64748b]">
                  This page cannot be embedded in an iframe.
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-sm text-[#f472b6] hover:underline flex items-center gap-1"
                >
                  Open directly <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
