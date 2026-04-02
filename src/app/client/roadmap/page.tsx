'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Calendar, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronRight, Star } from 'lucide-react';
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

export default function ClientRoadmapPage() {
  const { data: session } = useSession();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [dayTitles, setDayTitles] = useState<Record<number, DayTitle>>({});
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1]));

  useEffect(() => {
    if (session?.user?.orgId) {
      fetchRoadmapData();
    }
  }, [session]);

  const fetchRoadmapData = async () => {
    if (!session?.user?.orgId) return;

    try {
      const res = await fetch(`/api/roadmaps/${session.user.orgId}`);
      const data = await res.json();

      if (res.ok) {
        setRoadmap(data.roadmap);
        setTasks(data.tasks || []);
        setPhases(data.phases || []);
        setDayTitles(data.dayTitles || {});
        
        // Auto-expand current phase
        if (data.roadmap) {
          const startDate = new Date(data.roadmap.startDate);
          const today = new Date();
          const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          const currentPhase = data.phases?.find((p: Phase) => diffDays >= p.startDay && diffDays <= p.endDay);
          if (currentPhase) {
            setExpandedPhases(new Set([currentPhase.id]));
          }
        }
      }
    } catch (error) {
      console.error('Fetch roadmap error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTasksForDay = (day: number) => tasks.filter((t) => t.dayNumber === day);

  const getCompletionPercentage = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  const getDayStatus = (day: number) => {
    const dayTasks = getTasksForDay(day);
    if (dayTasks.length === 0) return 'empty';
    if (dayTasks.every((t) => t.status === 'completed')) return 'completed';
    if (dayTasks.some((t) => t.status === 'waiting_on_client')) return 'waiting';
    if (dayTasks.some((t) => t.status === 'in_progress')) return 'in_progress';
    return 'pending';
  };

  const getPhaseProgress = (phase: Phase) => {
    const phaseTasks = tasks.filter((t) => t.dayNumber >= phase.startDay && t.dayNumber <= phase.endDay);
    if (phaseTasks.length === 0) return 0;
    const completed = phaseTasks.filter((t) => t.status === 'completed').length;
    return Math.round((completed / phaseTasks.length) * 100);
  };

  const togglePhase = (phaseId: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
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

  const getCurrentDay = () => {
    if (!roadmap) return 1;
    const startDate = new Date(roadmap.startDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(diffDays, roadmap.totalDays));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#e91e8c]" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="text-center py-16">
        <Calendar className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
        <p className="text-[#64748b]">No roadmap available yet</p>
        <p className="text-sm text-[#475569] mt-2">Your roadmap will appear here once created by the admin</p>
      </div>
    );
  }

  const currentDay = getCurrentDay();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">60-Day Growth Marathon</h1>
        <p className="text-sm text-[#64748b] mt-1">Track your project progress day by day</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-[#e91e8c]" />
              <span className="text-xs text-[#64748b]">Current Day</span>
            </div>
            <p className="text-xl font-bold text-[#0f172a]">Day {currentDay}</p>
          </CardContent>
        </Card>

        <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
              <span className="text-xs text-[#64748b]">Completed</span>
            </div>
            <p className="text-xl font-bold text-[#0f172a]">
              {tasks.filter((t) => t.status === 'completed').length}/{tasks.length}
            </p>
          </CardContent>
        </Card>

        <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-xs text-[#64748b]">In Progress</span>
            </div>
            <p className="text-xl font-bold text-[#0f172a]">
              {tasks.filter((t) => t.status === 'in_progress').length}
            </p>
          </CardContent>
        </Card>

        <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-[#3b82f6]" />
              <span className="text-xs text-[#64748b]">Progress</span>
            </div>
            <p className="text-xl font-bold text-[#0f172a]">{getCompletionPercentage()}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[#0f172a]">Overall Progress</span>
          <span className="text-sm text-[#64748b]">{getCompletionPercentage()}%</span>
        </div>
        <div className="w-full h-3 bg-[#f1f5f9] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#8b5cf6] via-[#e91e8c] to-[#f59e0b] transition-all duration-500"
            style={{ width: `${getCompletionPercentage()}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-[#64748b]">
          <span>{new Date(roadmap.startDate).toLocaleDateString()}</span>
          <span>{new Date(roadmap.endDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {phases.map((phase) => {
          const isExpanded = expandedPhases.has(phase.id);
          const phaseProgress = getPhaseProgress(phase);
          const daysWithTasks = getDaysWithTasks(phase);
          const isCurrentPhase = currentDay >= phase.startDay && currentDay <= phase.endDay;

          return (
            <Card
              key={phase.id}
              className={`!border-[#e2e8f0] shadow-sm overflow-hidden ${isCurrentPhase ? '!border-l-4' : ''}`}
              style={{ borderLeftColor: isCurrentPhase ? phase.color : undefined }}
            >
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
                        const isToday = day === currentDay;

                        return (
                          <div key={day} className="bg-white">
                            {/* Day Header */}
                            <button
                              onClick={() => toggleDay(day)}
                              className={`w-full p-3 pl-6 flex items-center justify-between hover:bg-[#f8f9fa] transition-colors ${
                                isToday ? 'bg-[#fdf2f8]' : ''
                              }`}
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
                                  {dayStatus === 'completed' ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    day
                                  )}
                                </div>
                                <div className="text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-[#0f172a]">
                                      Day {day}{dayInfo ? ` — ${dayInfo.title}` : ''}
                                    </span>
                                    {dayInfo?.milestone && (
                                      <Star className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
                                    )}
                                    {isToday && (
                                      <Badge variant="purple" className="text-xs">Today</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#64748b]">
                                    {dayTasks.filter((t) => t.status === 'completed').length}/{dayTasks.length} tasks completed
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    dayStatus === 'completed'
                                      ? 'success'
                                      : dayStatus === 'in_progress'
                                      ? 'warning'
                                      : dayStatus === 'waiting'
                                      ? 'default'
                                      : 'default'
                                  }
                                >
                                  {dayStatus === 'waiting' ? 'Waiting on you' : dayStatus.replace('_', ' ')}
                                </Badge>
                                {isDayExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-[#64748b]" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-[#64748b]" />
                                )}
                              </div>
                            </button>

                            {/* Day Tasks */}
                            {isDayExpanded && dayTasks.length > 0 && (
                              <div className="pl-14 pr-4 pb-3 space-y-2">
                                {dayTasks.map((task) => (
                                  <div
                                    key={task._id}
                                    className={`flex items-center gap-3 p-2 rounded-lg ${
                                      task.status === 'completed'
                                        ? 'bg-[#f0fdf4]'
                                        : task.status === 'waiting_on_client'
                                        ? 'bg-[#eff6ff]'
                                        : task.status === 'in_progress'
                                        ? 'bg-[#fffbeb]'
                                        : 'bg-[#f8f9fa]'
                                    }`}
                                  >
                                    <div
                                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
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
                                    <span
                                      className={`text-sm flex-1 ${
                                        task.status === 'completed' ? 'text-[#64748b] line-through' : 'text-[#0f172a]'
                                      }`}
                                    >
                                      {task.title}
                                    </span>
                                    {task.status === 'waiting_on_client' && (
                                      <span className="text-xs text-[#3b82f6] font-medium">Waiting on you</span>
                                    )}
                                  </div>
                                ))}
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
