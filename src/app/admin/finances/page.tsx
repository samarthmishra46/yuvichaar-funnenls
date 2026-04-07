'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, 
  Calendar, Building2, Plus, Trash2, Filter, X, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface Expense {
  _id: string;
  orgId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  createdBy: string;
  organization?: {
    _id: string;
    name: string;
  };
}

interface Organization {
  _id: string;
  name: string;
}

interface Summary {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  expensesByCategory: Record<string, number>;
  expensesByOrg: Record<string, number>;
  revenueByOrg: Record<string, number>;
}

const EXPENSE_CATEGORIES = [
  { value: 'marketing', label: 'Marketing', color: '#8b5cf6' },
  { value: 'tools', label: 'Tools', color: '#3b82f6' },
  { value: 'freelancer', label: 'Freelancer', color: '#f59e0b' },
  { value: 'ads', label: 'Ads', color: '#ef4444' },
  { value: 'software', label: 'Software', color: '#10b981' },
  { value: 'hosting', label: 'Hosting', color: '#06b6d4' },
  { value: 'design', label: 'Design', color: '#e91e8c' },
  { value: 'content', label: 'Content', color: '#84cc16' },
  { value: 'other', label: 'Other', color: '#64748b' },
];

const PERIOD_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: '1month', label: 'Last 1 Month' },
  { value: '2months', label: 'Last 2 Months' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: '1year', label: 'Last 1 Year' },
];

export default function FinancesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [periodFilter, setPeriodFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');

  // New expense form
  const [newExpense, setNewExpense] = useState({
    orgId: '',
    category: 'other',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

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
      fetchExpenses();
    }
  }, [status, session, periodFilter, orgFilter]);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/organizations');
      const data = await res.json();
      if (res.ok) {
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Fetch organizations error:', error);
    }
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('period', periodFilter);
      if (orgFilter !== 'all') {
        params.set('orgId', orgFilter);
      }

      const res = await fetch(`/api/expenses?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setExpenses(data.expenses || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error('Fetch expenses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.orgId || !newExpense.description || !newExpense.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount),
        }),
      });

      if (res.ok) {
        toast.success('Expense added!');
        setShowAddForm(false);
        setNewExpense({
          orgId: '',
          category: 'other',
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
        });
        fetchExpenses();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add expense');
      }
    } catch (error) {
      toast.error('Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Expense deleted');
        fetchExpenses();
      } else {
        toast.error('Failed to delete expense');
      }
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const getCategoryColor = (category: string) => {
    return EXPENSE_CATEGORIES.find(c => c.value === category)?.color || '#64748b';
  };

  const getCategoryLabel = (category: string) => {
    return EXPENSE_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Track revenue, expenses, and profit</p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              {/* Period Filter */}
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

              {/* Organization Filter */}
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

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-100">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Total Revenue</span>
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
                  <span className="text-sm font-medium text-gray-500">Total Expenses</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p>
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
                <p className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.profit)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        {summary && (summary.totalRevenue > 0 || summary.totalExpenses > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue vs Expenses Bar Chart */}
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
                      { name: 'Expenses', value: summary.totalExpenses, fill: '#ef4444' },
                      { name: 'Profit', value: Math.max(0, summary.profit), fill: '#8b5cf6' },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value) || 0), '']}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {[
                        { name: 'Revenue', fill: '#22c55e' },
                        { name: 'Expenses', fill: '#ef4444' },
                        { name: 'Profit', fill: '#8b5cf6' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expenses by Category Pie Chart */}
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
                        labelLine={{ stroke: '#64748b', strokeWidth: 1 }}
                      >
                        {Object.entries(summary.expensesByCategory).map(([category], index) => (
                          <Cell key={`cell-${index}`} fill={getCategoryColor(category)} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value) || 0), 'Amount']}
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {Object.entries(summary.expensesByCategory).map(([category, amount]) => (
                      <div key={category} className="flex items-center gap-1.5">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getCategoryColor(category) }}
                        />
                        <span className="text-xs text-gray-600">{getCategoryLabel(category)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Organization-wise Revenue & Expenses */}
        {summary && organizations.length > 0 && orgFilter === 'all' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Organization-wise Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={Math.max(300, organizations.length * 50)}>
                <BarChart
                  layout="vertical"
                  data={organizations.map(org => ({
                    name: org.name.length > 15 ? org.name.substring(0, 15) + '...' : org.name,
                    fullName: org.name,
                    revenue: summary.revenueByOrg[org._id] || 0,
                    expenses: summary.expensesByOrg[org._id] || 0,
                  })).filter(d => d.revenue > 0 || d.expenses > 0)}
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    width={90}
                  />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(Number(value) || 0), name === 'revenue' ? 'Revenue' : 'Expenses']}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Add Expense Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Add Expense</CardTitle>
                <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
                  <select
                    value={newExpense.orgId}
                    onChange={(e) => setNewExpense({ ...newExpense, orgId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#e91e8c]"
                  >
                    <option value="">Select organization</option>
                    {organizations.map((org) => (
                      <option key={org._id} value={org._id}>{org.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#e91e8c]"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <Input
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="e.g., Facebook Ads for March"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                    <Input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <Input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  <Button onClick={handleAddExpense} disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Add Expense
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Expenses List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expense History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#e91e8c]" />
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No expenses found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {expenses.map((expense) => (
                  <div key={expense._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: getCategoryColor(expense.category) }}
                        >
                          {getCategoryLabel(expense.category).charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(expense.category)}
                            </Badge>
                            {expense.organization && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {expense.organization.name}
                              </span>
                            )}
                            <span>{formatDate(expense.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-red-600">
                          -{formatCurrency(expense.amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
