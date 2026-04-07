'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Video, FileText, CreditCard, User, MapPin, Scale, ArrowRight, CheckCircle2, MessageSquare, Send, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Organization {
  _id: string;
  name: string;
  status: string;
  accountManager?: string;
  email?: string;
  phone?: string;
  payment: {
    totalAmount: number;
    payments: Array<{ amount: number }>;
  };
  onboarding?: {
    token?: string;
  };
  dealPage?: {
    signatureName?: string;
    signedAt?: string;
    fixedFee?: number;
    advanceAmount?: number;
    goal?: string;
    target?: string;
  };
}

interface Roadmap {
  _id: string;
  startDate: string;
  endDate: string;
}

interface Task {
  _id: string;
  dayNumber: number;
  title: string;
  status: string;
}

interface ClientTask {
  _id: string;
  title: string;
  description: string;
  taskType: 'credentials' | 'document' | 'information' | 'access' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  createdBy: string;
  createdByRole: string;
  clientResponse?: string;
  createdAt: string;
}

const statusBadgeVariant: Record<string, 'success' | 'warning' | 'error' | 'purple'> = {
  active: 'success',
  onboarding: 'purple',
  paused: 'warning',
  churned: 'error',
};

export default function ClientDashboard() {
  const { data: session } = useSession();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoCount, setVideoCount] = useState(0);
  const [researchCount, setResearchCount] = useState(0);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [clientTasks, setClientTasks] = useState<ClientTask[]>([]);
  const [pendingTaskCount, setPendingTaskCount] = useState(0);
  const [selectedTask, setSelectedTask] = useState<ClientTask | null>(null);
  const [taskResponse, setTaskResponse] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  useEffect(() => {
    if (session?.user?.orgId) {
      Promise.all([
        fetch(`/api/organizations/${session.user.orgId}`).then((r) => r.json()),
        fetch(`/api/organizations/${session.user.orgId}/videos`).then((r) => r.json()),
        fetch(`/api/organizations/${session.user.orgId}/research`).then((r) => r.json()),
        fetch(`/api/roadmaps/${session.user.orgId}`).then((r) => r.json()).catch(() => ({ roadmap: null, tasks: [] })),
        fetch('/api/client-tasks').then((r) => r.json()).catch(() => ({ tasks: [], pendingCount: 0 })),
      ])
        .then(([orgData, videosData, researchData, roadmapData, clientTasksData]) => {
          setOrg(orgData.organization);
          setVideoCount(videosData.videos?.length || 0);
          setResearchCount(researchData.entries?.length || 0);
          if (roadmapData.roadmap) {
            setRoadmap(roadmapData.roadmap);
            setTasks(roadmapData.tasks || []);
            setCompletedTasks(roadmapData.tasks?.filter((t: Task) => t.status === 'completed').length || 0);
          }
          setClientTasks(clientTasksData.tasks || []);
          setPendingTaskCount(clientTasksData.pendingCount || 0);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session?.user?.orgId]);

  const handleTaskResponse = async (taskId: string) => {
    if (!taskResponse.trim()) {
      toast.error('Please provide a response');
      return;
    }

    setSubmittingResponse(true);
    try {
      const res = await fetch(`/api/client-tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientResponse: taskResponse }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit response');
        return;
      }

      toast.success('Response submitted successfully');
      setSelectedTask(null);
      setTaskResponse('');
      setClientTasks((prev) => prev.map((t) => (t._id === taskId ? data.task : t)));
      setPendingTaskCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to submit response');
    } finally {
      setSubmittingResponse(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!org) {
    return <p className="text-gray-500 text-center py-16">Unable to load dashboard</p>;
  }

  const totalPaid = (org.payment?.payments || []).reduce((sum, p) => sum + p.amount, 0);
  const amountDue = (org.payment?.totalAmount || 0) - totalPaid;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e91e8c] to-[#9333ea] flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {org.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-[#0f172a]">{org.name}</h1>
                <Badge variant={statusBadgeVariant[org.status] || 'default'}>
                  {org.status}
                </Badge>
              </div>
              <p className="text-sm text-[#64748b] mt-1">Welcome to your brand dashboard</p>
            </div>
          </div>

          {org.accountManager && (
            <div className="mt-4 pt-4 border-t border-[#e2e8f0] flex items-center gap-2">
              <User className="w-4 h-4 text-[#64748b]" />
              <span className="text-sm text-[#64748b]">Account Manager:</span>
              <span className="text-sm font-semibold text-[#0f172a]">{org.accountManager}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="!bg-white !border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-[#f3e8ff]">
                <Video className="w-5 h-5 text-[#9333ea]" />
              </div>
              <span className="text-sm font-medium text-[#64748b]">Videos Available</span>
            </div>
            <p className="text-3xl font-bold text-[#0f172a]">{videoCount}</p>
          </CardContent>
        </Card>

        <Card className="!bg-white !border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-[#fdf2f8]">
                <FileText className="w-5 h-5 text-[#e91e8c]" />
              </div>
              <span className="text-sm font-medium text-[#64748b]">Research Docs</span>
            </div>
            <p className="text-3xl font-bold text-[#0f172a]">{researchCount}</p>
          </CardContent>
        </Card>

        <Card className="!bg-white !border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-[#fee2e2]">
                <CreditCard className="w-5 h-5 text-[#ef4444]" />
              </div>
              <span className="text-sm font-medium text-[#64748b]">Amount Due</span>
            </div>
            <p className={`text-3xl font-bold ${amountDue > 0 ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
              ₹{Math.max(0, amountDue).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roadmap Preview */}
        {roadmap && (
          <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="!text-[#0f172a] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#e91e8c]" />
                  60-Day Roadmap
                </CardTitle>
                <Link
                  href="/client/roadmap"
                  className="text-sm text-[#e91e8c] hover:text-[#d11b7f] font-medium flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[#0f172a]">{completedTasks} / {tasks.length}</p>
                    <p className="text-sm text-[#64748b]">Tasks Completed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#e91e8c]">{Math.round((completedTasks / tasks.length) * 100) || 0}%</p>
                    <p className="text-sm text-[#64748b]">Progress</p>
                  </div>
                </div>
                <div className="w-full bg-[#f1f5f9] rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-[#e91e8c] to-[#9333ea] h-2.5 rounded-full transition-all"
                    style={{ width: `${(completedTasks / tasks.length) * 100 || 0}%` }}
                  />
                </div>
                <div className="pt-2">
                  <p className="text-xs text-[#64748b] mb-2">Recent Completed Tasks:</p>
                  <div className="space-y-2">
                    {tasks
                      .filter((t) => t.status === 'completed')
                      .slice(-3)
                      .map((task) => (
                        <div key={task._id} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                          <span className="text-[#64748b] truncate">Day {task.dayNumber}: {task.title}</span>
                        </div>
                      ))}
                    {completedTasks === 0 && (
                      <p className="text-sm text-[#94a3b8] italic">No tasks completed yet</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Agreement */}
        {org.dealPage?.signedAt && (
          <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="!text-[#0f172a] flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#9333ea]" />
                Service Agreement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0]">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                    <span className="font-semibold text-[#166534]">Agreement Signed</span>
                  </div>
                  <p className="text-sm text-[#15803d]">
                    Signed by <strong>{org.dealPage.signatureName}</strong> on {new Date(org.dealPage.signedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-[#e2e8f0]">
                    <span className="text-sm text-[#64748b]">Engagement</span>
                    <span className="text-sm font-semibold text-[#0f172a]">60-Day Growth Marathon</span>
                  </div>
                  {org.dealPage.goal && (
                    <div className="flex justify-between items-center py-2 border-b border-[#e2e8f0]">
                      <span className="text-sm text-[#64748b]">Goal</span>
                      <span className="text-sm font-semibold text-[#0f172a]">{org.dealPage.goal}</span>
                    </div>
                  )}
                  {org.dealPage.fixedFee && (
                    <div className="flex justify-between items-center py-2 border-b border-[#e2e8f0]">
                      <span className="text-sm text-[#64748b]">Fixed Fee</span>
                      <span className="text-sm font-semibold text-[#0f172a]">₹{org.dealPage.fixedFee.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {org.onboarding?.token && (
                  <Link
                    href={`/deal/${org.onboarding.token}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#f8f9fa] border border-[#e2e8f0] hover:bg-[#f1f3f5] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white border border-[#e2e8f0]">
                        <FileText className="w-5 h-5 text-[#9333ea]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0f172a]">View Full Agreement</p>
                        <p className="text-xs text-[#64748b]">60-Day Growth Marathon Terms</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#64748b] group-hover:text-[#e91e8c] transition-colors" />
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* What We Need From You Section */}
      <Card className={`!border-[#e2e8f0] shadow-sm ${pendingTaskCount > 0 ? '!bg-gradient-to-r from-[#fef3c7] to-[#fef9c3] !border-[#fde68a]' : '!bg-white'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="!text-[#0f172a] flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#d97706]" />
              What We Need From You
              {pendingTaskCount > 0 && (
                <Badge variant="warning" className="ml-2">
                  {pendingTaskCount} pending
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {clientTasks.filter((t) => t.status !== 'completed').length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-10 h-10 text-[#22c55e] mx-auto mb-2" />
              <p className="text-sm text-[#64748b]">All caught up! No pending requests from our team.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientTasks.filter((t) => t.status !== 'completed').map((task) => (
                <div
                  key={task._id}
                  className="p-4 bg-white rounded-xl border border-[#e2e8f0] hover:border-[#e91e8c] transition-colors cursor-pointer"
                  onClick={() => { setSelectedTask(task); setTaskResponse(task.clientResponse || ''); }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={task.priority === 'urgent' ? 'error' : task.priority === 'high' ? 'warning' : 'default'}
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                        <Badge variant="purple" className="text-xs">
                          {task.taskType}
                        </Badge>
                      </div>
                      <p className="font-semibold text-[#0f172a]">{task.title}</p>
                      <p className="text-sm text-[#64748b] line-clamp-2">{task.description}</p>
                    </div>
                    <Badge variant={task.status === 'in_progress' ? 'warning' : 'default'}>
                      {task.status === 'in_progress' ? 'Responded' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    Requested by {task.createdBy} • {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Completed Tasks */}
          {clientTasks.filter((t) => t.status === 'completed').length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
              <p className="text-xs font-semibold text-[#475569] mb-2">Recently Completed:</p>
              {clientTasks.filter((t) => t.status === 'completed').slice(0, 3).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-2 text-sm"
                >
                  <span className="text-[#64748b] line-through">{task.title}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Response Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="!bg-white !border-[#e2e8f0] shadow-xl max-w-lg w-full">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={selectedTask.priority === 'urgent' ? 'error' : selectedTask.priority === 'high' ? 'warning' : 'default'}>
                      {selectedTask.priority}
                    </Badge>
                    <Badge variant="purple">{selectedTask.taskType}</Badge>
                  </div>
                  <h2 className="text-lg font-bold text-[#0f172a]">{selectedTask.title}</h2>
                </div>
                <button
                  onClick={() => { setSelectedTask(null); setTaskResponse(''); }}
                  className="p-2 rounded-lg hover:bg-[#f8f9fa] text-[#64748b]"
                >
                  ✕
                </button>
              </div>

              <div className="bg-[#f8f9fa] rounded-xl p-4 mb-4">
                <p className="text-[#0f172a]">{selectedTask.description}</p>
              </div>

              <p className="text-xs text-[#94a3b8] mb-4">
                Requested by {selectedTask.createdBy} on {new Date(selectedTask.createdAt).toLocaleDateString()}
              </p>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#475569] block">
                  Your Response
                </label>
                <textarea
                  value={taskResponse}
                  onChange={(e) => setTaskResponse(e.target.value)}
                  placeholder="Provide the requested information here (e.g., password, document link, etc.)..."
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c] resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => { setSelectedTask(null); setTaskResponse(''); }}
                    className="!text-[#64748b]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleTaskResponse(selectedTask._id)}
                    disabled={submittingResponse}
                  >
                    {submittingResponse ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Response
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
