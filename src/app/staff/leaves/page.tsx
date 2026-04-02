'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar, Plus, ArrowLeft, CheckCircle2, XCircle, Clock, Sun, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface Leave {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  createdAt: string;
}

interface CompRequest {
  _id: string;
  workDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  createdAt: string;
}

interface LeaveBalance {
  total: number;
  used: number;
  available: number;
}

interface LeaveTypeInfo {
  code: string;
  name: string;
  days: number;
  description: string;
  carryForward?: boolean;
  oneTime?: boolean;
  earned?: boolean;
}

const statusBadgeVariant: Record<string, 'default' | 'success' | 'error'> = {
  pending: 'default',
  approved: 'success',
  rejected: 'error',
};

const leaveTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  casual: { bg: 'bg-[#fef3c7]', text: 'text-[#d97706]', border: 'border-[#fde68a]' },
  paid: { bg: 'bg-[#dbeafe]', text: 'text-[#2563eb]', border: 'border-[#bfdbfe]' },
  optional_holiday: { bg: 'bg-[#f3e8ff]', text: 'text-[#9333ea]', border: 'border-[#e9d5ff]' },
  menstrual: { bg: 'bg-[#fce7f3]', text: 'text-[#db2777]', border: 'border-[#fbcfe8]' },
  marriage: { bg: 'bg-[#dcfce7]', text: 'text-[#16a34a]', border: 'border-[#bbf7d0]' },
  rehabilitation: { bg: 'bg-[#e0e7ff]', text: 'text-[#4f46e5]', border: 'border-[#c7d2fe]' },
  public_holiday: { bg: 'bg-[#fee2e2]', text: 'text-[#dc2626]', border: 'border-[#fecaca]' },
  compensatory: { bg: 'bg-[#ccfbf1]', text: 'text-[#0d9488]', border: 'border-[#99f6e4]' },
};

