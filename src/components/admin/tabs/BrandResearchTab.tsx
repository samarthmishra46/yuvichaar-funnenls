'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, FileText, ExternalLink, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

export default function BrandResearchTab({ orgId }: { orgId: string }) {
  const [entries, setEntries] = useState<ResearchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [form, setForm] = useState({
    title: '',
    type: 'pdf' as 'pdf' | 'googledoc',
    fileUrl: '',
    docLink: '',
    description: '',
  });

  const fetchEntries = async () => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/research`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [orgId]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'pdf');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setForm((prev) => ({ ...prev, fileUrl: data.url }));
        toast.success('PDF uploaded');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error('Title is required');
      return;
    }

    if (form.type === 'pdf' && !form.fileUrl) {
      toast.error('Please upload a PDF');
      return;
    }

    if (form.type === 'googledoc' && !form.docLink) {
      toast.error('Please enter the Google Doc link');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        toast.error('Failed to add entry');
        return;
      }

      toast.success('Research entry added');
      setForm({ title: '', type: 'pdf', fileUrl: '', docLink: '', description: '' });
      setShowForm(false);
      fetchEntries();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Delete this research entry?')) return;

    try {
      const res = await fetch(`/api/research/${entryId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Entry deleted');
        fetchEntries();
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full !bg-[rgba(255,255,255,0.04)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'default'} className={showForm ? '!border-[rgba(255,255,255,0.1)] !text-[#94a3b8]' : ''}>
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Entry'}
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
          <CardContent className="space-y-4 pt-6">
            <Input id="re-title" label="Title" placeholder="Research document title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white" />

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8125rem] font-semibold text-[#cbd5e1]">Type</label>
              <div className="flex gap-3">
                <button onClick={() => setForm((p) => ({ ...p, type: 'pdf' }))} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${form.type === 'pdf' ? 'bg-[rgba(244,114,182,0.1)] text-[#f472b6] border border-[rgba(244,114,182,0.3)]' : 'bg-[rgba(255,255,255,0.04)] text-[#94a3b8] border border-[rgba(255,255,255,0.1)]'}`}>
                  PDF Upload
                </button>
                <button onClick={() => setForm((p) => ({ ...p, type: 'googledoc' }))} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${form.type === 'googledoc' ? 'bg-[rgba(244,114,182,0.1)] text-[#f472b6] border border-[rgba(244,114,182,0.3)]' : 'bg-[rgba(255,255,255,0.04)] text-[#94a3b8] border border-[rgba(255,255,255,0.1)]'}`}>
                  Google Doc
                </button>
              </div>
            </div>

            {form.type === 'pdf' ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8125rem] font-semibold text-[#cbd5e1]">PDF File</label>
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-[#94a3b8] text-sm cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-colors w-fit">
                  {uploadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  {uploadingPdf ? 'Uploading…' : form.fileUrl ? 'Change PDF' : 'Upload PDF'}
                  <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                </label>
                {form.fileUrl && <p className="text-xs text-[#4ade80]">✓ PDF uploaded</p>}
              </div>
            ) : (
              <Input id="re-doclink" label="Google Doc Link" placeholder="https://docs.google.com/..." value={form.docLink} onChange={(e) => setForm((p) => ({ ...p, docLink: e.target.value }))} className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white" />
            )}

            <Textarea id="re-desc" label="Description" placeholder="Optional description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white !min-h-[80px]" />

            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</> : 'Add Entry'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries list */}
      {entries.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-10 h-10 mx-auto text-[#475569] mb-3" />
          <p className="text-[#64748b] text-sm">No research entries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry._id} className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white truncate">{entry.title}</h4>
                    <Badge variant={entry.type === 'pdf' ? 'pink' : 'purple'}>
                      {entry.type === 'pdf' ? 'PDF' : 'Google Doc'}
                    </Badge>
                  </div>
                  {entry.description && (
                    <p className="text-xs text-[#64748b] truncate">{entry.description}</p>
                  )}
                  <p className="text-xs text-[#475569] mt-1">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {entry.type === 'pdf' && entry.fileUrl && (
                    <a href={entry.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/5 text-[#94a3b8] hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  {entry.type === 'googledoc' && entry.docLink && (
                    <a href={entry.docLink} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/5 text-[#94a3b8] hover:text-white transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => handleDelete(entry._id)} className="p-2 rounded-lg hover:bg-[rgba(239,68,68,0.1)] text-[#64748b] hover:text-[#f87171] transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
