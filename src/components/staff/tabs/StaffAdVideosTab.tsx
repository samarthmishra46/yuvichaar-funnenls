'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import VideoUploader from '@/components/shared/VideoUploader';
import BunnyPlayer from '@/components/shared/BunnyPlayer';

interface AdVideoEntry {
  _id: string;
  title: string;
  description?: string;
  platform: string;
  status: string;
  bunnyVideoId: string;
  bunnyStreamUrl: string;
  uploadedBy?: string;
  createdAt: string;
}

interface StaffAdVideosTabProps {
  orgId: string;
  staffEmail: string;
}

const platformOptions = [
  { value: 'General', label: 'General' },
  { value: 'Meta', label: 'Meta' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'Instagram', label: 'Instagram' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'live', label: 'Live' },
];

const statusBadgeVariant: Record<string, 'default' | 'warning' | 'success' | 'pink'> = {
  draft: 'default',
  'under-review': 'warning',
  approved: 'success',
  live: 'pink',
};

export default function StaffAdVideosTab({ orgId, staffEmail }: StaffAdVideosTabProps) {
  const [videos, setVideos] = useState<AdVideoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    platform: 'General',
    status: 'draft',
    bunnyVideoId: '',
    bunnyStreamUrl: '',
  });

  const fetchVideos = async () => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/videos`);
      const data = await res.json();
      setVideos(data.videos || []);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [orgId]);

  const handleUploadComplete = (data: { videoId: string; streamUrl: string }) => {
    setForm((prev) => ({
      ...prev,
      bunnyVideoId: data.videoId,
      bunnyStreamUrl: data.streamUrl,
    }));
  };

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error('Title is required');
      return;
    }
    if (!form.bunnyVideoId) {
      toast.error('Please upload a video first');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, uploadedBy: staffEmail }),
      });

      if (!res.ok) {
        toast.error('Failed to save video');
        return;
      }

      toast.success('Video added');
      setForm({ title: '', description: '', platform: 'General', status: 'draft', bunnyVideoId: '', bunnyStreamUrl: '' });
      setShowForm(false);
      fetchVideos();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (video: AdVideoEntry) => {
    // Staff can only delete their own uploads
    if (video.uploadedBy !== staffEmail) {
      toast.error('You can only delete videos you uploaded');
      return;
    }

    if (!confirm('Delete this video?')) return;

    try {
      const res = await fetch(`/api/videos/${video._id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Video deleted');
        fetchVideos();
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full !bg-[#f8f9fa]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'default'} className={showForm ? '!border-[#e2e8f0] !text-[#64748b]' : ''}>
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Upload Video'}
        </Button>
      </div>

      {showForm && (
        <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
          <CardContent className="space-y-4 pt-6">
            <Input id="av-title" label="Title" placeholder="Video title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="!bg-white !border-[#e2e8f0] !text-[#0f172a]" />
            <Textarea id="av-desc" label="Description" placeholder="Optional description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="!bg-white !border-[#e2e8f0] !text-[#0f172a] !min-h-[60px]" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select id="av-platform" label="Platform" options={platformOptions} value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))} className="!bg-white !border-[#e2e8f0] !text-[#0f172a]" />
              <Select id="av-status" label="Status" options={statusOptions} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="!bg-white !border-[#e2e8f0] !text-[#0f172a]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8125rem] font-semibold text-[#475569]">Video File</label>
              <VideoUploader onUploadComplete={handleUploadComplete} />
            </div>

            {form.bunnyVideoId && (
              <p className="text-xs text-[#4ade80]">✓ Video uploaded (ID: {form.bunnyVideoId})</p>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Video'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <Video className="w-10 h-10 mx-auto text-[#475569] mb-3" />
          <p className="text-[#64748b] text-sm">No videos uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {videos.map((video) => (
            <Card key={video._id} className="!bg-white !border-[#e2e8f0] shadow-sm overflow-hidden">
              <BunnyPlayer videoId={video.bunnyVideoId} streamUrl={video.bunnyStreamUrl} className="!rounded-none" />
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#0f172a] truncate">{video.title}</h4>
                    {video.description && (
                      <p className="text-xs text-[#64748b] mt-1 line-clamp-2">{video.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="purple">{video.platform}</Badge>
                      <Badge variant={statusBadgeVariant[video.status] || 'default'}>{video.status}</Badge>
                      {video.uploadedBy === staffEmail && (
                        <Badge variant="success">Your upload</Badge>
                      )}
                    </div>
                    {video.uploadedBy && video.uploadedBy !== staffEmail && (
                      <p className="text-xs text-[#94a3b8] mt-1">Uploaded by {video.uploadedBy}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Only show delete button for own uploads */}
                    {video.uploadedBy === staffEmail && (
                      <button onClick={() => handleDelete(video)} className="p-2 rounded-lg hover:bg-[rgba(239,68,68,0.1)] text-[#64748b] hover:text-[#f87171] transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
