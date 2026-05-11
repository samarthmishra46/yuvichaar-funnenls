'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Loader2, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon,
  Calendar, Building2, Plus, Trash2, Filter, X, BarChart3, CheckCircle2,
  XCircle, Clock, Paperclip, Upload, AlertCircle, FileText, Edit2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  EXPENSE_CATEGORIES,
  getCategoryLabel,
  getCategoryColor,
  getSubcategoryLabel,
  getSubcategoriesFor,
} from '@/lib/expense-categories';

interface CreatorBreakdownItem {
  name: string;
  amount: number;
  notes?: string;
}

interface Expense {
  _id: string;
  orgId?: string | null;
  isCompanyExpense: boolean;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  date: string;
  notes?: string;
  attachmentUrl?: string;
  creatorBreakdown?: CreatorBreakdownItem[];
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdBy: string;
  createdByRole?: 'admin' | 'staff';
  verifiedBy?: string;
  verifiedAt?: string;
  organization?: { _id: string; name: string } | null;
}

interface Organization {
  _id: string;
  name: string;
}

interface Summary {
  totalRevenue: number;
  totalExpenses: number;
  totalCompanyExpenses: number;
  profit: number;
  pendingCount: number;
  expensesByCategory: Record<string, number>;
  expensesBySubcategory: Record<string, number>;
  expensesByOrg: Record<string, number>;
  revenueByOrg: Record<string, number>;
}

