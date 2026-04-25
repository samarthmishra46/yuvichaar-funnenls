'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Plus, Trash2, FileText, ExternalLink, Download, Sparkles, CheckCircle, XCircle } from 'lucide-react';
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

interface AnalysisJob {
  _id: string;
  status: 'processing' | 'completed' | 'failed';
  pdfUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export default function BrandResearchTab({ orgId }: { orgId: string }) {
  const [entries, setEntries] = useState<ResearchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Competition analysis state
  const [analysisJob, setAnalysisJob] = useState<AnalysisJob | null>(null);
  const [startingAnalysis, setStartingAnalysis] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const fetchAnalysisStatus = async () => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/competition-analysis`);
      const data = await res.json();
      const job: AnalysisJob | null = data.analysis;
      setAnalysisJob(job);

      if (job?.status === 'processing') {
        startPolling();
      } else {
        stopPolling();
        // If just completed, refresh entries so the new PDF appears
        if (job?.status === 'completed') fetchEntries();
      }
    } catch {
      stopPolling();
    }
  };

  const startPolling = () => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/organizations/${orgId}/competition-analysis`);
        const data = await res.json();
        const job: AnalysisJob | null = data.analysis;
        setAnalysisJob(job);

        if (job?.status !== 'processing') {
          stopPolling();
          if (job?.status === 'completed') {
            toast.success('Competition analysis ready!');
            fetchEntries();
          } else if (job?.status === 'failed') {
            toast.error('Analysis failed. Try again.');
          }
        }
      } catch {
        stopPolling();
      }
    }, 5000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    fetchEntries();
    fetchAnalysisStatus();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const handleGenerateAnalysis = async () => {
    setStartingAnalysis(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/competition-analysis`, { method: 'POST' });
      const data = await res.json();

      if (res.status === 409) {
        toast.info('Analysis already running');
        fetchAnalysisStatus();
        return;
      }
      if (!res.ok) {
        toast.error(data.error || 'Failed to start analysis');
        return;
      }

      setAnalysisJob({ _id: data.jobId, status: 'processing', createdAt: new Date().toISOString() });
      toast.success('Analysis started — this may take 1-3 minutes');
      startPolling();
    } catch {
      toast.error('Failed to start analysis');
    } finally {
      setStartingAnalysis(false);
    }
  };

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
    if (!form.title) { toast.error('Title is required'); return; }
    if (form.type === 'pdf' && !form.fileUrl) { toast.error('Please upload a PDF'); return; }
    if (form.type === 'googledoc' && !form.docLink) { toast.error('Please enter the Google Doc link'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) { toast.error('Failed to add entry'); return; }

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
      if (res.ok) { toast.success('Entry deleted'); fetchEntries(); }
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full !bg-[#f8f9fa]" />
        ))}
      </div>
    );
  }

  const isProcessing = analysisJob?.status === 'processing';

  return (
    <div className="space-y-6">

      {/* ── AI Analysis Banner ── */}
      <Card className="!bg-gradient-to-r !from-[#fdf2f8] !to-[#fce7f3] !border-[#fbcfe8] shadow-sm">
        <CardContent className="py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 rounded-xl bg-[#e91e8c]/10">
                <Sparkles className="w-5 h-5 text-[#e91e8c]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0f172a] text-sm">Generate Competition Analysis with AI</h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Claude searches the web, analyses competitors, and delivers a formatted PDF report — automatically added to the research list.
                </p>
                {isProcessing && (
                  <p className="text-xs text-[#e91e8c] mt-1.5 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Researching competitors… usually takes 1-3 minutes. You can leave this page.
                  </p>
                )}
                {analysisJob?.status === 'completed' && (
                  <p className="text-xs text-[#16a34a] mt-1.5 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3" />
                    Last analysis completed {analysisJob.completedAt ? new Date(analysisJob.completedAt).toLocaleString() : ''}
                  </p>
                )}
                {analysisJob?.status === 'failed' && (
                  <p className="text-xs text-[#dc2626] mt-1.5 flex items-center gap-1.5">
                    <XCircle className="w-3 h-3" />
                    Last analysis failed: {analysisJob.error}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {analysisJob?.status === 'completed' && analysisJob.pdfUrl && (
                <a
                  href={analysisJob.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#fbcfe8] text-[#e91e8c] text-xs font-medium hover:bg-[#fdf2f8] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  View PDF
                </a>
              )}
              <Button
                onClick={handleGenerateAnalysis}
                disabled={isProcessing || startingAnalysis}
                className="!bg-[#e91e8c] hover:!bg-[#c0156f] !text-white text-sm"
              >
                {isProcessing || startingAnalysis ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {startingAnalysis ? 'Starting…' : 'Generating…'}</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> {analysisJob ? 'Regenerate' : 'Generate'}</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Manual Add button ── */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'default'} className={showForm ? '!border-[#e2e8f0] !text-[#64748b]' : ''}>
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Entry'}
        </Button>
      </div>

      {/* ── Add form ── */}
      {showForm && (
        <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
          <CardContent className="space-y-4 pt-6">
            <Input id="re-title" label="Title" placeholder="Research document title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="!bg-white !border-[#e2e8f0] !text-[#0f172a]" />

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8125rem] font-semibold text-[#475569]">Type</label>
              <div className="flex gap-3">
                <button onClick={() => setForm((p) => ({ ...p, type: 'pdf' }))} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${form.type === 'pdf' ? 'bg-[#fdf2f8] text-[#e91e8c] border border-[#fbcfe8]' : 'bg-[#f8f9fa] text-[#64748b] border border-[#e2e8f0]'}`}>
                  PDF Upload
                </button>
                <button onClick={() => setForm((p) => ({ ...p, type: 'googledoc' }))} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${form.type === 'googledoc' ? 'bg-[#fdf2f8] text-[#e91e8c] border border-[#fbcfe8]' : 'bg-[#f8f9fa] text-[#64748b] border border-[#e2e8f0]'}`}>
                  Google Doc
                </button>
              </div>
            </div>

            {form.type === 'pdf' ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8125rem] font-semibold text-[#475569]">PDF File</label>
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#e2e8f0] text-[#64748b] text-sm cursor-pointer hover:bg-[#f8f9fa] transition-colors w-fit">
                  {uploadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  {uploadingPdf ? 'Uploading…' : form.fileUrl ? 'Change PDF' : 'Upload PDF'}
                  <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                </label>
                {form.fileUrl && <p className="text-xs text-[#4ade80]">✓ PDF uploaded</p>}
              </div>
            ) : (
              <Input id="re-doclink" label="Google Doc Link" placeholder="https://docs.google.com/..." value={form.docLink} onChange={(e) => setForm((p) => ({ ...p, docLink: e.target.value }))} className="!bg-white !border-[#e2e8f0] !text-[#0f172a]" />
            )}

            <Textarea id="re-desc" label="Description" placeholder="Optional description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="!bg-white !border-[#e2e8f0] !text-[#0f172a] !min-h-[80px]" />

            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</> : 'Add Entry'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Entries list ── */}
      {entries.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-10 h-10 mx-auto text-[#475569] mb-3" />
          <p className="text-[#64748b] text-sm">No research entries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry._id} className="!bg-white !border-[#e2e8f0] shadow-sm">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-[#0f172a] truncate">{entry.title}</h4>
                    <Badge variant={entry.type === 'pdf' ? 'pink' : 'purple'}>
                      {entry.type === 'pdf' ? 'PDF' : 'Google Doc'}
                    </Badge>
                    {entry.description?.includes('AI-generated') && (
                      <Badge variant="outline" className="!border-[#e91e8c]/30 !text-[#e91e8c] !text-[10px]">
                        <Sparkles className="w-2.5 h-2.5 mr-0.5" /> AI
                      </Badge>
                    )}
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
                    <a href={entry.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-[#f8f9fa] text-[#64748b] hover:text-[#0f172a] transition-colors">
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  {entry.type === 'googledoc' && entry.docLink && (
                    <a href={entry.docLink} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-[#f8f9fa] text-[#64748b] hover:text-[#0f172a] transition-colors">
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
