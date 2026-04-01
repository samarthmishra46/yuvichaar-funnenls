'use client';

import { useEffect, useState } from 'react';
import { Plus, Calendar, CheckCircle2, Clock, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Task {
  _id: string;
  dayNumber: number;
  title: string;
  description?: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  proofOfWork?: {
    type: 'text' | 'image' | 'file';
    content?: string;
    fileUrl?: string;
  };
}

interface Roadmap {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
}

interface Staff {
  _id: string;
  email: string;
  name: string;
}

export default function RoadmapTab({ orgId }: { orgId: string }) {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);

  const [taskForm, setTaskForm] = useState({
    dayNumber: 1,
    title: '',
    description: '',
    assignedTo: '',
  });

  useEffect(() => {
    fetchRoadmapData();
    fetchStaff();
  }, [orgId]);

  const fetchRoadmapData = async () => {
    try {
      const res = await fetch(`/api/roadmaps/${orgId}`);
      const data = await res.json();

      if (res.ok && data.roadmap) {
        setRoadmap(data.roadmap);
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Fetch roadmap error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (res.ok) {
        setStaff(data.staff || []);
      }
    } catch (error) {
      console.error('Fetch staff error:', error);
    }
  };

  const handleCreateRoadmap = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          title: '60-Day Roadmap',
          totalDays: 60,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create roadmap');
        return;
      }

      toast.success('Roadmap created successfully');
      await fetchRoadmapData();
    } catch (error) {
      console.error('Create roadmap error:', error);
      toast.error('Failed to create roadmap');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roadmapId: roadmap?._id,
          orgId,
          ...taskForm,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create task');
        return;
      }

      toast.success('Task created successfully');
      setTaskForm({ dayNumber: 1, title: '', description: '', assignedTo: '' });
      setShowCreateTask(false);
      await fetchRoadmapData();
    } catch (error) {
      console.error('Create task error:', error);
      toast.error('Failed to create task');
    }
  };

  const getTasksForDay = (day: number) => {
    return tasks.filter((t) => t.dayNumber === day);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#f472b6]" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
        <p className="text-[#64748b] mb-4">No roadmap created yet</p>
        <Button onClick={handleCreateRoadmap} disabled={creating}>
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Create 60-Day Roadmap
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Roadmap Header */}
      <div className="bg-[rgba(28, 1, 80, 0.04)] rounded-xl p-4 border border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">{roadmap.title}</h3>
          <Badge variant="purple">{roadmap.totalDays} Days</Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-[#94a3b8]">
          <span>
            Start: {new Date(roadmap.startDate).toLocaleDateString()}
          </span>
          <span>•</span>
          <span>
            End: {new Date(roadmap.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Add Task Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-white">Tasks by Day</h3>
        <Button onClick={() => setShowCreateTask(!showCreateTask)} size="sm">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Create Task Form */}
      {showCreateTask && (
        <div className="bg-[rgba(255,255,255,0.04)] rounded-xl p-4 border border-[rgba(255,255,255,0.1)] space-y-4">
          <h4 className="text-sm font-semibold text-white">Create New Task</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="task-day"
              label="Day Number"
              type="number"
              min="1"
              max={roadmap.totalDays}
              value={taskForm.dayNumber}
              onChange={(e) =>
                setTaskForm({ ...taskForm, dayNumber: parseInt(e.target.value) || 1 })
              }
              className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-black"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8125rem] font-semibold text-[#cbd5e1] tracking-wide">
                Assign To
              </label>
              <select
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                className="px-3 py-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl text-black text-sm outline-none focus:border-[#9333ea]"
              >
                <option value="">Unassigned</option>
                {staff.map((s) => (
                  <option key={s._id} value={s.email}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            id="task-title"
            label="Task Title *"
            placeholder="Enter task title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-black"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.8125rem] font-semibold text-[#cbd5e1] tracking-wide">
              Description
            </label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Enter task description"
              rows={3}
              className="px-3 py-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white text-sm outline-none focus:border-[#9333ea] resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowCreateTask(false)}
              className="!text-[#94a3b8]"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </div>
        </div>
      )}

      {/* Day Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white">Select Day</label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(parseInt(e.target.value))}
          className="px-3 py-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white text-sm outline-none focus:border-[#9333ea] max-w-xs"
        >
          {Array.from({ length: roadmap.totalDays }, (_, i) => i + 1).map((day) => (
            <option key={day} value={day}>
              Day {day} {getTasksForDay(day).length > 0 ? `(${getTasksForDay(day).length} tasks)` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Tasks for Selected Day */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white">Day {selectedDay} Tasks</h4>

        {getTasksForDay(selectedDay).length === 0 ? (
          <div className="text-center py-8 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.06)]">
            <Clock className="w-8 h-8 text-[#64748b] mx-auto mb-2" />
            <p className="text-sm text-[#64748b]">No tasks for this day</p>
          </div>
        ) : (
          getTasksForDay(selectedDay).map((task) => (
            <div
              key={task._id}
              className="bg-[rgba(255,255,255,0.04)] rounded-xl p-4 border border-[rgba(255,255,255,0.1)]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="text-white font-medium mb-1">{task.title}</h5>
                  {task.description && (
                    <p className="text-sm text-[#94a3b8] mb-2">{task.description}</p>
                  )}
                </div>
                <Badge variant={getStatusColor(task.status) as any}>
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#64748b]">
                {task.assignedTo && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{task.assignedTo}</span>
                  </div>
                )}
                {task.completedAt && (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Completed {new Date(task.completedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {task.proofOfWork && (
                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <p className="text-xs font-semibold text-[#cbd5e1] mb-1">Proof of Work:</p>
                  {task.proofOfWork.type === 'text' && (
                    <p className="text-sm text-[#94a3b8]">{task.proofOfWork.content}</p>
                  )}
                  {task.proofOfWork.type === 'image' && task.proofOfWork.fileUrl && (
                    <img
                      src={task.proofOfWork.fileUrl}
                      alt="Proof"
                      className="max-w-xs rounded-lg mt-2"
                    />
                  )}
                  {task.proofOfWork.type === 'file' && task.proofOfWork.fileUrl && (
                    <a
                      href={task.proofOfWork.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#f472b6] hover:underline"
                    >
                      View File
                    </a>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
