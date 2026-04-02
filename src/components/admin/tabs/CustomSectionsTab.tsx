'use client';

import { useState } from 'react';
import { Loader2, Plus, Trash2, Edit2, Layers, FileText, Link as LinkIcon, Video, Type } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import VideoUploader from '@/components/shared/VideoUploader';

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

interface CustomSectionsTabProps {
  orgId: string;
  sections: CustomSection[];
  onUpdate: () => void;
}

const contentTypeIcons = {
  richtext: Type,
  file: FileText,
  link: LinkIcon,
  video: Video,
};

const contentTypeLabels = {
  richtext: 'Rich Text',
  file: 'File',
  link: 'Link',
  video: 'Video',
};

export default function CustomSectionsTab({ orgId, sections, onUpdate }: CustomSectionsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CustomSection | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [form, setForm] = useState({
    title: '',
    contentType: 'richtext' as CustomSection['contentType'],
    content: '',
    fileUrl: '',
    bunnyVideoId: '',
    bunnyStreamUrl: '',
  });

  const resetForm = () => {
    setForm({ title: '', contentType: 'richtext', content: '', fileUrl: '', bunnyVideoId: '', bunnyStreamUrl: '' });
    setEditingSection(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (section: CustomSection) => {
    setEditingSection(section);
    setForm({
      title: section.title,
      contentType: section.contentType,
      content: section.content || '',
      fileUrl: section.fileUrl || '',
      bunnyVideoId: section.bunnyVideoId || '',
      bunnyStreamUrl: section.bunnyStreamUrl || '',
    });
    setDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'file');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setForm((p) => ({ ...p, fileUrl: data.url }));
        toast.success('File uploaded');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleVideoUpload = (data: { videoId: string; streamUrl: string }) => {
    setForm((p) => ({ ...p, bunnyVideoId: data.videoId, bunnyStreamUrl: data.streamUrl }));
  };

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error('Title is required');
      return;
    }

    setSubmitting(true);

    try {
      if (editingSection) {
        // Update
        const res = await fetch(`/api/sections/${editingSection.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          toast.success('Section updated');
        } else {
          toast.error('Failed to update');
          return;
        }
      } else {
        // Create
        const res = await fetch(`/api/organizations/${orgId}/sections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, id: uuidv4() }),
        });
        if (res.ok) {
          toast.success('Section created');
        } else {
          toast.error('Failed to create');
          return;
        }
      }

      setDialogOpen(false);
      resetForm();
      onUpdate();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sectionId: string) => {
    if (!confirm('Delete this section?')) return;

    try {
      const res = await fetch(`/api/sections/${sectionId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Section deleted');
        onUpdate();
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4" />
          Add New Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12">
          <Layers className="w-10 h-10 mx-auto text-[#475569] mb-3" />
          <p className="text-[#64748b] text-sm">No custom sections yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => {
            const Icon = contentTypeIcons[section.contentType] || Layers;
            return (
              <Card key={section.id} className="!bg-white !border-[#e2e8f0] shadow-sm">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-[#fdf2f8]">
                      <Icon className="w-4 h-4 text-[#e91e8c]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#0f172a] truncate">{section.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="purple">{contentTypeLabels[section.contentType]}</Badge>
                        <span className="text-xs text-[#475569]">
                          {new Date(section.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button onClick={() => openEditDialog(section)} className="p-2 rounded-lg hover:bg-[#f8f9fa] text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(section.id)} className="p-2 rounded-lg hover:bg-[rgba(239,68,68,0.1)] text-[#64748b] hover:text-[#f87171] transition-colors cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="!bg-white !border-[#e2e8f0]">
          <DialogHeader>
            <DialogTitle className="!text-[#0f172a]">
              {editingSection ? 'Edit Section' : 'Add New Section'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <Input
              id="cs-title"
              label="Section Title"
              placeholder="e.g. Brand Guidelines"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="!bg-white !border-[#e2e8f0] !text-[#0f172a]"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8125rem] font-semibold text-[#475569]">Content Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['richtext', 'file', 'link', 'video'] as const).map((type) => {
                  const Icon = contentTypeIcons[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setForm((p) => ({ ...p, contentType: type }))}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        form.contentType === type
                          ? 'bg-[#fdf2f8] text-[#e91e8c] border border-[#fbcfe8]'
                          : 'bg-[#f8f9fa] text-[#64748b] border border-[#e2e8f0]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {contentTypeLabels[type]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content input based on type */}
            {form.contentType === 'richtext' && (
              <Textarea
                id="cs-content"
                label="Content"
                placeholder="Enter your text content..."
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                className="!bg-white !border-[#e2e8f0] !text-[#0f172a] !min-h-[120px]"
              />
            )}

            {form.contentType === 'file' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8125rem] font-semibold text-[#475569]">Upload File</label>
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#e2e8f0] text-[#64748b] text-sm cursor-pointer hover:bg-[#f8f9fa] transition-colors w-fit">
                  {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  {uploadingFile ? 'Uploading…' : form.fileUrl ? 'Change File' : 'Upload File'}
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
                {form.fileUrl && <p className="text-xs text-[#4ade80]">✓ File uploaded</p>}
              </div>
            )}

            {form.contentType === 'link' && (
              <Input
                id="cs-link"
                label="URL"
                placeholder="https://example.com"
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                className="!bg-white !border-[#e2e8f0] !text-[#0f172a]"
              />
            )}

            {form.contentType === 'video' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8125rem] font-semibold text-[#475569]">Upload Video</label>
                <VideoUploader onUploadComplete={handleVideoUpload} />
                {form.bunnyVideoId && <p className="text-xs text-[#4ade80]">✓ Video uploaded</p>}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="!text-[#94a3b8]">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editingSection ? 'Update Section' : 'Create Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
