'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ExternalLink, Download, FileText, Link as LinkIcon, Layers } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import BunnyPlayer from '@/components/shared/BunnyPlayer';

interface CustomSection {
  id: string;
  title: string;
  contentType: 'richtext' | 'file' | 'link' | 'video';
  content?: string;
  fileUrl?: string;
  bunnyVideoId?: string;
  bunnyStreamUrl?: string;
  createdAt: string;
}

export default function ClientCustomSectionPage() {
  const params = useParams();
  const sectionId = params.sectionId as string;
  const { data: session } = useSession();
  const [section, setSection] = useState<CustomSection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.orgId) {
      fetch(`/api/organizations/${session.user.orgId}/sections`)
        .then((r) => r.json())
        .then((data) => {
          const found = (data.sections || []).find((s: CustomSection) => s.id === sectionId);
          setSection(found || null);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session?.user?.orgId, sectionId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="text-center py-16">
        <Layers className="w-10 h-10 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Section not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{section.title}</h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        {/* Rich Text */}
        {section.contentType === 'richtext' && (
          <div className="prose prose-gray max-w-none whitespace-pre-wrap text-gray-700">
            {section.content}
          </div>
        )}

        {/* File */}
        {section.contentType === 'file' && section.fileUrl && (
          <div className="flex flex-col items-center justify-center py-8">
            <FileText className="w-12 h-12 text-pink-400 mb-4" />
            <a
              href={section.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:brightness-110 transition-all"
            >
              <Download className="w-5 h-5" />
              Download File
            </a>
          </div>
        )}

        {/* Link */}
        {section.contentType === 'link' && section.content && (
          <div className="flex flex-col items-center justify-center py-8">
            <LinkIcon className="w-12 h-12 text-purple-400 mb-4" />
            <a
              href={section.content}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:brightness-110 transition-all"
            >
              <ExternalLink className="w-5 h-5" />
              Open Link
            </a>
            <p className="text-sm text-gray-400 mt-3 break-all">{section.content}</p>
          </div>
        )}

        {/* Video */}
        {section.contentType === 'video' && section.bunnyVideoId && (
          <BunnyPlayer
            videoId={section.bunnyVideoId}
            streamUrl={section.bunnyStreamUrl}
          />
        )}
      </div>
    </div>
  );
}
