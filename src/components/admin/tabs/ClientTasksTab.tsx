'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, CheckCircle2, Clock, AlertCircle, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  clientRespondedAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface ClientTasksTabProps {
  orgId: string;
  orgName: string;
}

const taskTypeOptions = [
  { value: 'credentials', label: 'Credentials (ID/Password)' },
  { value: 'access', label: 'Access Request' },
  { value: 'document', label: 'Document' },
  { value: 'information', label: 'Information' },
  { value: 'other', label: 'Other' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export default function ClientTasksTab({ orgId, orgName }: ClientTasksTabProps) {
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ClientTask | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    taskType: 'credentials',
    priority: 'medium',
  });

  useEffect(() => {
    fetchTasks();
  }, [orgId]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/client-tasks?orgId=${orgId}`);
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

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/client-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, orgId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create task');
        return;
      }

      toast.success('Task sent to client');
      setShowForm(false);
      setForm({ title: '', description: '', taskType: 'credentials', priority: 'medium' });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkComplete = async (taskId: string) => {
    try {
      const res = await fetch(`/api/client-tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (res.ok) {
        toast.success('Task marked as complete');
        setSelectedTask(null);
        fetchTasks();
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`/api/client-tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Task deleted');
        fetchTasks();
      }
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#e91e8c]" />
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#0f172a]">Client Tasks</h2>
          <p className="text-sm text-[#64748b]">Request information or credentials from {orgName}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#fef3c7] border border-[#fde68a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-[#d97706]" />
            <span className="text-sm text-[#92400e]">Pending</span>
          </div>
          <p className="text-2xl font-bold text-[#d97706]">{pendingTasks.length}</p>
        </div>
        <div className="bg-[#dbeafe] border border-[#bfdbfe] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-[#2563eb]" />
            <span className="text-sm text-[#1e40af]">Responded</span>
          </div>
          <p className="text-2xl font-bold text-[#2563eb]">{inProgressTasks.length}</p>
        </div>
        <div className="bg-[#dcfce7] border border-[#bbf7d0] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
            <span className="text-sm text-[#166534]">Completed</span>
          </div>
          <p className="text-2xl font-bold text-[#16a34a]">{completedTasks.length}</p>
        </div>
      </div>

      {/* New Task Form */}
      {showForm && (
        <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
          <CardHeader>
            <CardTitle className="!text-[#0f172a]">Request from Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8125rem] font-semibold text-[#475569]">Request Type</label>
                <select
                  value={form.taskType}
                  onChange={(e) => setForm((p) => ({ ...p, taskType: e.target.value }))}
                  className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
                >
                  {taskTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8125rem] font-semibold text-[#475569]">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                  className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
                >
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8125rem] font-semibold text-[#475569]">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Instagram Login Credentials"
                className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8125rem] font-semibold text-[#475569]">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe what you need from the client..."
                rows={3}
                className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c] resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowForm(false)} className="!text-[#64748b]">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
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

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#e2e8f0]">
          <AlertCircle className="w-10 h-10 text-[#64748b] mx-auto mb-3" />
          <p className="text-[#0f172a] font-semibold">No requests yet</p>
          <p className="text-sm text-[#64748b] mt-1">Create a request to ask the client for information</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pending & In Progress */}
          {[...pendingTasks, ...inProgressTasks].map((task) => (
            <div
              key={task._id}
              className="cursor-pointer"
              onClick={() => setSelectedTask(task)}
            >
              <Card
                className={`!border-[#e2e8f0] shadow-sm hover:border-[#e91e8c] transition-colors ${
                  task.status === 'in_progress' ? '!bg-[#eff6ff]' : '!bg-white'
                }`}
              >
                <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={task.priority === 'urgent' ? 'error' : task.priority === 'high' ? 'warning' : 'default'}
                      >
                        {task.priority}
                      </Badge>
                      <Badge variant="purple">{task.taskType}</Badge>
                      {task.status === 'in_progress' && (
                        <Badge variant="success">Client Responded</Badge>
                      )}
                    </div>
                    <p className="font-semibold text-[#0f172a]">{task.title}</p>
                    <p className="text-sm text-[#64748b] line-clamp-2">{task.description}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }}
                    className="p-2 text-[#64748b] hover:text-[#ef4444] hover:bg-[#fee2e2] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-[#94a3b8] mt-2">
                  Created {new Date(task.createdAt).toLocaleDateString()} by {task.createdBy}
                </p>
              </CardContent>
            </Card>
            </div>
          ))}

          {/* Completed */}
          {completedTasks.length > 0 && (
            <div className="pt-4 border-t border-[#e2e8f0]">
              <p className="text-sm font-semibold text-[#475569] mb-3">Completed</p>
              {completedTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-3 bg-[#f8f9fa] rounded-xl mb-2"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                    <span className="text-[#64748b]">{task.title}</span>
                  </div>
                  <span className="text-xs text-[#94a3b8]">
                    {task.completedAt && new Date(task.completedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Detail Modal */}
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
                  onClick={() => setSelectedTask(null)}
                  className="p-2 rounded-lg hover:bg-[#f8f9fa] text-[#64748b]"
                >
                  ✕
                </button>
              </div>

              <div className="bg-[#f8f9fa] rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-[#475569] mb-1">Request:</p>
                <p className="text-[#0f172a]">{selectedTask.description}</p>
              </div>

              {selectedTask.clientResponse && (
                <div className="bg-[#dcfce7] rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-[#166534] mb-1">Client Response:</p>
                  <p className="text-[#0f172a] whitespace-pre-wrap">{selectedTask.clientResponse}</p>
                  {selectedTask.clientRespondedAt && (
                    <p className="text-xs text-[#166534] mt-2">
                      Responded on {new Date(selectedTask.clientRespondedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setSelectedTask(null)} className="!text-[#64748b]">
                  Close
                </Button>
                {selectedTask.status !== 'completed' && selectedTask.clientResponse && (
                  <Button onClick={() => handleMarkComplete(selectedTask._id)} className="!bg-[#22c55e] hover:!bg-[#16a34a]">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
