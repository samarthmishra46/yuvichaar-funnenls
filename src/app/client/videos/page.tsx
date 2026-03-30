'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import BunnyPlayer from '@/components/shared/BunnyPlayer';

interface AdVideo {
  _id: string;
  title: string;
  description?: string;
  platform: string;
  status: string;
  bunnyVideoId: string;
  bunnyStreamUrl: string;
}

export default function ClientVideosPage() {
  const { data: session } = useSession();
  const [videos, setVideos] = useState<AdVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.orgId) {
      fetch(`/api/organizations/${session.user.orgId}/videos`)
        .then((r) => r.json())
        .then((data) => setVideos(data.videos || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session?.user?.orgId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ad Videos</h1>

      {videos.length === 0 ? (
        <div className="text-center py-16">
          <Video className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No videos available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <div key={video._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <BunnyPlayer videoId={video.bunnyVideoId} streamUrl={video.bunnyStreamUrl} className="!rounded-none" />
              <div className="p-5">
                <h3 className="font-semibold text-gray-900">{video.title}</h3>
                {video.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{video.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="purple">{video.platform}</Badge>
                  <Badge variant="success">{video.status}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
