'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Video, FileText, CreditCard, User, MapPin, Scale, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    mouUrl?: string;
    sowUrl?: string;
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

  useEffect(() => {
    if (session?.user?.orgId) {
      Promise.all([
        fetch(`/api/organizations/${session.user.orgId}`).then((r) => r.json()),
        fetch(`/api/organizations/${session.user.orgId}/videos`).then((r) => r.json()),
        fetch(`/api/organizations/${session.user.orgId}/research`).then((r) => r.json()),
        fetch(`/api/roadmaps/${session.user.orgId}`).then((r) => r.json()).catch(() => ({ roadmap: null, tasks: [] })),
      ])
        .then(([orgData, videosData, researchData, roadmapData]) => {
          setOrg(orgData.organization);
          setVideoCount(videosData.videos?.length || 0);
          setResearchCount(researchData.entries?.length || 0);
          if (roadmapData.roadmap) {
            setRoadmap(roadmapData.roadmap);
            setTasks(roadmapData.tasks || []);
            setCompletedTasks(roadmapData.tasks?.filter((t: Task) => t.status === 'completed').length || 0);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session?.user?.orgId]);

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

        {/* Legal Documents */}
        {org.onboarding?.mouUrl && (
          <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="!text-[#0f172a] flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#9333ea]" />
                Legal Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-[#64748b] mb-4">
                  Access your signed agreements and legal documents
                </p>
                {org.onboarding.mouUrl && (
                  <Link
                    href={org.onboarding.mouUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-[#f8f9fa] border border-[#e2e8f0] hover:bg-[#f1f3f5] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white border border-[#e2e8f0]">
                        <FileText className="w-5 h-5 text-[#9333ea]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0f172a]">Memorandum of Understanding</p>
                        <p className="text-xs text-[#64748b]">MOU Agreement</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#64748b] group-hover:text-[#e91e8c] transition-colors" />
                  </Link>
                )}
                {org.onboarding.sowUrl && (
                  <Link
                    href={org.onboarding.sowUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-[#f8f9fa] border border-[#e2e8f0] hover:bg-[#f1f3f5] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white border border-[#e2e8f0]">
                        <FileText className="w-5 h-5 text-[#e91e8c]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0f172a]">Statement of Work</p>
                        <p className="text-xs text-[#64748b]">SOW Agreement</p>
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
    </div>
  );
}
