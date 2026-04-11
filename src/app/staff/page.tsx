'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Clock, Upload, Building2, ArrowLeft, AlertCircle, Calendar, MessageSquarePlus, Key } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Task {
  _id: string;
  orgId: string;
  roadmapId: string;
  dayNumber: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  organization?: {
    _id: string;
    name: string;
    logo?: string;
  };
  roadmap?: {
    _id: string;
    startDate: string;
    totalDays: number;
  };
}

interface OrgTaskSummary {
  orgId: string;
  orgName: string;
  orgLogo?: string;
  pendingCount: number;
  totalCount: number;
  roadmapStartDate?: string;
}

export default function StaffPortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [proofType, setProofType] = useState<'text' | 'image' | 'file'>('text');
  const [proofText, setProofText] = useState('');
  const [proofFile, setProofFile] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showClientTaskForm, setShowClientTaskForm] = useState(false);
  const [clientTaskForm, setClientTaskForm] = useState({
    title: '',
    description: '',
    taskType: 'credentials',
    priority: 'medium',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

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
      const res = await fetch(`/api/tasks?assignedTo=${encodeURIComponent(staffEmail)}&withOrgDetails=true`);
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

  // Calculate pending tasks per organization (tasks not completed up to today)
  const orgSummaries = useMemo(() => {
    const summaryMap = new Map<string, OrgTaskSummary>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach((task) => {
      const orgId = task.orgId;
      const orgName = task.organization?.name || 'Unknown Organization';
      const orgLogo = task.organization?.logo;
      const roadmapStartDate = task.roadmap?.startDate;

      if (!summaryMap.has(orgId)) {
        summaryMap.set(orgId, {
          orgId,
          orgName,
          orgLogo,
          pendingCount: 0,
          totalCount: 0,
          roadmapStartDate,
        });
      }

      const summary = summaryMap.get(orgId)!;
      summary.totalCount++;

      // Calculate if this task should be done by today
      if (task.status !== 'completed' && roadmapStartDate) {
        const startDate = new Date(roadmapStartDate);
        startDate.setHours(0, 0, 0, 0);
        const taskDueDate = new Date(startDate);
        taskDueDate.setDate(taskDueDate.getDate() + task.dayNumber - 1);

        // If task due date is today or before, and not completed, count as pending
        if (taskDueDate <= today) {
          summary.pendingCount++;
        }
      }
    });

    return Array.from(summaryMap.values()).sort((a, b) => b.pendingCount - a.pendingCount);
  }, [tasks]);

  // Get pending tasks for selected organization grouped by day
  const selectedOrgTasks = useMemo(() => {
    if (!selectedOrgId) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks
      .filter((task) => {
        if (task.orgId !== selectedOrgId) return false;
        if (task.status === 'completed') return false;
        
        const roadmapStartDate = task.roadmap?.startDate;
        if (!roadmapStartDate) return false;

        const startDate = new Date(roadmapStartDate);
        startDate.setHours(0, 0, 0, 0);
        const taskDueDate = new Date(startDate);
        taskDueDate.setDate(taskDueDate.getDate() + task.dayNumber - 1);

        return taskDueDate <= today;
      })
      .sort((a, b) => a.dayNumber - b.dayNumber);
  }, [tasks, selectedOrgId]);

  // Group tasks by day number
  const tasksByDay = useMemo(() => {
    const grouped = new Map<number, Task[]>();
    selectedOrgTasks.forEach((task) => {
      if (!grouped.has(task.dayNumber)) {
        grouped.set(task.dayNumber, []);
      }
      grouped.get(task.dayNumber)!.push(task);
    });
    return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);
  }, [selectedOrgTasks]);

  const selectedOrgName = selectedOrgId 
    ? orgSummaries.find(o => o.orgId === selectedOrgId)?.orgName || 'Organization'
    : '';


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

  const handleClientTaskSubmit = async () => {
    if (!clientTaskForm.title.trim() || !clientTaskForm.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/client-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...clientTaskForm, orgId: selectedOrgId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create request');
        return;
      }

      toast.success('Request sent to client');
      setShowClientTaskForm(false);
      setClientTaskForm({ title: '', description: '', taskType: 'credentials', priority: 'medium' });
    } catch (error) {
      toast.error('Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/staff/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to change password');
        return;
      }

      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#e91e8c]" />
      </div>
    );
  }

  if (!session || session.user.role !== 'staff') {
    return null;
  }

  // Organization Detail View
  if (selectedOrgId) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedOrgId(null)}
                className="p-2 rounded-xl bg-white border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8f9fa] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a]">{selectedOrgName}</h1>
                <p className="text-sm text-[#64748b] mt-1">
                  {selectedOrgTasks.length} pending task{selectedOrgTasks.length !== 1 ? 's' : ''} due
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowClientTaskForm(true)}
                className="!border-[#e91e8c] !text-[#e91e8c]"
              >
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                Request from Client
              </Button>
              <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/staff/login' })} className="!text-[#64748b]">
                Logout
              </Button>
            </div>
          </div>

          {/* Client Task Request Form */}
          {showClientTaskForm && (
            <Card className="!bg-white !border-[#e2e8f0] shadow-sm mb-6">
              <CardHeader>
                <CardTitle className="!text-[#0f172a]">Request from Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.8125rem] font-semibold text-[#475569]">Request Type</label>
                    <select
                      value={clientTaskForm.taskType}
                      onChange={(e) => setClientTaskForm((p) => ({ ...p, taskType: e.target.value }))}
                      className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
                    >
                      <option value="credentials">Credentials (ID/Password)</option>
                      <option value="access">Access Request</option>
                      <option value="document">Document</option>
                      <option value="information">Information</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.8125rem] font-semibold text-[#475569]">Priority</label>
                    <select
                      value={clientTaskForm.priority}
                      onChange={(e) => setClientTaskForm((p) => ({ ...p, priority: e.target.value }))}
                      className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-semibold text-[#475569]">Title</label>
                  <input
                    type="text"
                    value={clientTaskForm.title}
                    onChange={(e) => setClientTaskForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., Instagram Login Credentials"
                    className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-semibold text-[#475569]">Description</label>
                  <textarea
                    value={clientTaskForm.description}
                    onChange={(e) => setClientTaskForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describe what you need from the client..."
                    rows={3}
                    className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c] resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="ghost" onClick={() => setShowClientTaskForm(false)} className="!text-[#64748b]">
                    Cancel
                  </Button>
                  <Button onClick={handleClientTaskSubmit} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Send to Client'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tasks grouped by day */}
          {tasksByDay.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8f0]">
              <CheckCircle2 className="w-12 h-12 text-[#22c55e] mx-auto mb-4" />
              <p className="text-[#0f172a] font-semibold">All caught up!</p>
              <p className="text-sm text-[#64748b] mt-1">No pending tasks for this organization</p>
            </div>
          ) : (
            <div className="space-y-6">
              {tasksByDay.map(([dayNumber, dayTasks]) => (
                <div key={dayNumber}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="px-3 py-1.5 bg-[#e91e8c] text-white text-sm font-semibold rounded-lg">
                      Day {dayNumber}
                    </div>
                    <span className="text-sm text-[#64748b]">
                      {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {dayTasks.map((task) => (
                      <Card key={task._id} className="!bg-white !border-[#e2e8f0] shadow-sm">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-[#0f172a] font-semibold mb-1">{task.title}</h3>
                              {task.description && (
                                <p className="text-sm text-[#64748b]">{task.description}</p>
                              )}
                            </div>
                            <Badge
                              variant={
                                task.status === 'in_progress'
                                  ? 'warning'
                                  : 'default'
                              }
                            >
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <Button
                            onClick={() => setSelectedTask(task)}
                            size="sm"
                            className="mt-2"
                          >
                            Mark as Complete
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complete Task Modal - same as before but with light theme */}
        {selectedTask && renderCompleteTaskModal()}
      </div>
    );
  }

  // Main Organization List View
  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a]">My Tasks</h1>
            <p className="text-sm text-[#64748b] mt-1">{session.user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/staff/leaves">
              <Button variant="outline" className="!border-[#e2e8f0] !text-[#64748b] hover:!text-[#0f172a]">
                <Calendar className="w-4 h-4 mr-2" />
                Leaves
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordModal(true)} 
              className="!border-[#e2e8f0] !text-[#64748b] hover:!text-[#0f172a]"
            >
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/staff/login' })} className="!text-[#64748b]">
              Logout
            </Button>
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
            <p className="text-sm text-[#64748b] mb-1">Organizations</p>
            <p className="text-2xl font-bold text-[#0f172a]">{orgSummaries.length}</p>
          </div>
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
            <p className="text-sm text-[#64748b] mb-1">Pending Tasks</p>
            <p className="text-2xl font-bold text-[#f59e0b]">
              {orgSummaries.reduce((sum, o) => sum + o.pendingCount, 0)}
            </p>
          </div>
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
            <p className="text-sm text-[#64748b] mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-[#0f172a]">{tasks.length}</p>
          </div>
        </div>

        {/* Organization Cards */}
        {orgSummaries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8f0]">
            <Clock className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
            <p className="text-[#64748b]">No tasks assigned yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orgSummaries.map((org) => (
              <div 
                key={org.orgId} 
                onClick={() => setSelectedOrgId(org.orgId)}
                className="cursor-pointer"
              >
                <Card className="!bg-white !border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      {org.orgLogo ? (
                        <img 
                          src={org.orgLogo} 
                          alt={org.orgName} 
                          className="w-12 h-12 rounded-xl object-contain bg-[#f8f9fa] border border-[#e2e8f0] p-1"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e91e8c] to-[#9333ea] flex items-center justify-center text-white font-bold text-lg">
                          {org.orgName.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-[#0f172a] font-semibold">{org.orgName}</h3>
                        <p className="text-sm text-[#64748b]">{org.totalCount} total tasks</p>
                      </div>
                      {org.pendingCount > 0 ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fef3c7] border border-[#fde68a] rounded-xl">
                          <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
                          <span className="text-sm font-semibold text-[#f59e0b]">
                            {org.pendingCount} pending
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#dcfce7] border border-[#bbf7d0] rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                          <span className="text-sm font-semibold text-[#22c55e]">
                            All done
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Complete Task Modal */}
        {selectedTask && renderCompleteTaskModal()}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="!bg-white !border-[#e2e8f0] shadow-xl max-w-md w-full">
              <CardHeader>
                <CardTitle className="!text-[#0f172a]">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-semibold text-[#475569]">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm(p => ({ ...p, oldPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-semibold text-[#475569]">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Enter new password (min 6 characters)"
                    className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-semibold text-[#475569]">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="!text-[#64748b]"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleChangePassword} disabled={changingPassword}>
                    {changingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Changing...
                      </>
                    ) : (
                      'Change Password'
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

  function renderCompleteTaskModal() {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="!bg-white !border-[#e2e8f0] shadow-xl max-w-lg w-full">
          <CardHeader>
            <CardTitle className="!text-[#0f172a]">Complete Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-[#64748b] mb-1">Task:</p>
              <p className="text-[#0f172a] font-medium">{selectedTask?.title}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8125rem] font-semibold text-[#475569] tracking-wide">
                Proof of Work Type
              </label>
              <select
                value={proofType}
                onChange={(e) => setProofType(e.target.value as any)}
                className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
              >
                <option value="text">Text Description</option>
                <option value="image">Image</option>
                <option value="file">File</option>
              </select>
            </div>

            {proofType === 'text' ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8125rem] font-semibold text-[#475569] tracking-wide">
                  Description
                </label>
                <textarea
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Describe what you completed..."
                  rows={4}
                  className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c] resize-none"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8125rem] font-semibold text-[#475569] tracking-wide">
                  Upload {proofType === 'image' ? 'Image' : 'File'}
                </label>
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-[#e2e8f0] text-[#64748b] text-sm font-medium cursor-pointer hover:bg-[#f1f5f9] transition-colors">
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
                className="!text-[#64748b]"
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
    );
  }
}
