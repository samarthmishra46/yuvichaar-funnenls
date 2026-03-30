'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, ExternalLink, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ResearchEntry {
  _id: string;
  title: string;
  type: 'pdf' | 'googledoc';
  fileUrl?: string;
  docLink?: string;
  description?: string;
  createdAt: string;
}

export default function ClientResearchPage() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState<ResearchEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.orgId) {
      fetch(`/api/organizations/${session.user.orgId}/research`)
        .then((r) => r.json())
        .then((data) => setEntries(data.entries || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session?.user?.orgId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Brand Research</h1>

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No research documents available yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{entry.title}</h3>
                  <Badge variant={entry.type === 'pdf' ? 'pink' : 'purple'}>
                    {entry.type === 'pdf' ? 'PDF' : 'Google Doc'}
                  </Badge>
                </div>
                {entry.description && (
                  <p className="text-sm text-gray-500 truncate">{entry.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="ml-4">
                {entry.type === 'pdf' && entry.fileUrl && (
                  <a
                    href={entry.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-50 text-pink-600 text-sm font-medium hover:bg-pink-100 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    View / Download
                  </a>
                )}
                {entry.type === 'googledoc' && entry.docLink && (
                  <a
                    href={entry.docLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-600 text-sm font-medium hover:bg-purple-100 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Document
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