const PERIOD_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: '1month', label: 'Last 1 Month' },
  { value: '2months', label: 'Last 2 Months' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: '1year', label: 'Last 1 Year' },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function FinancesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'company'>('overview');

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([]);
  const [companyExpenses, setCompanyExpenses] = useState<Expense[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [periodFilter, setPeriodFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const emptyForm = {
    orgId: '',
    isCompanyExpense: false,
    category: 'shoot_production',
    subcategory: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    attachmentUrl: '',
    creatorBreakdown: [] as CreatorBreakdownItem[],
  };
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

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
      fetchOrganizations();
    }
  }, [status, session]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, periodFilter, orgFilter]);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/organizations');
      const data = await res.json();
      if (res.ok) setOrganizations(data.organizations || []);
    } catch (error) {
      console.error('Fetch organizations error:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('period', periodFilter);
      params.set('status', 'approved');
      params.set('scope', 'client');
      if (orgFilter !== 'all') params.set('orgId', orgFilter);

      const [overviewRes, pendingRes, companyRes] = await Promise.all([
        fetch(`/api/expenses?${params.toString()}`),
        fetch(`/api/expenses?status=pending`),
        fetch(`/api/expenses?scope=company&status=approved`),
      ]);

      const overviewData = await overviewRes.json();
      const pendingData = await pendingRes.json();
      const companyData = await companyRes.json();

      if (overviewRes.ok) {
        setExpenses(overviewData.expenses || []);
        setSummary(overviewData.summary || null);
      }
      if (pendingRes.ok) setPendingExpenses(pendingData.expenses || []);
      if (companyRes.ok) setCompanyExpenses(companyData.expenses || []);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
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
        setForm((p) => ({ ...p, attachmentUrl: data.url }));
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

  const openAddForm = (preset?: Partial<typeof emptyForm>) => {
    setEditingExpense(null);
    setForm({ ...emptyForm, ...(preset || {}) });
    setShowAddForm(true);
  };

  const openEditForm = (expense: Expense) => {
    setEditingExpense(expense);
    setForm({
      orgId: expense.orgId || '',
      isCompanyExpense: expense.isCompanyExpense,
      category: expense.category,
      subcategory: expense.subcategory || '',
      description: expense.description,
      amount: String(expense.amount),
      date: new Date(expense.date).toISOString().split('T')[0],
      notes: expense.notes || '',
      attachmentUrl: expense.attachmentUrl || '',
      creatorBreakdown: expense.creatorBreakdown || [],
    });
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    if (!form.description || (!form.amount && (form.creatorBreakdown.length === 0))) {
      toast.error('Please fill description and amount');
      return;
    }
    if (!form.isCompanyExpense && !form.orgId) {
      toast.error('Please select an organization or mark as company expense');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        orgId: form.isCompanyExpense ? null : form.orgId,
        isCompanyExpense: form.isCompanyExpense,
        category: form.category,
        subcategory: form.subcategory || undefined,
        description: form.description,
        amount: parseFloat(form.amount || '0'),
        date: form.date,
        notes: form.notes || undefined,
        attachmentUrl: form.attachmentUrl || undefined,
        creatorBreakdown:
          form.subcategory === 'creator_talent' && form.creatorBreakdown.length > 0
            ? form.creatorBreakdown
            : undefined,
      };

      const url = editingExpense ? `/api/expenses/${editingExpense._id}` : '/api/expenses';
      const method = editingExpense ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingExpense ? 'Expense updated' : 'Expense added');
        setShowAddForm(false);
        setEditingExpense(null);
        setForm(emptyForm);
        fetchAllData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save expense');
      }
    } catch {
      toast.error('Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Expense deleted');
        fetchAllData();
      } else {
        toast.error('Failed to delete expense');
      }
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (res.ok) {
        toast.success('Expense approved');
        fetchAllData();
      } else {
        toast.error('Failed to approve');
      }
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      const res = await fetch(`/api/expenses/${rejectingId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejectionReason }),
      });
      if (res.ok) {
        toast.success('Expense rejected');
        setRejectingId(null);
        setRejectionReason('');
        fetchAllData();
      } else {
        toast.error('Failed to reject');
      }
    } catch {
      toast.error('Failed to reject');
    }
  };

  const subcategoryOptions = useMemo(() => getSubcategoriesFor(form.category), [form.category]);

  const updateCreator = (idx: number, field: keyof CreatorBreakdownItem, value: string) => {
    setForm((p) => {
      const list = [...p.creatorBreakdown];
      list[idx] = {
        ...list[idx],
        [field]: field === 'amount' ? parseFloat(value || '0') : value,
      } as CreatorBreakdownItem;
      return { ...p, creatorBreakdown: list };
    });
  };
  const addCreator = () => {
    setForm((p) => ({
      ...p,
      creatorBreakdown: [...p.creatorBreakdown, { name: '', amount: 0 }],
    }));
  };
  const removeCreator = (idx: number) => {
    setForm((p) => ({
      ...p,
      creatorBreakdown: p.creatorBreakdown.filter((_, i) => i !== idx),
    }));
  };

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Revenue, expenses, and verification queue</p>
          </div>
          <Button onClick={() => openAddForm()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {summary && summary.pendingCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#e91e8c] text-white rounded-full">
                  {summary.pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="company">Company Expenses</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <select
                      value={periodFilter}
                      onChange={(e) => setPeriodFilter(e.target.value)}
                      className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-[#e91e8c]"
                    >
                      {PERIOD_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <select
                      value={orgFilter}
                      onChange={(e) => setOrgFilter(e.target.value)}
                      className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-[#e91e8c]"
                    >
                      <option value="all">All Organizations</option>
                      {organizations.map((org) => (
                        <option key={org._id} value={org._id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-green-100">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-500">Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalRevenue)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-red-100">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-500">Client Expenses</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-orange-100">
                        <Building2 className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-500">Company Expenses</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalCompanyExpenses)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-500">Net Profit</span>
                    </div>
                    <p className={`text-2xl font-bold ${(summary.profit - summary.totalCompanyExpenses) >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                      {formatCurrency(summary.profit - summary.totalCompanyExpenses)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {summary && (summary.totalRevenue > 0 || summary.totalExpenses > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Revenue vs Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          { name: 'Revenue', value: summary.totalRevenue, fill: '#22c55e' },
                          { name: 'Client Exp.', value: summary.totalExpenses, fill: '#ef4444' },
                          { name: 'Company Exp.', value: summary.totalCompanyExpenses, fill: '#f97316' },
                          { name: 'Profit', value: Math.max(0, summary.profit - summary.totalCompanyExpenses), fill: '#8b5cf6' },
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v) => [formatCurrency(Number(v) || 0), '']} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {Object.keys(summary.expensesByCategory).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5" />
                        Expenses by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={Object.entries(summary.expensesByCategory).map(([category, amount]) => ({
                              name: getCategoryLabel(category),
                              value: amount,
                              color: getCategoryColor(category),
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          >
                            {Object.entries(summary.expensesByCategory).map(([category], i) => (
                              <Cell key={i} fill={getCategoryColor(category)} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => [formatCurrency(Number(v) || 0), 'Amount']} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap justify-center gap-3 mt-4">
                        {Object.entries(summary.expensesByCategory).map(([category]) => (
                          <div key={category} className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(category) }} />
                            <span className="text-xs text-gray-600">{getCategoryLabel(category)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expense History (Approved)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#e91e8c]" />
                  </div>
                ) : expenses.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No approved expenses yet</p>
                  </div>
                ) : (
                  <ExpenseList
                    expenses={expenses}
                    onEdit={openEditForm}
                    onDelete={handleDelete}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PENDING TAB */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Pending Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#e91e8c]" />
                  </div>
                ) : pendingExpenses.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-4" />
                    <p className="text-gray-500">All caught up — no pending expenses</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {pendingExpenses.map((expense) => (
                      <PendingExpenseRow
                        key={expense._id}
                        expense={expense}
                        onApprove={() => handleApprove(expense._id)}
                        onReject={() => {
                          setRejectingId(expense._id);
                          setRejectionReason('');
                        }}
                        onEdit={() => openEditForm(expense)}
                        onDelete={() => handleDelete(expense._id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMPANY TAB */}
          <TabsContent value="company">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Expenses not tied to any specific brand (Yuvichaar SaaS, hosting, internal tools, etc.)
              </p>
              <Button
                size="sm"
                onClick={() => openAddForm({ isCompanyExpense: true, category: 'software_saas', subcategory: 'yuvichaar_tools' })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Company Expense
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#e91e8c]" />
                  </div>
                ) : companyExpenses.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No company expenses yet</p>
                  </div>
                ) : (
                  <ExpenseList
                    expenses={companyExpenses}
                    onEdit={openEditForm}
                    onDelete={handleDelete}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b">
                <CardTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</CardTitle>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingExpense(null);
                    setForm(emptyForm);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Scope toggle */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isCompany"
                    checked={form.isCompanyExpense}
                    onChange={(e) => setForm({ ...form, isCompanyExpense: e.target.checked, orgId: '' })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isCompany" className="text-sm font-medium text-gray-700">
                    Company-wide expense (not tied to a specific brand)
                  </label>
                </div>

                {!form.isCompanyExpense && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
                    <select
                      value={form.orgId}
                      onChange={(e) => setForm({ ...form, orgId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#e91e8c]"
                    >
                      <option value="">Select organization</option>
                      {organizations.map((org) => (
                        <option key={org._id} value={org._id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: '' })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#e91e8c]"
                    >
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                    <select
                      value={form.subcategory}
                      onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#e91e8c]"
                    >
                      <option value="">Select subcategory</option>
                      {subcategoryOptions.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g., Studio booking for March 12 shoot"
                  />
                </div>

                {/* Creator breakdown */}
                {form.subcategory === 'creator_talent' && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Creator Breakdown</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Split this expense across multiple creators. Each row stores name, fee, and notes (deliverables, commute, hours).
                        </p>
                      </div>
                      <Button type="button" size="sm" variant="outline" onClick={addCreator}>
                        <Plus className="w-3 h-3 mr-1" /> Add Creator
                      </Button>
                    </div>
                    {form.creatorBreakdown.length === 0 ? (
                      <div className="text-xs text-gray-500 bg-white border border-dashed border-gray-200 rounded-lg p-4 text-center">
                        No creators added yet. Click <span className="font-semibold text-gray-900">Add Creator</span> to start, or skip and use a single amount below.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {form.creatorBreakdown.map((c, i) => (
                          <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#e91e8c] text-white text-xs font-semibold">
                                {i + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeCreator(i)}
                                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove creator"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[0.75rem] font-semibold text-gray-700">Creator Name *</label>
                                <Input
                                  placeholder="e.g., Priya Sharma"
                                  value={c.name}
                                  onChange={(e) => updateCreator(i, 'name', e.target.value)}
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[0.75rem] font-semibold text-gray-700">Fee Paid (₹) *</label>
                                <Input
                                  type="number"
                                  placeholder="15000"
                                  value={c.amount || ''}
                                  onChange={(e) => updateCreator(i, 'amount', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[0.75rem] font-semibold text-gray-700">Notes</label>
                              <textarea
                                rows={2}
                                placeholder="Deliverables, commute, hours, etc."
                                value={c.notes || ''}
                                onChange={(e) => updateCreator(i, 'notes', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#e91e8c] resize-none"
                              />
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Breakdown Total</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {form.creatorBreakdown.length} creator{form.creatorBreakdown.length === 1 ? '' : 's'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(form.creatorBreakdown.reduce((s, c) => s + (Number(c.amount) || 0), 0))}
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setForm((p) => ({
                                ...p,
                                amount: String(p.creatorBreakdown.reduce((s, c) => s + (Number(c.amount) || 0), 0)),
                              }))}
                            >
                              Copy to Amount
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                    <Input
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#e91e8c] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receipt / Invoice (optional)
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : form.attachmentUrl ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {form.attachmentUrl ? 'File uploaded — click to replace' : uploading ? 'Uploading...' : 'Upload receipt'}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  {form.attachmentUrl && (
                    <a
                      href={form.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      View attached file
                    </a>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {editingExpense ? 'Save Changes' : 'Add Expense'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reject reason modal */}
        {rejectingId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Reject Expense</CardTitle>
                <button onClick={() => setRejectingId(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason (optional)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="Why is this expense being rejected?"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#e91e8c] resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button>
                  <Button onClick={handleReject} className="!bg-red-600 hover:!bg-red-700">
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function ExpenseList({
  expenses,
  onEdit,
  onDelete,
}: {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="divide-y divide-gray-100">
      {expenses.map((expense) => (
        <div key={expense._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: getCategoryColor(expense.category) }}
              >
                {getCategoryLabel(expense.category).charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">{expense.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                  <Badge variant="outline" className="text-xs">
                    {getCategoryLabel(expense.category)}
                  </Badge>
                  {expense.subcategory && (
                    <Badge variant="outline" className="text-xs !text-gray-600">
                      {getSubcategoryLabel(expense.category, expense.subcategory)}
                    </Badge>
                  )}
                  {expense.isCompanyExpense ? (
                    <span className="flex items-center gap-1 text-orange-600">
                      <Building2 className="w-3 h-3" />
                      Company
                    </span>
                  ) : expense.organization ? (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {expense.organization.name}
                    </span>
                  ) : null}
                  <span>{formatDate(expense.date)}</span>
                  {expense.attachmentUrl && (
                    <a href={expense.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                      <Paperclip className="w-3 h-3" />
                      Receipt
                    </a>
                  )}
                  {expense.createdByRole === 'staff' && (
                    <Badge variant="outline" className="text-xs">by staff: {expense.createdBy}</Badge>
                  )}
                </div>
                {expense.notes && (
                  <p className="text-xs text-gray-500 mt-1 italic">{expense.notes}</p>
                )}
                {expense.creatorBreakdown && expense.creatorBreakdown.length > 0 && (
                  <div className="mt-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Creator Breakdown ({expense.creatorBreakdown.length})
                      </span>
                      <span className="text-xs font-semibold text-gray-900">
                        Total: {formatCurrency(expense.creatorBreakdown.reduce((s, c) => s + (Number(c.amount) || 0), 0))}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {expense.creatorBreakdown.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="inline-flex items-center justify-center w-5 h-5 shrink-0 rounded-full bg-[#e91e8c]/10 text-[#e91e8c] font-semibold">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="font-semibold text-gray-900">{c.name || '—'}</span>
                              <span className="text-gray-600">{formatCurrency(c.amount)}</span>
                            </div>
                            {c.notes && (
                              <p className="text-gray-500 mt-0.5 break-words">{c.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-lg font-semibold text-red-600">
                -{formatCurrency(expense.amount)}
              </span>
              <button
                onClick={() => onEdit(expense)}
                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(expense._id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingExpenseRow({
  expense,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}: {
  expense: Expense;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="px-6 py-4 hover:bg-amber-50/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: getCategoryColor(expense.category) }}
          >
            {getCategoryLabel(expense.category).charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-gray-900">{expense.description}</p>
              <Badge className="!bg-amber-100 !text-amber-700 border-amber-200 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
              <Badge variant="outline" className="text-xs">
                {getCategoryLabel(expense.category)}
              </Badge>
              {expense.subcategory && (
                <Badge variant="outline" className="text-xs !text-gray-600">
                  {getSubcategoryLabel(expense.category, expense.subcategory)}
                </Badge>
              )}
              {expense.organization && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {expense.organization.name}
                </span>
              )}
              <span>{formatDate(expense.date)}</span>
              <span>by {expense.createdBy}</span>
              {expense.attachmentUrl && (
                <a href={expense.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Paperclip className="w-3 h-3" />
                  Receipt
                </a>
              )}
            </div>
            {expense.notes && <p className="text-xs text-gray-500 mt-1 italic">{expense.notes}</p>}
            {expense.creatorBreakdown && expense.creatorBreakdown.length > 0 && (
              <div className="mt-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Creator Breakdown ({expense.creatorBreakdown.length})
                  </span>
                  <span className="text-xs font-semibold text-gray-900">
                    Total: {formatCurrency(expense.creatorBreakdown.reduce((s, c) => s + (Number(c.amount) || 0), 0))}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {expense.creatorBreakdown.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="inline-flex items-center justify-center w-5 h-5 shrink-0 rounded-full bg-[#e91e8c]/10 text-[#e91e8c] font-semibold">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="font-semibold text-gray-900">{c.name || '—'}</span>
                          <span className="text-gray-600">{formatCurrency(c.amount)}</span>
                        </div>
                        {c.notes && (
                          <p className="text-gray-500 mt-0.5 break-words">{c.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-lg font-semibold text-gray-900">
            {formatCurrency(expense.amount)}
          </span>
          <div className="flex items-center gap-1">
            <Button size="sm" onClick={onApprove} className="!bg-green-600 hover:!bg-green-700 h-8">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Approve
            </Button>
            <Button size="sm" variant="outline" onClick={onReject} className="!border-red-200 !text-red-600 hover:!bg-red-50 h-8">
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Reject
            </Button>
            <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
