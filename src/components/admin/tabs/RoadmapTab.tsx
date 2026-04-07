'use client';

import { useEffect, useState } from 'react';
import { Plus, Calendar, CheckCircle2, Clock, Loader2, User, ChevronDown, ChevronRight, Star, AlertCircle, Trash2, Settings } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Task {
  _id: string;
  dayNumber: number;
  title: string;
  description?: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'waiting_on_client';
  completedAt?: string;
}

interface Roadmap {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
}

interface Phase {
  id: number;
  name: string;
  startDay: number;
  endDay: number;
  color: string;
}

interface DayTitle {
  title: string;
  milestone?: boolean;
}

interface Staff {
  _id: string;
  email: string;
  name: string;
}

interface Template {
  _id: string;
  name: string;
  description?: string;
  totalDays: number;
  isDefault?: boolean;
}

export default function RoadmapTab({ orgId }: { orgId: string }) {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [dayTitles, setDayTitles] = useState<Record<number, DayTitle>>({});
  const [staff, setStaff] = useState<Staff[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1]));
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [addingTaskForDay, setAddingTaskForDay] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

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

      if (res.ok) {
        setRoadmap(data.roadmap);
        setTasks(data.tasks || []);
        setPhases(data.phases || []);
        setDayTitles(data.dayTitles || {});
        if (data.templates) {
          setTemplates(data.templates);
          // Select default template if available
          const defaultTemplate = data.templates.find((t: Template) => t.isDefault);
          if (defaultTemplate) {
            setSelectedTemplateId(defaultTemplate._id);
          } else if (data.templates.length > 0) {
            setSelectedTemplateId(data.templates[0]._id);
          }
        }
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
      const res = await fetch(`/api/roadmaps/${orgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startDate,
          templateId: selectedTemplateId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create roadmap');
        return;
      }

      toast.success('Roadmap initialized!');
      setRoadmap(data.roadmap);
      setTasks(data.tasks || []);
      setPhases(data.phases || []);
      setDayTitles(data.dayTitles || {});
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
      await fetchRoadmapData();
    } catch (error) {
      console.error('Create task error:', error);
      toast.error('Failed to create task');
    }
  };

  const handleAddTaskForDay = async (dayNumber: number) => {
    if (!newTaskTitle.trim()) {
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
          dayNumber,
          title: newTaskTitle,
          assignedTo: newTaskAssignee || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create task');
        return;
      }

      toast.success('Task added successfully');
      setNewTaskTitle('');
      setNewTaskAssignee('');
      setAddingTaskForDay(null);
      await fetchRoadmapData();
    } catch (error) {
      console.error('Create task error:', error);
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTaskAssignment = async (taskId: string, assignedTo: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo }),
      });

      if (!res.ok) {
        toast.error('Failed to update task');
        return;
      }

      toast.success('Task updated');
      setEditingTask(null);
      await fetchRoadmapData();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        toast.error('Failed to delete task');
        return;
      }

      toast.success('Task deleted');
      await fetchRoadmapData();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getTasksForDay = (day: number) => tasks.filter((t) => t.dayNumber === day);

  const getPhaseProgress = (phase: Phase) => {
    const phaseTasks = tasks.filter((t) => t.dayNumber >= phase.startDay && t.dayNumber <= phase.endDay);
    if (phaseTasks.length === 0) return 0;
    const completed = phaseTasks.filter((t) => t.status === 'completed').length;
    return Math.round((completed / phaseTasks.length) * 100);
  };

  const getDayStatus = (day: number) => {
    const dayTasks = getTasksForDay(day);
    if (dayTasks.length === 0) return 'empty';
    if (dayTasks.every((t) => t.status === 'completed')) return 'completed';
    if (dayTasks.some((t) => t.status === 'waiting_on_client')) return 'waiting';
    if (dayTasks.some((t) => t.status === 'in_progress')) return 'in_progress';
    return 'pending';
  };

  const togglePhase = (phaseId: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const getDaysWithTasks = (phase: Phase) => {
    const days: number[] = [];
    for (let d = phase.startDay; d <= phase.endDay; d++) {
      if (dayTitles[d] || getTasksForDay(d).length > 0) {
        days.push(d);
      }
    }
    return days;
  };

  const getCompletionPercentage = () => {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#e91e8c]" />
      </div>
    );
  }

  if (!roadmap) {
    const selectedTemplate = templates.find(t => t._id === selectedTemplateId);
    
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-[#e2e8f0]">
        <Calendar className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[#0f172a] mb-2">Start Roadmap</h3>
        <p className="text-sm text-[#64748b] mb-6 max-w-md mx-auto">
          Select a template and initialize the roadmap. Tasks will be created automatically from the template.
        </p>
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          {/* Template Selection */}
          {templates.length > 0 && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-[#64748b]">Select Template:</label>
                <Link 
                  href="/admin/templates" 
                  className="text-xs text-[#e91e8c] hover:underline flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  Manage Templates
                </Link>
              </div>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
              >
                <option value="">-- Select a template --</option>
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.totalDays} days) {t.isDefault ? '★' : ''}
                  </option>
                ))}
              </select>
              {selectedTemplate && selectedTemplate.description && (
                <p className="text-xs text-[#94a3b8] mt-1 text-left">{selectedTemplate.description}</p>
              )}
            </div>
          )}
          {templates.length === 0 && (
            <div className="w-full text-center">
              <p className="text-sm text-[#f59e0b] bg-[#fffbeb] px-4 py-2 rounded-lg mb-3">
                No templates found. Create a template first.
              </p>
              <Link href="/admin/templates">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Template
                </Button>
              </Link>
            </div>
          )}
          
          {/* Start Date */}
          <div className="w-full">
            <label className="block text-sm text-[#64748b] mb-2 text-left">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
            />
          </div>
          
          <Button 
            onClick={handleCreateRoadmap} 
            disabled={creating || !selectedTemplateId}
            className="w-full"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Initializing...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Initialize {selectedTemplate ? selectedTemplate.name : 'Roadmap'}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-[#0f172a]">{roadmap.title}</h3>
            <p className="text-sm text-[#64748b]">
              {new Date(roadmap.startDate).toLocaleDateString()} — {new Date(roadmap.endDate).toLocaleDateString()} ({roadmap.totalDays} days)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/templates" 
              className="text-xs text-[#e91e8c] hover:underline flex items-center gap-1 px-3 py-1.5 border border-[#e91e8c] rounded-lg hover:bg-[#fdf2f8] transition-colors"
            >
              <Settings className="w-3 h-3" />
              Manage Templates
            </Link>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#0f172a]">{getCompletionPercentage()}%</p>
              <p className="text-xs text-[#64748b]">Complete</p>
            </div>
          </div>
        </div>
        <div className="w-full h-3 bg-[#f1f5f9] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#8b5cf6] via-[#e91e8c] to-[#f59e0b] transition-all duration-500"
            style={{ width: `${getCompletionPercentage()}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-[#64748b]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
            {tasks.filter((t) => t.status === 'completed').length} completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
            {tasks.filter((t) => t.status === 'in_progress').length} in progress
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#94a3b8]"></span>
            {tasks.filter((t) => t.status === 'pending').length} pending
          </span>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {phases.map((phase) => {
          const isExpanded = expandedPhases.has(phase.id);
          const phaseProgress = getPhaseProgress(phase);
          const daysWithTasks = getDaysWithTasks(phase);

          return (
            <Card key={phase.id} className="!border-[#e2e8f0] shadow-sm overflow-hidden">
              {/* Phase Header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-[#f8f9fa] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: phase.color }}
                  >
                    {phase.id}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-[#0f172a]">{phase.name}</h3>
                    <p className="text-xs text-[#64748b]">Days {phase.startDay}–{phase.endDay}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#0f172a]">{phaseProgress}%</p>
                    <div className="w-24 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{ width: `${phaseProgress}%`, backgroundColor: phase.color }}
                      />
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-[#64748b]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#64748b]" />
                  )}
                </div>
              </button>

              {/* Phase Content - Days */}
              {isExpanded && (
                <div className="border-t border-[#e2e8f0] bg-[#f8f9fa]">
                  {daysWithTasks.length === 0 ? (
                    <div className="p-4 text-center text-sm text-[#64748b]">
                      No scheduled activities in this phase yet
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e2e8f0]">
                      {daysWithTasks.map((day) => {
                        const dayInfo = dayTitles[day];
                        const dayTasks = getTasksForDay(day);
                        const dayStatus = getDayStatus(day);
                        const isDayExpanded = expandedDays.has(day);

                        return (
                          <div key={day} className="bg-white">
                            {/* Day Header */}
                            <button
                              onClick={() => toggleDay(day)}
                              className="w-full p-3 pl-6 flex items-center justify-between hover:bg-[#f8f9fa] transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                    dayStatus === 'completed'
                                      ? 'bg-[#dcfce7] text-[#22c55e]'
                                      : dayStatus === 'in_progress'
                                      ? 'bg-[#fef3c7] text-[#f59e0b]'
                                      : dayStatus === 'waiting'
                                      ? 'bg-[#dbeafe] text-[#3b82f6]'
                                      : 'bg-[#f1f5f9] text-[#64748b]'
                                  }`}
                                >
                                  {dayStatus === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : day}
                                </div>
                                <div className="text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-[#0f172a]">
                                      Day {day}{dayInfo ? ` — ${dayInfo.title}` : ''}
                                    </span>
                                    {dayInfo?.milestone && (
                                      <Star className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
                                    )}
                                  </div>
                                  <p className="text-xs text-[#64748b]">
                                    {dayTasks.filter((t) => t.status === 'completed').length}/{dayTasks.length} tasks
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    dayStatus === 'completed' ? 'success' : dayStatus === 'in_progress' ? 'warning' : 'default'
                                  }
                                >
                                  {dayStatus === 'waiting' ? 'Waiting on client' : dayStatus.replace('_', ' ')}
                                </Badge>
                                {isDayExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-[#64748b]" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-[#64748b]" />
                                )}
                              </div>
                            </button>

                            {/* Day Tasks */}
                            {isDayExpanded && (
                              <div className="pl-14 pr-4 pb-3 space-y-2">
                                {dayTasks.map((task) => (
                                  <div
                                    key={task._id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                                      task.status === 'completed'
                                        ? 'bg-[#f0fdf4] border-[#bbf7d0]'
                                        : task.status === 'waiting_on_client'
                                        ? 'bg-[#eff6ff] border-[#bfdbfe]'
                                        : task.status === 'in_progress'
                                        ? 'bg-[#fffbeb] border-[#fde68a]'
                                        : 'bg-white border-[#e2e8f0]'
                                    }`}
                                  >
                                    <div
                                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        task.status === 'completed'
                                          ? 'bg-[#22c55e] text-white'
                                          : task.status === 'waiting_on_client'
                                          ? 'bg-[#3b82f6] text-white'
                                          : task.status === 'in_progress'
                                          ? 'bg-[#f59e0b] text-white'
                                          : 'bg-[#e2e8f0]'
                                      }`}
                                    >
                                      {task.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                                      {task.status === 'in_progress' && <Clock className="w-3 h-3" />}
                                      {task.status === 'waiting_on_client' && <AlertCircle className="w-3 h-3" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span
                                        className={`text-sm ${
                                          task.status === 'completed' ? 'text-[#64748b] line-through' : 'text-[#0f172a]'
                                        }`}
                                      >
                                        {task.title}
                                      </span>
                                      {task.assignedTo && (
                                        <p className="text-xs text-[#94a3b8] flex items-center gap-1 mt-0.5">
                                          <User className="w-3 h-3" /> {task.assignedTo}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {editingTask === task._id ? (
                                        <select
                                          value={task.assignedTo || ''}
                                          onChange={(e) => handleUpdateTaskAssignment(task._id, e.target.value)}
                                          onBlur={() => setEditingTask(null)}
                                          autoFocus
                                          className="px-2 py-1 text-xs bg-white border border-[#e2e8f0] rounded-lg outline-none focus:border-[#e91e8c]"
                                        >
                                          <option value="">Unassigned</option>
                                          {staff.map((s) => (
                                            <option key={s._id} value={s.email}>{s.name}</option>
                                          ))}
                                        </select>
                                      ) : (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setEditingTask(task._id); }}
                                          className="text-xs text-[#e91e8c] hover:underline"
                                        >
                                          {task.assignedTo ? 'Reassign' : 'Assign'}
                                        </button>
                                      )}
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                                        className="p-1 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        title="Delete task"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                {/* Add Task Button/Form */}
                                {addingTaskForDay === day ? (
                                  <div className="flex items-center gap-2 p-3 rounded-lg border border-[#e91e8c] bg-[#fdf2f8]">
                                    <input
                                      type="text"
                                      placeholder="Task title..."
                                      value={newTaskTitle}
                                      onChange={(e) => setNewTaskTitle(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleAddTaskForDay(day)}
                                      autoFocus
                                      className="flex-1 px-2 py-1 text-sm bg-white border border-[#e2e8f0] rounded-lg outline-none focus:border-[#e91e8c]"
                                    />
                                    <select
                                      value={newTaskAssignee}
                                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                                      className="px-2 py-1 text-xs bg-white border border-[#e2e8f0] rounded-lg outline-none focus:border-[#e91e8c]"
                                    >
                                      <option value="">Assign to...</option>
                                      {staff.map((s) => (
                                        <option key={s._id} value={s.email}>{s.name}</option>
                                      ))}
                                    </select>
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddTaskForDay(day)}
                                      className="!py-1 !px-3"
                                    >
                                      Add
                                    </Button>
                                    <button
                                      onClick={() => {
                                        setAddingTaskForDay(null);
                                        setNewTaskTitle('');
                                        setNewTaskAssignee('');
                                      }}
                                      className="text-xs text-[#64748b] hover:text-[#0f172a]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setAddingTaskForDay(day)}
                                    className="flex items-center gap-2 w-full p-2 rounded-lg border border-dashed border-[#e2e8f0] text-sm text-[#64748b] hover:border-[#e91e8c] hover:text-[#e91e8c] hover:bg-[#fdf2f8] transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add Task
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
