'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Clock, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Task {
  _id: string;
  orgId: string;
  dayNumber: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
}

export default function StaffPortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [proofType, setProofType] = useState<'text' | 'image' | 'file'>('text');
  const [proofText, setProofText] = useState('');
  const [proofFile, setProofFile] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'staff') {
      router.push('/staff/login');
      return;
    }

    fetchTasks(session.user.email);
  }, [session, status, router]);

  const fetchTasks = async (staffEmail: string) => {
    try {
      const res = await fetch(`/api/tasks?assignedTo=${encodeURIComponent(staffEmail)}`);
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Fetch tasks error:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'proof');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setProofFile(data.url);
        toast.success('File uploaded');
      } else {
        toast.error('Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;

    if (proofType === 'text' && !proofText.trim()) {
      toast.error('Please provide proof of work');
      return;
    }

    if ((proofType === 'image' || proofType === 'file') && !proofFile) {
      toast.error('Please upload a file');
      return;
    }

    setSubmitting(true);
    try {
      const proofOfWork = {
        type: proofType,
        content: proofType === 'text' ? proofText : undefined,
        fileUrl: proofType !== 'text' ? proofFile : undefined,
      };

      const res = await fetch(`/api/tasks/${selectedTask._id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofOfWork }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to complete task');
        return;
      }

      toast.success('Task marked as completed!');
      setSelectedTask(null);
      setProofText('');
      setProofFile('');
      if (session?.user?.email) {
        await fetchTasks(session.user.email);
      }
    } catch (error) {
      console.error('Complete task error:', error);
      toast.error('Failed to complete task');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#f472b6]" />
      </div>
    );
  }

  if (!session || session.user.role !== 'staff') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Tasks</h1>
            <p className="text-sm text-[#64748b] mt-1">{session.user.email}</p>
          </div>
          <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/staff/login' })} className="!text-[#94a3b8]">
            Logout
          </Button>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
            <p className="text-sm text-[#64748b] mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-white">{tasks.length}</p>
          </div>
          <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
            <p className="text-sm text-[#64748b] mb-1">Pending</p>
            <p className="text-2xl font-bold text-[#f59e0b]">
              {tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
            <p className="text-sm text-[#64748b] mb-1">Completed</p>
            <p className="text-2xl font-bold text-[#10b981]">
              {tasks.filter((t) => t.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
            <p className="text-[#64748b]">No tasks assigned yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task._id} className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-[#f472b6]">Day {task.dayNumber}</span>
                      </div>
                      <h3 className="text-white font-semibold mb-1">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-[#94a3b8]">{task.description}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        task.status === 'completed'
                          ? 'success'
                          : task.status === 'in_progress'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {task.status !== 'completed' && (
                    <Button
                      onClick={() => setSelectedTask(task)}
                      size="sm"
                      className="mt-2"
                    >
                      Mark as Complete
                    </Button>
                  )}

                  {task.completedAt && (
                    <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-2 text-xs text-[#64748b]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Completed on {new Date(task.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Complete Task Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="!bg-[#111118] !border-[rgba(255,255,255,0.06)] max-w-lg w-full">
              <CardHeader>
                <CardTitle className="!text-white">Complete Task</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-[#94a3b8] mb-1">Task:</p>
                  <p className="text-white font-medium">{selectedTask.title}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-semibold text-[#cbd5e1] tracking-wide">
                    Proof of Work Type
                  </label>
                  <select
                    value={proofType}
                    onChange={(e) => setProofType(e.target.value as any)}
                    className="px-3 py-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white text-sm outline-none focus:border-[#9333ea]"
                  >
                    <option value="text">Text Description</option>
                    <option value="image">Image</option>
                    <option value="file">File</option>
                  </select>
                </div>

                {proofType === 'text' ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.8125rem] font-semibold text-[#cbd5e1] tracking-wide">
                      Description
                    </label>
                    <textarea
                      value={proofText}
                      onChange={(e) => setProofText(e.target.value)}
                      placeholder="Describe what you completed..."
                      rows={4}
                      className="px-3 py-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white text-sm outline-none focus:border-[#9333ea] resize-none"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.8125rem] font-semibold text-[#cbd5e1] tracking-wide">
                      Upload {proofType === 'image' ? 'Image' : 'File'}
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-[#94a3b8] text-sm font-medium cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {proofFile
                        ? '✓ File Uploaded'
                        : uploading
                        ? 'Uploading...'
                        : 'Choose File'}
                      <input
                        type="file"
                        accept={proofType === 'image' ? 'image/*' : '*'}
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedTask(null);
                      setProofText('');
                      setProofFile('');
                    }}
                    className="!text-[#94a3b8]"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCompleteTask} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
