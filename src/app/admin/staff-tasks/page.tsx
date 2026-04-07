'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Clock, AlertCircle, Calendar, User, Building2, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Task {
  _id: string;
  dayNumber: number;
  title: string;
  description?: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'waiting_on_client';
  taskDate?: string;
  organization?: {
    _id: string;
    name: string;
    logo?: string;
  };
  roadmap?: {
    startDate: string;
    totalDays: number;
  };
}

interface Staff {
  _id: string;
  email: string;
  name: string;
}

export default function StaffTasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dateFilter, setDateFilter] = useState('today');
  const [specificDate, setSpecificDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffFilter, setStaffFilter] = useState('all');

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchStaff();
    }
  }, [status, session]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchTasks();
    }
  }, [status, session, dateFilter, specificDate, staffFilter]);

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

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('withOrgDetails', 'true');
      
      // Date filter
      if (dateFilter === 'specific') {
        params.set('date', specificDate);
      } else {
        params.set('date', dateFilter);
      }
      
      // Staff filter
      if (staffFilter !== 'all') {
        params.set('assignedTo', staffFilter);
      }

      const res = await fetch(`/api/tasks?${params.toString()}`);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'waiting_on_client':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      in_progress: 'bg-amber-100 text-amber-700',
      waiting_on_client: 'bg-blue-100 text-blue-700',
      pending: 'bg-gray-100 text-gray-700',
    };
    const labels: Record<string, string> = {
      completed: 'Completed',
      in_progress: 'In Progress',
      waiting_on_client: 'Waiting on Client',
      pending: 'Pending',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || 'Pending'}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Group tasks by staff
  const groupedTasks = tasks.reduce((acc: Record<string, Task[]>, task) => {
    const key = task.assignedTo || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  const getStaffName = (email: string) => {
    if (email === 'Unassigned') return 'Unassigned';
    const staffMember = staff.find(s => s.email === email);
    return staffMember?.name || email;
  };

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#e91e8c]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Staff Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">View and filter tasks assigned to staff members</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-[#e91e8c]"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="all">All Days</option>
                  <option value="specific">Specific Date</option>
                </select>
                {dateFilter === 'specific' && (
                  <input
                    type="date"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-[#e91e8c]"
                  />
                )}
              </div>

              {/* Staff Filter */}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <select
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-[#e91e8c]"
                >
                  <option value="all">All Staff</option>
                  {staff.map((s) => (
                    <option key={s._id} value={s.email}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
              <p className="text-xs text-gray-500">Total Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{inProgressTasks}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">{pendingTasks}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#e91e8c]" />
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tasks found for the selected filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([staffEmail, staffTasks]) => (
              <Card key={staffEmail}>
                <CardContent className="p-0">
                  {/* Staff Header */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#e91e8c] text-white flex items-center justify-center text-sm font-medium">
                        {getStaffName(staffEmail).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{getStaffName(staffEmail)}</p>
                        {staffEmail !== 'Unassigned' && (
                          <p className="text-xs text-gray-500">{staffEmail}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {staffTasks.length} task{staffTasks.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {/* Tasks */}
                  <div className="divide-y divide-gray-100">
                    {staffTasks.map((task) => (
                      <div key={task._id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(task.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                {task.title}
                              </p>
                              {getStatusBadge(task.status)}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              {task.organization && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {task.organization.name}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Day {task.dayNumber}
                                {task.taskDate && ` • ${formatDate(task.taskDate)}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
