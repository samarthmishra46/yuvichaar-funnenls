'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Organization {
  _id: string;
  name: string;
  email: string;
  payment: {
    totalAmount: number;
    payments: Array<{
      amount: number;
      date: string;
      note?: string;
      razorpayPaymentId?: string;
    }>;
  };
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export default function ClientPaymentsPage() {
  const { data: session } = useSession();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchOrg = useCallback(() => {
    if (session?.user?.orgId) {
      fetch(`/api/organizations/${session.user.orgId}`)
        .then((r) => r.json())
        .then((data) => setOrg(data.organization))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session?.user?.orgId]);

  useEffect(() => {
    fetchOrg();

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [fetchOrg]);

  const totalPaid = (org?.payment?.payments || []).reduce((sum, p) => sum + p.amount, 0);
  const amountDue = (org?.payment?.totalAmount || 0) - totalPaid;

  const handlePayNow = async () => {
    if (!org || amountDue <= 0) return;

    setPaying(true);

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountDue }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create order');
        setPaying(false);
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Yuvichaar Funnels',
        description: `Payment for ${org.name}`,
        order_id: data.orderId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: data.amount,
              }),
            });

            if (verifyRes.ok) {
              toast.success('Payment successful!');
              fetchOrg();
            } else {
              toast.error('Payment verification failed');
            }
          } catch {
            toast.error('Something went wrong');
          }
        },
        prefill: {
          name: session?.user?.name || '',
          email: org.email,
        },
        theme: {
          color: '#e91e8c',
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error('Failed to initiate payment');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!org) return <p className="text-gray-500 text-center py-16">Unable to load</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">₹{(org.payment?.totalAmount || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Amount Paid</p>
          <p className="text-2xl font-bold text-green-500">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Amount Due</p>
          <p className={`text-2xl font-bold ${amountDue > 0 ? 'text-red-500' : 'text-green-500'}`}>
            ₹{Math.max(0, amountDue).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Pay Now */}
      {amountDue > 0 && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-2xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Payment Due</h3>
              <p className="text-sm text-gray-600 mt-1">
                You have an outstanding balance of ₹{amountDue.toLocaleString()}
              </p>
            </div>
            <button
              onClick={handlePayNow}
              disabled={paying}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
            >
              <CreditCard className="w-5 h-5" />
              {paying ? 'Processing…' : `Pay ₹${amountDue.toLocaleString()} Now`}
            </button>
          </div>
        </div>
      )}

      {amountDue <= 0 && totalPaid > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <h3 className="font-semibold text-green-800">All Paid Up!</h3>
            <p className="text-sm text-green-600">You have no outstanding payments.</p>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Payment History</h3>
        </div>
        {(org.payment?.payments || []).length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">No payments yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...(org.payment?.payments || [])].reverse().map((payment, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 text-gray-600">{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">₹{payment.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
