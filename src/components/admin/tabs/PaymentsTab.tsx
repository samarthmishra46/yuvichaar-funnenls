'use client';

import { useState } from 'react';
import { Loader2, DollarSign, CreditCard, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface PaymentRecord {
  amount: number;
  date: string;
  note?: string;
  razorpayPaymentId?: string;
}

interface Organization {
  _id: string;
  payment: {
    totalAmount: number;
    payments: PaymentRecord[];
  };
  dealPage?: {
    fixedFee?: number;
    hasPerformanceFee?: boolean;
    perfBonus1Amount?: string;
    perfBonus2Amount?: string;
  };
}

interface PaymentsTabProps {
  org: Organization;
  onUpdate: () => void;
}

export default function PaymentsTab({ org, onUpdate }: PaymentsTabProps) {
  const [savingTotal, setSavingTotal] = useState(false);
  const [loggingPayment, setLoggingPayment] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState(org.payment?.totalAmount || 0);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  // Calculate fee breakdown
  const fixedFee = org.dealPage?.fixedFee || 449000;
  const hasPerformanceFee = org.dealPage?.hasPerformanceFee !== false;
  const perfBonus1 = parseInt((org.dealPage?.perfBonus1Amount || '₹1,00,000').replace(/[₹,\s]/g, '')) || 0;
  const perfBonus2 = parseInt((org.dealPage?.perfBonus2Amount || '₹1,00,000').replace(/[₹,\s]/g, '')) || 0;
  const performanceFee = hasPerformanceFee ? (perfBonus1 + perfBonus2) : 0;
  const fixedFeeGst = Math.round(fixedFee * 0.18);
  const performanceFeeGst = Math.round(performanceFee * 0.18);
  const totalFixedWithGst = fixedFee + fixedFeeGst;
  const totalPerformanceWithGst = performanceFee + performanceFeeGst;
  const grandTotal = totalFixedWithGst + totalPerformanceWithGst;

  const totalPaid = (org.payment?.payments || []).reduce((sum, p) => sum + p.amount, 0);
  const amountDue = grandTotal - totalPaid;

  const handleSaveTotal = async () => {
    setSavingTotal(true);
    try {
      const res = await fetch(`/api/organizations/${org._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'payment.totalAmount': totalAmount }),
      });

      if (res.ok) {
        toast.success('Total amount updated');
        onUpdate();
      } else {
        toast.error('Failed to update');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSavingTotal(false);
    }
  };

  const handleLogPayment = async () => {
    const amount = parseFloat(paymentForm.amount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setLoggingPayment(true);
    try {
      const currentPayments = org.payment?.payments || [];
      const newPayment = {
        amount,
        date: paymentForm.date,
        note: paymentForm.note,
      };

      const res = await fetch(`/api/organizations/${org._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'payment.payments': [...currentPayments, newPayment],
        }),
      });

      if (res.ok) {
        toast.success('Payment logged');
        setPaymentForm({ amount: '', date: new Date().toISOString().split('T')[0], note: '' });
        onUpdate();
      } else {
        toast.error('Failed to log payment');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoggingPayment(false);
    }
  };

  const handleDeletePayment = async (indexToDelete: number) => {
    if (!confirm('Delete this payment record?')) return;

    setDeletingIndex(indexToDelete);
    try {
      const currentPayments = org.payment?.payments || [];
      const updatedPayments = currentPayments.filter((_, idx) => idx !== indexToDelete);

      const res = await fetch(`/api/organizations/${org._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'payment.payments': updatedPayments,
        }),
      });

      if (res.ok) {
        toast.success('Payment record deleted');
        onUpdate();
      } else {
        toast.error('Failed to delete payment');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setDeletingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Fee Breakdown */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
        <h4 className="font-semibold text-[#0f172a] mb-4">Fee Breakdown</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-[#f1f5f9]">
            <span className="text-sm text-[#64748b]">Fixed Fee</span>
            <span className="font-semibold text-[#0f172a]">₹{fixedFee.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#f1f5f9]">
            <span className="text-sm text-[#64748b]">GST on Fixed Fee (18%)</span>
            <span className="font-semibold text-[#0f172a]">₹{fixedFeeGst.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#f1f5f9] bg-[#f8fafc] -mx-5 px-5">
            <span className="text-sm font-medium text-[#0f172a]">Fixed Fee Total (incl. GST)</span>
            <span className="font-bold text-[#0f172a]">₹{totalFixedWithGst.toLocaleString('en-IN')}</span>
          </div>
          {hasPerformanceFee && (
            <>
              <div className="flex justify-between items-center py-2 border-b border-[#f1f5f9]">
                <span className="text-sm text-[#64748b]">Performance Fee <span className="text-xs text-[#94a3b8]">(on milestone triggers)</span></span>
                <span className="font-semibold text-[#e91e8c]">₹{performanceFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#f1f5f9]">
                <span className="text-sm text-[#64748b]">GST on Performance Fee (18%)</span>
                <span className="font-semibold text-[#e91e8c]">₹{performanceFeeGst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#f1f5f9] bg-[#fdf2f8] -mx-5 px-5">
                <span className="text-sm font-medium text-[#0f172a]">Performance Fee Total (incl. GST)</span>
                <span className="font-bold text-[#e91e8c]">₹{totalPerformanceWithGst.toLocaleString('en-IN')}</span>
              </div>
            </>
          )}
          <div className="flex justify-between items-center py-3 bg-[#0f172a] -mx-5 px-5 rounded-b-xl mt-2">
            <span className="text-sm font-semibold text-white">Grand Total (All Fees + GST)</span>
            <span className="text-xl font-bold text-white">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-[#64748b] uppercase font-semibold tracking-wider mb-1">Total Contract</p>
          <p className="text-2xl font-bold text-[#0f172a]">₹{grandTotal.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-[#64748b] uppercase font-semibold tracking-wider mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-[#22c55e]">₹{totalPaid.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-[#64748b] uppercase font-semibold tracking-wider mb-1">Amount Due</p>
          <p className={`text-2xl font-bold ${amountDue > 0 ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
            ₹{Math.max(0, amountDue).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Total Amount Setting */}
      <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-[#0f172a] mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#e91e8c]" />
            Contract Amount
          </h4>
          <div className="flex gap-3 items-end">
            <div className="flex-1 max-w-xs">
              <Input
                id="total-amount"
                type="number"
                placeholder="100000"
                value={totalAmount || ''}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="!bg-white !border-[#e2e8f0] !text-[#0f172a]"
              />
            </div>
            <Button onClick={handleSaveTotal} disabled={savingTotal}>
              {savingTotal ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
          <p className="text-xs text-[#64748b] mt-2">
            💡 This amount is automatically synced when you save pricing in the Deal Page tab (Fixed Fee + 18% GST).
          </p>
        </CardContent>
      </Card>

      {/* Log Payment */}
      <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-[#0f172a] mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#e91e8c]" />
            Log a Payment
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input id="pay-amount" label="Amount (₹)" type="number" placeholder="25000" value={paymentForm.amount} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))} className="!bg-white !border-[#e2e8f0] !text-[#0f172a]" />
            <Input id="pay-date" label="Date" type="date" value={paymentForm.date} onChange={(e) => setPaymentForm((p) => ({ ...p, date: e.target.value }))} className="!bg-white !border-[#e2e8f0] !text-[#0f172a]" />
            <Input id="pay-note" label="Note" placeholder="Optional note" value={paymentForm.note} onChange={(e) => setPaymentForm((p) => ({ ...p, note: e.target.value }))} className="!bg-white !border-[#e2e8f0] !text-[#0f172a]" />
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleLogPayment} disabled={loggingPayment}>
              {loggingPayment ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging…</> : 'Log Payment'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="!bg-white !border-[#e2e8f0] shadow-sm">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-[#0f172a] mb-4">Payment History</h4>
          {(org.payment?.payments || []).length === 0 ? (
            <p className="text-sm text-[#64748b] text-center py-8">No payments recorded yet</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#e2e8f0]">
              <table className="w-full text-sm">
                <thead className="bg-[#f8f9fa]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Note</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wider">Razorpay ID</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[#64748b] uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {[...(org.payment?.payments || [])].map((payment, idx) => {
                    // We map over the original order so that idx matches the actual array index for deletion
                    const originalIdx = idx;
                    return (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-[#94a3b8]">{new Date(payment.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-[#4ade80] font-semibold">₹{payment.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#94a3b8]">{payment.note || '—'}</td>
                        <td className="px-4 py-3 text-[#64748b] text-xs font-mono">{payment.razorpayPaymentId || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeletePayment(originalIdx)}
                            disabled={deletingIndex === originalIdx}
                            className="p-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.1)] text-[#64748b] hover:text-[#f87171] transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete payment"
                          >
                            {deletingIndex === originalIdx ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
