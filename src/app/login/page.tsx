'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, Building2, Loader2 } from 'lucide-react';

export default function ClientLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07070d' }} />}>
      <ClientLoginForm />
    </Suspense>
  );
}

function ClientLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/client';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('client-login', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="client-login-page">
      {/* Animated background effects */}
      <div className="client-login-bg">
        <div className="client-login-orb client-login-orb-1" />
        <div className="client-login-orb client-login-orb-2" />
        <div className="client-login-orb client-login-orb-3" />
        <div className="client-login-grid" />
      </div>

      <div className="client-login-container">
        {/* Logo / Brand */}
        <div className="client-login-brand">
          <div className="client-login-icon-wrap">
            <Building2 className="client-login-icon" />
          </div>
          <h1 className="client-login-title">
            <span className="client-login-title-white">Yuvi</span>
            <span className="client-login-title-pink">chaar</span>
          </h1>
          <p className="client-login-subtitle">Client Portal</p>
        </div>

        {/* Login Card */}
        <div className="client-login-card">
          <div className="client-login-card-header">
            <h2 className="client-login-card-title">Welcome back</h2>
            <p className="client-login-card-desc">
              Sign in to view your brand dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="client-login-form">
            {/* Error Message */}
            {error && (
              <div className="client-login-error">
                <div className="client-login-error-dot" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="client-login-field">
              <label htmlFor="client-email" className="client-login-label">
                Email Address
              </label>
              <div className="client-login-input-wrapper">
                <Mail className="client-login-input-icon" />
                <input
                  id="client-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  className="client-login-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="client-login-field">
              <label htmlFor="client-password" className="client-login-label">
                Password
              </label>
              <div className="client-login-input-wrapper">
                <Lock className="client-login-input-icon" />
                <input
                  id="client-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="client-login-input client-login-input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="client-login-toggle-pw"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="client-login-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  <span>Sign in to Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="client-login-footer">
            <p>Your credentials were provided by the Yuvichaar team</p>
          </div>
        </div>
      </div>

      {/* Scoped Styles */}
      <style jsx>{`
        .client-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #07070d;
          position: relative;
          overflow: hidden;
          padding: 1rem;
        }

        /* ── Animated Background ── */
        .client-login-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .client-login-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.25;
        }

        .client-login-orb-1 {
          width: 450px;
          height: 450px;
          background: #e91e8c;
          top: -120px;
          left: -80px;
          animation: clientOrbFloat 9s ease-in-out infinite;
        }

        .client-login-orb-2 {
          width: 380px;
          height: 380px;
          background: #9333ea;
          bottom: -80px;
          right: -60px;
          animation: clientOrbFloat 11s ease-in-out infinite reverse;
        }

        .client-login-orb-3 {
          width: 260px;
          height: 260px;
          background: #ec4899;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: clientOrbPulse 7s ease-in-out infinite;
        }

        .client-login-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        @keyframes clientOrbFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-35px); }
        }

        @keyframes clientOrbPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.15; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.3; }
        }

        /* ── Container ── */
        .client-login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        /* ── Brand ── */
        .client-login-brand {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .client-login-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #e91e8c, #9333ea);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(233, 30, 140, 0.4);
          animation: clientIconGlow 3s ease-in-out infinite;
        }

        @keyframes clientIconGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(233, 30, 140, 0.4); }
          50% { box-shadow: 0 0 50px rgba(147, 51, 234, 0.5); }
        }

        .client-login-icon {
          width: 28px;
          height: 28px;
          color: white;
        }

        .client-login-title {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
        }

        .client-login-title-white {
          color: #f8fafc;
        }

        .client-login-title-pink {
          color: #f472b6;
        }

        .client-login-subtitle {
          font-size: 0.875rem;
          color: #94a3b8;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        /* ── Card ── */
        .client-login-card {
          width: 100%;
          background: rgba(17, 17, 24, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 2rem;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.05),
            0 20px 50px rgba(0, 0, 0, 0.5);
        }

        .client-login-card-header {
          text-align: center;
          margin-bottom: 1.75rem;
        }

        .client-login-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.375rem;
        }

        .client-login-card-desc {
          font-size: 0.875rem;
          color: #64748b;
        }

        /* ── Form ── */
        .client-login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .client-login-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 10px;
          color: #f87171;
          font-size: 0.875rem;
        }

        .client-login-error-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ef4444;
          flex-shrink: 0;
        }

        .client-login-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .client-login-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #cbd5e1;
          letter-spacing: 0.02em;
        }

        .client-login-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .client-login-input-icon {
          position: absolute;
          left: 14px;
          width: 16px;
          height: 16px;
          color: #64748b;
          pointer-events: none;
          z-index: 1;
        }

        .client-login-input {
          width: 100%;
          padding: 0.75rem 0.875rem 0.75rem 2.75rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #f8fafc;
          font-size: 0.9375rem;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
        }

        .client-login-input::placeholder {
          color: #475569;
        }

        .client-login-input:focus {
          border-color: #e91e8c;
          box-shadow: 0 0 0 3px rgba(233, 30, 140, 0.15);
          background: rgba(255, 255, 255, 0.06);
        }

        .client-login-input-password {
          padding-right: 2.75rem;
        }

        .client-login-toggle-pw {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: color 0.2s ease;
        }

        .client-login-toggle-pw:hover {
          color: #cbd5e1;
        }

        /* ── Submit Button ── */
        .client-login-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.8125rem;
          margin-top: 0.25rem;
          background: linear-gradient(135deg, #e91e8c, #9333ea);
          color: white;
          font-size: 0.9375rem;
          font-weight: 600;
          font-family: inherit;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 15px rgba(233, 30, 140, 0.35);
          position: relative;
          overflow: hidden;
        }

        .client-login-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #f472b6, #a855f7);
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .client-login-submit:hover::before {
          opacity: 1;
        }

        .client-login-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 25px rgba(233, 30, 140, 0.45);
        }

        .client-login-submit:active {
          transform: translateY(0);
        }

        .client-login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .client-login-submit > * {
          position: relative;
          z-index: 1;
        }

        /* ── Footer ── */
        .client-login-footer {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .client-login-footer p {
          font-size: 0.75rem;
          color: #475569;
          letter-spacing: 0.02em;
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .client-login-card {
            padding: 1.5rem;
            border-radius: 16px;
          }

          .client-login-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
