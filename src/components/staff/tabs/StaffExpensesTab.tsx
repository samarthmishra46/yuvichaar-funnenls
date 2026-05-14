'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Loader2, Plus, Trash2, Upload, CheckCircle2, Clock, XCircle, Paperclip, Edit2, X, Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  paymentStatus: 'cleared' | 'due';
  createdBy: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

interface StaffExpensesTabProps {
  orgId: string;
  staffEmail: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function StaffExpensesTab({ orgId, staffEmail }: StaffExpensesTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm = {
    category: 'shoot_production',
    subcategory: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    attachmentUrl: '',
    creatorBreakdown: [] as CreatorBreakdownItem[],
    paymentStatus: 'cleared' as 'cleared' | 'due',
  };
  const [form, setForm] = useState(emptyForm);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cleared' | 'due'>('all');

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses?orgId=${orgId}&status=all`);
      const data = await res.json();
      if (res.ok) setExpenses(data.expenses || []);
    } catch (err) {
      console.error('Fetch expenses error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

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

  const startEdit = (expense: Expense) => {
    setEditingId(expense._id);
    setForm({
      category: expense.category,
      subcategory: expense.subcategory || '',
      description: expense.description,
      amount: String(expense.amount),
      date: new Date(expense.date).toISOString().split('T')[0],
      notes: expense.notes || '',
      attachmentUrl: expense.attachmentUrl || '',
      creatorBreakdown: expense.creatorBreakdown || [],
      paymentStatus: expense.paymentStatus || 'cleared',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!form.description || (!form.amount && form.creatorBreakdown.length === 0)) {
      toast.error('Please fill description and amount');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        orgId,
        isCompanyExpense: false,
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
        paymentStatus: form.paymentStatus,
      };

      const url = editingId ? `/api/expenses/${editingId}` : '/api/expenses';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingId ? 'Expense updated — awaiting verification' : 'Expense submitted for verification');
        resetForm();
        fetchExpenses();
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
        fetchExpenses();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filteredExpenses = useMemo(() => {
    if (paymentFilter === 'all') return expenses;
    return expenses.filter((e) => (e.paymentStatus || 'cleared') === paymentFilter);
  }, [expenses, paymentFilter]);

  const myExpenses = filteredExpenses.filter((e) => e.createdBy === staffEmail);
  const otherExpenses = filteredExpenses.filter((e) => e.createdBy !== staffEmail);

  const totals = useMemo(() => {
    const approved = expenses.filter((e) => e.status === 'approved').reduce((s, e) => s + e.amount, 0);
    const pending = expenses.filter((e) => e.status === 'pending').reduce((s, e) => s + e.amount, 0);
    const due = expenses
      .filter((e) => e.status !== 'rejected' && (e.paymentStatus || 'cleared') === 'due')
      .reduce((s, e) => s + e.amount, 0);
    return { approved, pending, due };
  }, [expenses]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#0f172a]">Expenses</h2>
          <p className="text-sm text-[#64748b]">
            Submitted expenses go to admin for verification before showing in finances.
          </p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-sm text-[#64748b] mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.approved)}</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-sm text-[#64748b] mb-1">Pending verification</p>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(totals.pending)}</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-sm text-[#64748b] mb-1 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            Outstanding Dues
          </p>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(totals.due)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#64748b]">Payment:</span>
        {(['all', 'cleared', 'due'] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setPaymentFilter(opt)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors capitalize ${
              paymentFilter === opt
                ? 'bg-[#e91e8c] border-[#e91e8c] text-white'
                : 'bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#f8f9fa]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="!text-[#0f172a]">
              {editingId ? 'Edit Expense' : 'Add Expense'}
            </CardTitle>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8125rem] font-semibold text-[#475569]">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: '' })}
                  className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8125rem] font-semibold text-[#475569]">Subcategory</label>
                <select
                  value={form.subcategory}
                  onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                  className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c]"
                >
                  <option value="">Select subcategory</option>
                  {subcategoryOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8125rem] font-semibold text-[#475569]">Description *</label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g., Studio booking for shoot on March 12"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8125rem] font-semibold text-[#475569]">Payment Status</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentStatus: 'cleared' })}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                    form.paymentStatus === 'cleared'
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#f8f9fa]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Cleared (already paid)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentStatus: 'due' })}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                    form.paymentStatus === 'due'
                      ? 'bg-amber-50 border-amber-300 text-amber-700'
                      : 'bg-white border-[#e2e8f0] text-[#64748b] hover:bg-[#f8f9fa]'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  Due (need to pay)
                </button>
              </div>
              <p className="text-xs text-[#94a3b8]">
                Mark as "Due" if this is something owed but not yet paid.
              </p>
            </div>

            {form.subcategory === 'creator_talent' && (
              <div className="border border-[#e2e8f0] rounded-xl p-4 bg-[#f8f9fa]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-[#0f172a]">Creator Breakdown</p>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Split this expense across multiple creators. Each row stores name, fee, and notes (deliverables, commute, hours).
                    </p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={addCreator}>
                    <Plus className="w-3 h-3 mr-1" /> Add Creator
                  </Button>
                </div>
                {form.creatorBreakdown.length === 0 ? (
                  <div className="text-xs text-[#64748b] bg-white border border-dashed border-[#e2e8f0] rounded-lg p-4 text-center">
                    No creators added yet. Click <span className="font-semibold text-[#0f172a]">Add Creator</span> to start, or skip and use a single amount below.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {form.creatorBreakdown.map((c, i) => (
                      <div key={i} className="bg-white border border-[#e2e8f0] rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#e91e8c] text-white text-xs font-semibold">
                            {i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCreator(i)}
                            className="p-1.5 text-[#64748b] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove creator"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[0.75rem] font-semibold text-[#475569]">Creator Name *</label>
                            <Input
                              placeholder="e.g., Priya Sharma"
                              value={c.name}
                              onChange={(e) => updateCreator(i, 'name', e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[0.75rem] font-semibold text-[#475569]">Fee Paid (₹) *</label>
                            <Input
                              type="number"
                              placeholder="15000"
                              value={c.amount || ''}
                              onChange={(e) => updateCreator(i, 'amount', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[0.75rem] font-semibold text-[#475569]">Notes</label>
                          <textarea
                            rows={2}
                            placeholder="Deliverables, commute, hours, etc."
                            value={c.notes || ''}
                            onChange={(e) => updateCreator(i, 'notes', e.target.value)}
                            className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c] resize-none"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between bg-white border border-[#e2e8f0] rounded-xl px-4 py-3">
                      <div>
                        <p className="text-xs text-[#64748b] uppercase font-semibold tracking-wider">Breakdown Total</p>
                        <p className="text-xs text-[#94a3b8] mt-0.5">
                          {form.creatorBreakdown.length} creator{form.creatorBreakdown.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-[#0f172a]">
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
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8125rem] font-semibold text-[#475569]">Amount (₹) *</label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="5000"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8125rem] font-semibold text-[#475569]">Date</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8125rem] font-semibold text-[#475569]">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-[#0f172a] text-sm outline-none focus:border-[#e91e8c] resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8125rem] font-semibold text-[#475569]">
                Receipt / Invoice (optional)
              </label>
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f8f9fa] border border-[#e2e8f0] text-[#64748b] text-sm font-medium cursor-pointer hover:bg-[#f1f5f9] transition-colors">
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
                  className="text-xs text-blue-600 hover:underline"
                >
                  View attached file
                </a>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={resetForm} className="!text-[#64748b]">Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
                ) : (
                  editingId ? 'Save Changes' : 'Submit for Verification'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Expenses */}
      <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
        <CardHeader>
          <CardTitle className="!text-[#0f172a] text-base">My Submissions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#e91e8c]" />
            </div>
          ) : myExpenses.length === 0 ? (
            <div className="text-center py-10 text-[#64748b] text-sm">
              You haven&apos;t submitted any expenses yet
            </div>
          ) : (
            <div className="divide-y divide-[#e2e8f0]">
              {myExpenses.map((expense) => (
                <ExpenseRow
                  key={expense._id}
                  expense={expense}
                  canEdit={expense.status === 'pending'}
                  onEdit={() => startEdit(expense)}
                  onDelete={() => handleDelete(expense._id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expenses by others/admin (read-only) */}
      {otherExpenses.length > 0 && (
        <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
          <CardHeader>
            <CardTitle className="!text-[#0f172a] text-base">Other Expenses</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#e2e8f0]">
              {otherExpenses.map((expense) => (
                <ExpenseRow key={expense._id} expense={expense} canEdit={false} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  if (status === 'approved') {
    return (
      <Badge className="!bg-green-100 !text-green-700 border-green-200 text-xs">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Approved
      </Badge>
    );
  }
  if (status === 'rejected') {
    return (
      <Badge className="!bg-red-100 !text-red-700 border-red-200 text-xs">
        <XCircle className="w-3 h-3 mr-1" />
        Rejected
      </Badge>
    );
  }
  return (
    <Badge className="!bg-amber-100 !text-amber-700 border-amber-200 text-xs">
      <Clock className="w-3 h-3 mr-1" />
      Pending
    </Badge>
  );
}

function ExpenseRow({
  expense,
  canEdit,
  onEdit,
  onDelete,
}: {
  expense: Expense;
  canEdit: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="px-5 py-4 hover:bg-[#f8f9fa] transition-colors">
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
              <p className="font-medium text-[#0f172a]">{expense.description}</p>
              <StatusBadge status={expense.status} />
              {(expense.paymentStatus || 'cleared') === 'due' && (
                <Badge className="!bg-amber-100 !text-amber-700 border-amber-200 text-xs">
                  <Wallet className="w-3 h-3 mr-1" />
                  Due
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#64748b]">
              <Badge variant="outline" className="text-xs">
                {getCategoryLabel(expense.category)}
              </Badge>
              {expense.subcategory && (
                <Badge variant="outline" className="text-xs">
                  {getSubcategoryLabel(expense.category, expense.subcategory)}
                </Badge>
              )}
              <span>{formatDate(expense.date)}</span>
              <span>by {expense.createdBy}</span>
              {expense.attachmentUrl && (
                <a
                  href={expense.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Paperclip className="w-3 h-3" />
                  Receipt
                </a>
              )}
            </div>
            {expense.notes && (
              <p className="text-xs text-[#64748b] mt-1 italic">{expense.notes}</p>
            )}
            {expense.creatorBreakdown && expense.creatorBreakdown.length > 0 && (
              <div className="mt-2 bg-[#f8f9fa] rounded-lg p-3 border border-[#e2e8f0]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#0f172a] uppercase tracking-wider">
                    Creator Breakdown ({expense.creatorBreakdown.length})
                  </span>
                  <span className="text-xs font-semibold text-[#0f172a]">
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
                          <span className="font-semibold text-[#0f172a]">{c.name || '—'}</span>
                          <span className="text-[#475569]">{formatCurrency(c.amount)}</span>
                        </div>
                        {c.notes && (
                          <p className="text-[#64748b] mt-0.5 break-words">{c.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {expense.status === 'rejected' && expense.rejectionReason && (
              <p className="text-xs text-red-600 mt-1">
                <span className="font-medium">Rejection reason:</span> {expense.rejectionReason}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-base font-semibold text-red-600">
            -{formatCurrency(expense.amount)}
          </span>
          {canEdit && onEdit && (
            <button onClick={onEdit} className="p-1.5 text-[#64748b] hover:text-blue-500 hover:bg-blue-50 rounded">
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {canEdit && onDelete && (
            <button onClick={onDelete} className="p-1.5 text-[#64748b] hover:text-red-500 hover:bg-red-50 rounded">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
