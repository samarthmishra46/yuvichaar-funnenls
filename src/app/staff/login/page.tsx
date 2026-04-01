'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function StaffLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn('staff-login', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.ok) {
        toast.success('Login successful!');
        router.push('/staff');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0b2e] to-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9333ea] to-[#e91e8c] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/40">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Staff Portal</h1>
          <p className="text-[#94a3b8] text-sm">Sign in to access your tasks</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#111118] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="your.email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
              autoComplete="email"
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="!bg-[rgba(255,255,255,0.04)] !border-[rgba(255,255,255,0.1)] !text-white placeholder:!text-[#475569]"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#64748b] mt-6">
          Staff members only. Contact admin if you need access.
        </p>
      </div>
    </div>
  );
}
