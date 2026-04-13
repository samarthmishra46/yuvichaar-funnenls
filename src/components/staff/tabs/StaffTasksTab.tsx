'use client';

import { useEffect, useState, useMemo } from 'react';
import { Loader2, Plus, CheckCircle2, Clock, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Task {
  _id: string;
  orgId: string;
  roadmapId: string;
  dayNumber: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  completedAt?: string;
}

interface Roadmap {
  _id: string;
  startDate: string;
  totalDays: number;
}

interface StaffTasksTabProps {
  orgId: string;
  staffEmail: string;
}

export default function StaffTasksTab({ orgId, staffEmail }: StaffTasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [proofType, setProofType] = useState<'text' | 'image' | 'file'>('text');
  const [proofText, setProofText] = useState('');
  const [proofFile, setProofFile] = useState('');
  const [uploading, setUploading] = useState(false);
  const [completingTask, setCompletingTask] = useState(false);

  const [newTaskForm, setNewTaskForm] = useState({
    dayNumber: 1,
    title: '',
    description: '',
  });

  const fetchData = async () => {
    try {
      // Fetch roadmap
      const roadmapRes = await fetch(`/api/roadmaps/${orgId}`);
      const roadmapData = await roadmapRes.json();
      if (roadmapData.roadmap) {
        setRoadmap(roadmapData.roadmap);
      }

      // Fetch tasks assigned to this staff
      const tasksRes = await fetch(`/api/tasks?orgId=${orgId}&assignedTo=${encodeURIComponent(staffEmail)}`);
      const tasksData = await tasksRes.json();
      setTasks(tasksData.tasks || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId, staffEmail]);

  // Get available days for adding tasks
  const availableDays = useMemo(() => {
    if (!roadmap) return [];
    return Array.from({ length: roadmap.totalDays }, (_, i) => i + 1);
  }, [roadmap]);

  // Group tasks by day
  const tasksByDay = useMemo(() => {
    const grouped = new Map<number, Task[]>();
    tasks.forEach((task) => {
      if (!grouped.has(task.dayNumber)) {
        grouped.set(task.dayNumber, []);
      }
      grouped.get(task.dayNumber)!.push(task);
    });
    return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);
  }, [tasks]);

  // Calculate pending tasks (due today or before)
  const pendingTasks = useMemo(() => {
    if (!roadmap) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(roadmap.startDate);
    startDate.setHours(0, 0, 0, 0);

    return tasks.filter((task) => {
      if (task.status === 'completed') return false;
      const taskDueDate = new Date(startDate);
      taskDueDate.setDate(taskDueDate.getDate() + task.dayNumber - 1);
      return taskDueDate <= today;
    });
  }, [tasks, roadmap]);

  const handleAddTask = async () => {
    if (!newTaskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    if (!roadmap) {
      toast.error('No roadmap found for this organization');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          roadmapId: roadmap._id,
          dayNumber: newTaskForm.dayNumber,
          title: newTaskForm.title,
          description: newTaskForm.description,
          assignedTo: staffEmail, // Auto-assign to self
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to add task');
        return;
      }

      toast.success('Task added and assigned to you');
      setNewTaskForm({ dayNumber: 1, title: '', description: '' });
      setShowAddForm(false);
      fetchData();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
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

    setCompletingTask(true);
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
      fetchData();
    } catch {
      toast.error('Failed to complete task');
    } finally {
      setCompletingTask(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full !bg-[#f8f9fa]" />
        ))}
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="text-center py-12">
        <Clock className="w-10 h-10 mx-auto text-[#475569] mb-3" />
        <p className="text-[#64748b] text-sm">No roadmap found for this organization</p>
        <p className="text-xs text-[#94a3b8] mt-1">The admin needs to create a roadmap first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-sm text-[#64748b] mb-1">Total Tasks</p>
          <p className="text-2xl font-bold text-[#0f172a]">{tasks.length}</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-sm text-[#64748b] mb-1">Pending (Due)</p>
          <p className="text-2xl font-bold text-[#f59e0b]">{pendingTasks.length}</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-sm text-[#64748b] mb-1">Completed</p>
          <p className="text-2xl font-bold text-[#22c55e]">
            {tasks.filter((t) => t.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Add Task Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'outline' : 'default'}
          className={showAddForm ? '!border-[#e2e8f0] !text-[#64748b]' : ''}
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Add Task for Myself'}
        </Button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
          <CardHeader>
            <CardTitle className="!text-[#0f172a] text-lg">Add a Task for Yourself</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8125rem] font-semibold text-[#475569]">Day Number</label>
              <select
                value={newTaskForm.dayNumber}
                onChange={(e) => setNewTaskForm((p) => ({ ...p, dayNumber: parseInt(e.target.value) }))}
                className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
              >
                {availableDays.map((day) => (
                  <option key={day} value={day}>
                    Day {day}
                  </option>
                ))}
              </select>
            </div>

            <Input
              id="task-title"
              label="Task Title"
              placeholder="What needs to be done?"
              value={newTaskForm.title}
              onChange={(e) => setNewTaskForm((p) => ({ ...p, title: e.target.value }))}
              className="!bg-white !border-[#e2e8f0] !text-[#0f172a]"
            />

            <Textarea
              id="task-desc"
              label="Description (Optional)"
              placeholder="Add more details..."
              value={newTaskForm.description}
              onChange={(e) => setNewTaskForm((p) => ({ ...p, description: e.target.value }))}
              className="!bg-white !border-[#e2e8f0] !text-[#0f172a] !min-h-[80px]"
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 This task will be automatically assigned to you ({staffEmail})
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAddTask} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                  </>
                ) : (
                  'Add Task'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#e2e8f0]">
          <CheckCircle2 className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
          <p className="text-[#64748b]">No tasks assigned to you yet</p>
          <p className="text-sm text-[#94a3b8] mt-1">Add a task for yourself using the button above</p>
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
                        <Button onClick={() => setSelectedTask(task)} size="sm" className="mt-2">
                          Mark as Complete
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete Task Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="!bg-white !border-[#e2e8f0] shadow-xl max-w-lg w-full">
            <CardHeader>
              <CardTitle className="!text-[#0f172a]">Complete Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-[#64748b] mb-1">Task:</p>
                <p className="text-[#0f172a] font-medium">{selectedTask.title}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8125rem] font-semibold text-[#475569]">
                  Proof of Work Type
                </label>
                <select
                  value={proofType}
                  onChange={(e) => setProofType(e.target.value as 'text' | 'image' | 'file')}
                  className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
                >
                  <option value="text">Text Description</option>
                  <option value="image">Image</option>
                  <option value="file">File</option>
                </select>
              </div>

              {proofType === 'text' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8125rem] font-semibold text-[#475569]">
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
                  <label className="text-[0.8125rem] font-semibold text-[#475569]">
                    Upload {proofType === 'image' ? 'Image' : 'File'}
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-[#e2e8f0] text-[#64748b] text-sm font-medium cursor-pointer hover:bg-[#f1f5f9] transition-colors">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {proofFile ? '✓ File Uploaded' : uploading ? 'Uploading...' : 'Choose File'}
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
                <Button onClick={handleCompleteTask} disabled={completingTask}>
                  {completingTask ? (
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

      {/* Info Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          ⚠️ <strong>Note:</strong> You can add tasks for yourself but cannot delete tasks. Only admins can delete tasks.
        </p>
      </div>
    </div>
  );
}
