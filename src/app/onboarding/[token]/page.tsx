'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Organization {
  _id: string;
  name: string;
  email: string;
  payment: {
    totalAmount: number;
    minimumPayment: number;
  };
  onboarding: {
    mouUrl: string;
    sowUrl: string;
    signedAt?: string;
    signatureUrl?: string;
    minimumPaymentPaid: boolean;
    passwordSetup: boolean;
  };
}

export default function OnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<Organization | null>(null);
  const [step, setStep] = useState<'documents' | 'payment' | 'password'>('documents');
  const [signature, setSignature] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeDoc, setActiveDoc] = useState<'mou' | 'sow'>('mou');

  useEffect(() => {
    fetchOnboardingData();
  }, [token]);

  const fetchOnboardingData = async () => {
    try {
      const res = await fetch(`/api/onboarding/${token}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Invalid onboarding link');
        return;
      }

      setOrg(data.organization);

      // Determine current step
      if (data.organization.onboarding.passwordSetup) {
        toast.success('Onboarding already completed!');
        router.push('/login');
        return;
      } else if (data.organization.onboarding.minimumPaymentPaid) {
        setStep('password');
      } else if (data.organization.onboarding.signedAt) {
        setStep('payment');
      } else {
        setStep('documents');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load onboarding data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignDocuments = async () => {
    if (!signature.trim()) {
      toast.error('Please enter your full name as signature');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`/api/onboarding/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to sign documents');
        return;
      }

      toast.success('Documents signed successfully!');
      setStep('payment');
      await fetchOnboardingData();
    } catch (error) {
      console.error('Sign error:', error);
      toast.error('Failed to sign documents');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!org) return;

    setProcessing(true);
    try {
      // Create Razorpay order
      const orderRes = await fetch(`/api/onboarding/${token}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: org.payment.minimumPayment }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.error(orderData.error || 'Failed to create payment order');
        setProcessing(false);
        return;
      }

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          order_id: orderData.orderId,
          name: 'Yuvichaar',
          description: 'Minimum Payment',
          handler: async (response: any) => {
            // Verify payment
            const verifyRes = await fetch(`/api/onboarding/${token}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: orderData.amount,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              toast.success('Payment successful!');
              setStep('password');
              await fetchOnboardingData();
            } else {
              toast.error(verifyData.error || 'Payment verification failed');
            }
            setProcessing(false);
          },
          modal: {
            ondismiss: () => {
              setProcessing(false);
            },
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      };
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment');
      setProcessing(false);
    }
  };

  const handleSetPassword = async () => {
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`/api/onboarding/${token}/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to set password');
        return;
      }

      toast.success('Onboarding completed! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Set password error:', error);
      toast.error('Failed to set password');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#f472b6]" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#64748b]">Invalid or expired onboarding link</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Yuvichaar!</h1>
          <p className="text-[#64748b]">Complete your onboarding for {org.name}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['documents', 'payment', 'password'].map((s, idx) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step === s
                    ? 'bg-[#f472b6] text-white'
                    : org.onboarding.passwordSetup ||
                      (s === 'payment' && org.onboarding.minimumPaymentPaid) ||
                      (s === 'documents' && org.onboarding.signedAt)
                    ? 'bg-[#10b981] text-white'
                    : 'bg-[rgba(255,255,255,0.1)] text-[#64748b]'
                }`}
              >
                {idx + 1}
              </div>
              {idx < 2 && (
                <div
                  className={`w-12 h-0.5 ${
                    org.onboarding.passwordSetup ||
                    (s === 'payment' && org.onboarding.minimumPaymentPaid) ||
                    (s === 'documents' && org.onboarding.signedAt)
                      ? 'bg-[#10b981]'
                      : 'bg-[rgba(255,255,255,0.1)]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 'documents' && (
          <div className="space-y-6">
            {/* Document Tabs */}
            <div className="flex gap-2 bg-[#111118] p-1 rounded-xl border border-[rgba(255,255,255,0.06)]">
              <button
                onClick={() => setActiveDoc('mou')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeDoc === 'mou'
                    ? 'bg-[#f472b6] text-white'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                MOU (Memorandum of Understanding)
              </button>
              <button
                onClick={() => setActiveDoc('sow')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeDoc === 'sow'
                    ? 'bg-[#f472b6] text-white'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                SOW (Statement of Work)
              </button>
            </div>

            {/* PDF Viewer */}
            <Card className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
              <CardContent className="p-0">
                <div className="w-full h-[600px] rounded-xl overflow-hidden">
                  <iframe
                    src={activeDoc === 'mou' ? org.onboarding.mouUrl : org.onboarding.sowUrl}
                    className="w-full h-full border-0"
                    title={activeDoc === 'mou' ? 'MOU Document' : 'SOW Document'}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Signature Section */}
            <Card className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
              <CardHeader>
                <CardTitle className="!text-white">Sign Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[#94a3b8] text-sm">
                  By signing below, you agree to the terms outlined in both the MOU and SOW documents.
                </p>

                <Input
                  id="signature"
                  label="Full Name (Signature)"
                  placeholder="Enter your full name"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
                />

                <div className="pt-4">
                  <Button onClick={handleSignDocuments} disabled={processing} className="w-full">
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing...
                      </>
                    ) : (
                      'Sign Documents & Continue'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'payment' && (
          <Card className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
            <CardHeader>
              <CardTitle className="!text-white">Minimum Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-[rgba(255,255,255,0.04)] rounded-xl p-4 border border-[rgba(255,255,255,0.1)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#94a3b8]">Total Amount:</span>
                  <span className="text-white font-semibold">₹{org.payment.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#94a3b8]">Minimum Payment:</span>
                  <span className="text-[#f472b6] font-bold text-xl">
                    ₹{org.payment.minimumPayment.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[#94a3b8] text-sm">
                Please complete the minimum payment to proceed with your onboarding.
              </p>

              <div className="pt-4">
                <Button onClick={handlePayment} disabled={processing} className="w-full">
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ₹${org.payment.minimumPayment.toLocaleString()}`
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'password' && (
          <Card className="!bg-[#111118] !border-[rgba(255,255,255,0.06)]">
            <CardHeader>
              <CardTitle className="!text-white">Set Your Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                <p className="text-sm text-[#10b981]">Payment completed successfully!</p>
              </div>

              <p className="text-[#94a3b8] text-sm">
                Create a secure password for your account to complete the onboarding process.
              </p>

              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
              />

              <Input
                id="confirm-password"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
              />

              <div className="pt-4">
                <Button onClick={handleSetPassword} disabled={processing} className="w-full">
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting Password...
                    </>
                  ) : (
                    'Complete Onboarding'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
