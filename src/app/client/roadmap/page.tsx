'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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

export default function ClientRoadmapPage() {
  const { data: session } = useSession();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);

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

  const getTasksForDay = (day: number) => {
    return tasks.filter((t) => t.dayNumber === day);
  };

  const getCompletionPercentage = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  const getDayStatus = (day: number) => {
    const dayTasks = getTasksForDay(day);
    if (dayTasks.length === 0) return 'empty';
    if (dayTasks.every((t) => t.status === 'completed')) return 'completed';
    if (dayTasks.some((t) => t.status === 'in_progress')) return 'in_progress';
    return 'pending';
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
      <div className="text-center py-16">
        <Calendar className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
        <p className="text-[#64748b]">No roadmap available yet</p>
        <p className="text-sm text-[#475569] mt-2">Your roadmap will appear here once created by the admin</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{roadmap.title}</h1>
        <p className="text-sm text-[#64748b] mt-1">Track your project progress</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-[#f472b6]" />
              <span className="text-sm text-[#64748b]">Total Days</span>
            </div>
            <p className="text-2xl font-bold text-white">{roadmap.totalDays}</p>
          </CardContent>
        </Card>

        <Card className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
              <span className="text-sm text-[#64748b]">Completed Tasks</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {tasks.filter((t) => t.status === 'completed').length}/{tasks.length}
            </p>
          </CardContent>
        </Card>

        <Card className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-[#f59e0b]" />
              <span className="text-sm text-[#64748b]">Progress</span>
            </div>
            <p className="text-2xl font-bold text-white">{getCompletionPercentage()}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="bg-[rgba(255,255,255,0.04)] rounded-xl p-4 border border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">Overall Progress</span>
          <span className="text-sm text-[#94a3b8]">{getCompletionPercentage()}%</span>
        </div>
        <div className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#9333ea] to-[#f472b6] transition-all duration-500"
            style={{ width: `${getCompletionPercentage()}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-[rgba(255,255,255,0.04)] rounded-xl p-4 border border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-[#64748b]">Start Date:</span>
            <span className="text-white ml-2">{new Date(roadmap.startDate).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-[#64748b]">End Date:</span>
            <span className="text-white ml-2">{new Date(roadmap.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Day Grid */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4">Daily Progress</h3>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-6">
          {Array.from({ length: roadmap.totalDays }, (_, i) => i + 1).map((day) => {
            const status = getDayStatus(day);
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                  selectedDay === day
                    ? 'bg-[#f472b6] text-white scale-110'
                    : status === 'completed'
                    ? 'bg-[rgba(16,185,129,0.2)] text-[#10b981] hover:bg-[rgba(16,185,129,0.3)]'
                    : status === 'in_progress'
                    ? 'bg-[rgba(245,158,11,0.2)] text-[#f59e0b] hover:bg-[rgba(245,158,11,0.3)]'
                    : status === 'pending'
                    ? 'bg-[rgba(255,255,255,0.04)] text-[#64748b] hover:bg-[rgba(255,255,255,0.08)]'
                    : 'bg-[rgba(255,255,255,0.02)] text-[#475569]'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Tasks */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4">Day {selectedDay} Tasks</h3>

        {getTasksForDay(selectedDay).length === 0 ? (
          <div className="text-center py-8 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.06)]">
            <Clock className="w-8 h-8 text-[#64748b] mx-auto mb-2" />
            <p className="text-sm text-[#64748b]">No tasks scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {getTasksForDay(selectedDay).map((task) => (
              <Card key={task._id} className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-[#94a3b8] mb-2">{task.description}</p>
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

                  {task.assignedTo && (
                    <p className="text-xs text-[#64748b] mb-2">Assigned to: {task.assignedTo}</p>
                  )}

                  {task.completedAt && (
                    <div className="flex items-center gap-2 text-xs text-[#10b981] mb-2">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Completed on {new Date(task.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}

                  {task.proofOfWork && (
                    <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                      <p className="text-xs font-semibold text-[#cbd5e1] mb-2">Proof of Work:</p>
                      {task.proofOfWork.type === 'text' && (
                        <p className="text-sm text-[#94a3b8] bg-[rgba(255,255,255,0.04)] rounded-lg p-3">
                          {task.proofOfWork.content}
                        </p>
                      )}
                      {task.proofOfWork.type === 'image' && task.proofOfWork.fileUrl && (
                        <img
                          src={task.proofOfWork.fileUrl}
                          alt="Proof"
                          className="max-w-md rounded-lg border border-[rgba(255,255,255,0.1)]"
                        />
                      )}
                      {task.proofOfWork.type === 'file' && task.proofOfWork.fileUrl && (
                        <a
                          href={task.proofOfWork.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#f472b6] hover:underline inline-flex items-center gap-1"
                        >
                          View Attached File →
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