export default function StaffLeavesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [compRequests, setCompRequests] = useState<CompRequest[]>([]);
  const [balance, setBalance] = useState<Record<string, LeaveBalance> | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<Record<string, LeaveTypeInfo>>({});
  const [fiscalYear, setFiscalYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCompForm, setShowCompForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'entitlements' | 'history' | 'comp'>('entitlements');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [compForm, setCompForm] = useState({
    workDate: '',
    reason: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'staff') {
      router.push('/staff/login');
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [leavesRes, compRes] = await Promise.all([
        fetch('/api/leaves?includeBalance=true'),
        fetch('/api/leaves/comp-request'),
      ]);
      
      const leavesData = await leavesRes.json();
      const compData = await compRes.json();
      
      if (leavesRes.ok) {
        setLeaves(leavesData.leaves || []);
        setBalance(leavesData.balance || null);
        setLeaveTypes(leavesData.leaveTypes || {});
        setFiscalYear(leavesData.fiscalYear || '');
      }
      
      if (compRes.ok) {
        setCompRequests(compData.compRequests || []);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.leaveType || !form.startDate || !form.endDate || !form.reason.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit leave request');
        return;
      }

      toast.success('Leave request submitted successfully');
      setShowForm(false);
      setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
      fetchData();
    } catch (error) {
      console.error('Submit leave error:', error);
      toast.error('Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompSubmit = async () => {
    if (!compForm.workDate || !compForm.reason.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    const date = new Date(compForm.workDate);
    if (date.getDay() !== 0) {
      toast.error('Compensatory leave can only be requested for Sundays');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/leaves/comp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compForm),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit request');
        return;
      }

      toast.success('Compensatory leave request submitted');
      setShowCompForm(false);
      setCompForm({ workDate: '', reason: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getLeaveTypeName = (type: string) => {
    return leaveTypes[type]?.name || type;
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

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/staff"
              className="p-2 rounded-xl bg-white border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8f9fa] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#0f172a]">My Leaves</h1>
              <p className="text-sm text-[#64748b] mt-1">Apply and track your leave requests</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Apply Leave
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl border border-[#e2e8f0] w-fit">
          <button
            onClick={() => setActiveTab('entitlements')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'entitlements'
                ? 'bg-[#e91e8c] text-white'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Leave Entitlements
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-[#e91e8c] text-white'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Leave History
          </button>
          <button
            onClick={() => setActiveTab('comp')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'comp'
                ? 'bg-[#e91e8c] text-white'
                : 'text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Comp Leave
          </button>
        </div>

        {/* Leave Entitlements Tab */}
        {activeTab === 'entitlements' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#0f172a]">Leave Entitlements FY {fiscalYear}</h2>
            </div>
            
            {balance ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(leaveTypes).map(([key, info]) => {
                  const bal = balance[key] || { total: info.days, used: 0, available: info.days };
                  const colors = leaveTypeColors[key] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
                  
                  return (
                    <Card key={key} className={`!border ${colors.border} shadow-sm`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold ${colors.text} px-2 py-0.5 ${colors.bg} rounded`}>
                            {info.code}
                          </span>
                          <span className="text-xs text-[#64748b]">{info.name}</span>
                        </div>
                        <p className={`text-3xl font-bold ${colors.text} mb-1`}>
                          {info.earned ? 'As Earned' : `${bal.available} days`}
                        </p>
                        <p className="text-xs text-[#64748b] mb-2">{info.name}</p>
                        <p className="text-xs text-[#94a3b8] leading-relaxed">{info.description}</p>
                        
                        {!info.earned && (
                          <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#64748b]">Used: {bal.used}</span>
                              <span className="text-[#64748b]">Total: {bal.total}</span>
                            </div>
                          </div>
                        )}
                        
                        {info.earned && bal.total > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
                            <p className={`text-sm font-semibold ${colors.text}`}>
                              {bal.available} day{bal.available !== 1 ? 's' : ''} available
                            </p>
                          </div>
                        )}
                        
                        <div className={`mt-2 px-2 py-1 ${colors.bg} rounded text-xs font-medium ${colors.text}`}>
                          {info.carryForward ? 'CARRY FWD ALLOWED' : info.oneTime ? 'ONE-TIME ONLY' : 'NO CARRY FWD'}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-xl border border-[#e2e8f0]">
                <Loader2 className="w-6 h-6 animate-spin text-[#e91e8c] mx-auto" />
              </div>
            )}
          </div>
        )}

        {/* Leave History Tab */}
        {activeTab === 'history' && (
          <div>
            {/* Apply Leave Form */}
            {showForm && (
              <Card className="!bg-white !border-[#e2e8f0] shadow-sm mb-6">
                <CardHeader>
                  <CardTitle className="!text-[#0f172a]">Apply for Leave</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.8125rem] font-semibold text-[#475569]">Leave Type</label>
                    <select
                      value={form.leaveType}
                      onChange={(e) => setForm((p) => ({ ...p, leaveType: e.target.value }))}
                      className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
                    >
                      {Object.entries(leaveTypes).filter(([k]) => k !== 'public_holiday').map(([key, info]) => (
                        <option key={key} value={key}>{info.name}</option>
                      ))}
                    </select>
                  </div>

                  {balance && form.leaveType && (
                    <div className="p-3 bg-[#f8f9fa] rounded-xl text-sm">
                      <span className="text-[#64748b]">Available balance: </span>
                      <span className="font-semibold text-[#0f172a]">
                        {(balance[form.leaveType] as LeaveBalance)?.available || 0} days
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.8125rem] font-semibold text-[#475569]">Start Date</label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                        className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.8125rem] font-semibold text-[#475569]">End Date</label>
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                        className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.8125rem] font-semibold text-[#475569]">Reason</label>
                    <textarea
                      value={form.reason}
                      onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                      placeholder="Please provide a reason for your leave..."
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
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leave History */}
            {leaves.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8f0]">
                <Calendar className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
                <p className="text-[#0f172a] font-semibold">No leave requests yet</p>
                <p className="text-sm text-[#64748b] mt-1">Click "Apply Leave" to submit your first request</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaves.map((leave) => {
                  const colors = leaveTypeColors[leave.leaveType] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
                  return (
                    <Card key={leave._id} className="!bg-white !border-[#e2e8f0] shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold ${colors.text} px-2 py-0.5 ${colors.bg} rounded`}>
                                {leaveTypes[leave.leaveType]?.code || leave.leaveType}
                              </span>
                              <span className="font-semibold text-[#0f172a]">
                                {getLeaveTypeName(leave.leaveType)}
                              </span>
                              <Badge variant={statusBadgeVariant[leave.status]}>
                                {leave.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-[#64748b]">
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                              <span className="ml-2 text-[#e91e8c] font-medium">
                                ({leave.days || getDays(leave.startDate, leave.endDate)} day{(leave.days || getDays(leave.startDate, leave.endDate)) !== 1 ? 's' : ''})
                              </span>
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-[#475569] mb-3">{leave.reason}</p>

                        {leave.adminResponse && (
                          <div className={`mt-3 pt-3 border-t border-[#e2e8f0] ${leave.status === 'approved' ? 'bg-[#dcfce7]' : 'bg-[#fee2e2]'} -mx-5 -mb-5 px-5 py-3 rounded-b-xl`}>
                            <p className="text-xs font-semibold text-[#475569] mb-1">Admin Response:</p>
                            <p className="text-sm text-[#0f172a]">{leave.adminResponse}</p>
                          </div>
                        )}

                        <p className="text-xs text-[#94a3b8] mt-3">
                          Applied on {new Date(leave.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Compensatory Leave Tab */}
        {activeTab === 'comp' && (
          <div>
            <Card className="!bg-gradient-to-r from-[#ccfbf1] to-[#d1fae5] !border-[#99f6e4] shadow-sm mb-6">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl">
                    <Sun className="w-6 h-6 text-[#0d9488]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0f172a] mb-1">Compensatory Leave</h3>
                    <p className="text-sm text-[#475569] mb-3">
                      Worked on a Sunday or attended a shoot? Request a compensatory leave day that you can use anytime.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="bg-white px-4 py-2 rounded-xl">
                        <span className="text-sm text-[#64748b]">Available: </span>
                        <span className="text-lg font-bold text-[#0d9488]">
                          {balance?.compensatory?.available || 0} days
                        </span>
                      </div>
                      <Button onClick={() => setShowCompForm(!showCompForm)} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Request Comp Leave
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comp Request Form */}
            {showCompForm && (
              <Card className="!bg-white !border-[#e2e8f0] shadow-sm mb-6">
                <CardHeader>
                  <CardTitle className="!text-[#0f172a]">Request Compensatory Leave</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.8125rem] font-semibold text-[#475569]">Date Worked (Sunday only)</label>
                    <input
                      type="date"
                      value={compForm.workDate}
                      onChange={(e) => setCompForm((p) => ({ ...p, workDate: e.target.value }))}
                      className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.8125rem] font-semibold text-[#475569]">Reason / Work Description</label>
                    <textarea
                      value={compForm.reason}
                      onChange={(e) => setCompForm((p) => ({ ...p, reason: e.target.value }))}
                      placeholder="Describe the work you did on Sunday..."
                      rows={3}
                      className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c] resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="ghost" onClick={() => setShowCompForm(false)} className="!text-[#64748b]">
                      Cancel
                    </Button>
                    <Button onClick={handleCompSubmit} disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comp Request History */}
            {compRequests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8f0]">
                <Briefcase className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
                <p className="text-[#0f172a] font-semibold">No compensatory leave requests</p>
                <p className="text-sm text-[#64748b] mt-1">Request comp leave when you work on Sundays</p>
              </div>
            ) : (
              <div className="space-y-4">
                {compRequests.map((req) => (
                  <Card key={req._id} className="!bg-white !border-[#e2e8f0] shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[#0d9488] px-2 py-0.5 bg-[#ccfbf1] rounded">
                              COMP
                            </span>
                            <span className="font-semibold text-[#0f172a]">
                              Sunday Work - {new Date(req.workDate).toLocaleDateString()}
                            </span>
                            <Badge variant={statusBadgeVariant[req.status]}>
                              {req.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-[#475569] mb-3">{req.reason}</p>

                      {req.adminResponse && (
                        <div className={`mt-3 pt-3 border-t border-[#e2e8f0] ${req.status === 'approved' ? 'bg-[#dcfce7]' : 'bg-[#fee2e2]'} -mx-5 -mb-5 px-5 py-3 rounded-b-xl`}>
                          <p className="text-xs font-semibold text-[#475569] mb-1">Admin Response:</p>
                          <p className="text-sm text-[#0f172a]">{req.adminResponse}</p>
                        </div>
                      )}

                      <p className="text-xs text-[#94a3b8] mt-3">
                        Requested on {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
