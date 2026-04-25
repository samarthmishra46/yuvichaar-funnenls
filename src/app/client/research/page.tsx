'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, ExternalLink, Download, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

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

export default function ClientResearchPage() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState<ResearchEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [analysisJob, setAnalysisJob] = useState<AnalysisJob | null>(null);
  const [startingAnalysis, setStartingAnalysis] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const orgId = session?.user?.orgId;

  const fetchEntries = async () => {
    if (!orgId) return;
    try {
      const data = await fetch(`/api/organizations/${orgId}/research`).then((r) => r.json());
      setEntries(data.entries || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const startPolling = () => {
    if (pollRef.current || !orgId) return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await fetch(`/api/organizations/${orgId}/competition-analysis`).then((r) => r.json());
        const job: AnalysisJob | null = data.analysis;
        setAnalysisJob(job);
        if (job?.status !== 'processing') {
          stopPolling();
          if (job?.status === 'completed') {
            toast.success('Your competition analysis is ready!');
            fetchEntries();
          } else if (job?.status === 'failed') {
            toast.error('Analysis failed. Please try again.');
          }
        }
      } catch { stopPolling(); }
    }, 5000);
  };

  const fetchAnalysisStatus = async () => {
    if (!orgId) return;
    try {
      const data = await fetch(`/api/organizations/${orgId}/competition-analysis`).then((r) => r.json());
      const job: AnalysisJob | null = data.analysis;
      setAnalysisJob(job);
      if (job?.status === 'processing') startPolling();
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!orgId) return;
    fetchEntries();
    fetchAnalysisStatus();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const handleGenerateAnalysis = async () => {
    if (!orgId) return;
    setStartingAnalysis(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/competition-analysis`, { method: 'POST' });
      const data = await res.json();

      if (res.status === 409) { toast.info('Analysis already running — check back in a few minutes'); fetchAnalysisStatus(); return; }
      if (!res.ok) { toast.error(data.error || 'Could not start analysis'); return; }

      setAnalysisJob({ _id: data.jobId, status: 'processing', createdAt: new Date().toISOString() });
      toast.success('Analysis started! Claude is researching your competitors. This takes 1-3 minutes.');
      startPolling();
    } catch {
      toast.error('Failed to start analysis');
    } finally {
      setStartingAnalysis(false);
    }
  };

  const isProcessing = analysisJob?.status === 'processing';

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Brand Research</h1>

      {/* ── AI Competition Analysis card ── */}
      <div className="rounded-2xl bg-linear-to-r from-pink-50 to-fuchsia-50 border border-pink-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-xl bg-pink-100">
              <Sparkles className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Generate Competition Analysis with AI</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Claude searches the web, profiles your top competitors, and creates a detailed PDF report — automatically saved here.
              </p>

              {isProcessing && (
                <p className="text-xs text-pink-600 mt-1.5 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Researching… you can leave this page and come back — it&apos;ll be here when done.
                </p>
              )}
              {analysisJob?.status === 'completed' && (
                <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3" />
                  Last report generated {analysisJob.completedAt ? new Date(analysisJob.completedAt).toLocaleString() : ''}
                </p>
              )}
              {analysisJob?.status === 'failed' && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5">
                  <XCircle className="w-3 h-3" />
                  Last attempt failed — please try again
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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-pink-200 text-pink-600 text-xs font-medium hover:bg-pink-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                View PDF
              </a>
            )}
            <button
              onClick={handleGenerateAnalysis}
              disabled={isProcessing || startingAnalysis}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing || startingAnalysis ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{startingAnalysis ? 'Starting…' : 'Generating…'}</>
              ) : (
                <><Sparkles className="w-4 h-4" />{analysisJob ? 'Regenerate Analysis' : 'Generate Competition Analysis'}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Research documents list ── */}
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
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-gray-900 truncate">{entry.title}</h3>
                  <Badge variant={entry.type === 'pdf' ? 'pink' : 'purple'}>
                    {entry.type === 'pdf' ? 'PDF' : 'Google Doc'}
                  </Badge>
                  {entry.description?.includes('AI-generated') && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-pink-50 text-pink-600 text-[10px] font-medium border border-pink-100">
                      <Sparkles className="w-2.5 h-2.5" /> AI
                    </span>
                  )}
                </div>
                {entry.description && (
                  <p className="text-sm text-gray-500 truncate">{entry.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="ml-4 shrink-0">
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
