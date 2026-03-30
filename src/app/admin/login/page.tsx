'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07070d' }} />}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

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
      const result = await signIn('admin-login', {
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
    <div className="admin-login-page">
      {/* Animated background effects */}
      <div className="admin-login-bg">
        <div className="admin-login-orb admin-login-orb-1" />
        <div className="admin-login-orb admin-login-orb-2" />
        <div className="admin-login-orb admin-login-orb-3" />
        <div className="admin-login-grid" />
      </div>

      <div className="admin-login-container">
        {/* Logo / Brand */}
        <div className="admin-login-brand">
          <div className="admin-login-shield">
            <ShieldCheck className="admin-login-shield-icon" />
          </div>
          <h1 className="admin-login-title">
            <span className="admin-login-title-white">Yuvi</span>
            <span className="admin-login-title-pink">chaar</span>
          </h1>
          <p className="admin-login-subtitle">Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="admin-login-card">
          <div className="admin-login-card-header">
            <h2 className="admin-login-card-title">Welcome back</h2>
            <p className="admin-login-card-desc">
              Sign in to access the admin panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            {/* Error Message */}
            {error && (
              <div className="admin-login-error">
                <div className="admin-login-error-dot" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="admin-login-field">
              <label htmlFor="admin-email" className="admin-login-label">
                Email Address
              </label>
              <div className="admin-login-input-wrapper">
                <Mail className="admin-login-input-icon" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yuvichaar.com"
                  required
                  autoComplete="email"
                  className="admin-login-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="admin-login-field">
              <label htmlFor="admin-password" className="admin-login-label">
                Password
              </label>
              <div className="admin-login-input-wrapper">
                <Lock className="admin-login-input-icon" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="admin-login-input admin-login-input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="admin-login-toggle-pw"
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
              className="admin-login-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign in to Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="admin-login-footer">
            <p>Protected area · Authorized personnel only</p>
          </div>
        </div>
      </div>

      {/* Scoped Styles */}
      <style jsx>{`
        .admin-login-page {
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
        .admin-login-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .admin-login-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
        }

        .admin-login-orb-1 {
          width: 500px;
          height: 500px;
          background: #9333ea;
          top: -150px;
          right: -100px;
          animation: adminOrbFloat 8s ease-in-out infinite;
        }

        .admin-login-orb-2 {
          width: 400px;
          height: 400px;
          background: #e91e8c;
          bottom: -100px;
          left: -100px;
          animation: adminOrbFloat 10s ease-in-out infinite reverse;
        }

        .admin-login-orb-3 {
          width: 300px;
          height: 300px;
          background: #7c3aed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: adminOrbPulse 6s ease-in-out infinite;
        }

        .admin-login-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        @keyframes adminOrbFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-40px); }
        }

        @keyframes adminOrbPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.35; }
        }

        /* ── Container ── */
        .admin-login-container {
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
        .admin-login-brand {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .admin-login-shield {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #9333ea, #e91e8c);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(147, 51, 234, 0.4);
          animation: adminShieldGlow 3s ease-in-out infinite;
        }

        @keyframes adminShieldGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(147, 51, 234, 0.4); }
          50% { box-shadow: 0 0 50px rgba(233, 30, 140, 0.5); }
        }

        .admin-login-shield-icon {
          width: 28px;
          height: 28px;
          color: white;
        }

        .admin-login-title {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
        }

        .admin-login-title-white {
          color: #f8fafc;
        }

        .admin-login-title-pink {
          color: #f472b6;
        }

        .admin-login-subtitle {
          font-size: 0.875rem;
          color: #94a3b8;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        /* ── Card ── */
        .admin-login-card {
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

        .admin-login-card-header {
          text-align: center;
          margin-bottom: 1.75rem;
        }

        .admin-login-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.375rem;
        }

        .admin-login-card-desc {
          font-size: 0.875rem;
          color: #64748b;
        }

        /* ── Form ── */
        .admin-login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .admin-login-error {
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

        .admin-login-error-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ef4444;
          flex-shrink: 0;
        }

        .admin-login-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .admin-login-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #cbd5e1;
          letter-spacing: 0.02em;
        }

        .admin-login-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .admin-login-input-icon {
          position: absolute;
          left: 14px;
          width: 16px;
          height: 16px;
          color: #64748b;
          pointer-events: none;
          z-index: 1;
        }

        .admin-login-input {
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

        .admin-login-input::placeholder {
          color: #475569;
        }

        .admin-login-input:focus {
          border-color: #9333ea;
          box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.15);
          background: rgba(255, 255, 255, 0.06);
        }

        .admin-login-input-password {
          padding-right: 2.75rem;
        }

        .admin-login-toggle-pw {
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

        .admin-login-toggle-pw:hover {
          color: #cbd5e1;
        }

        /* ── Submit Button ── */
        .admin-login-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.8125rem;
          margin-top: 0.25rem;
          background: linear-gradient(135deg, #9333ea, #e91e8c);
          color: white;
          font-size: 0.9375rem;
          font-weight: 600;
          font-family: inherit;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 15px rgba(147, 51, 234, 0.35);
          position: relative;
          overflow: hidden;
        }

        .admin-login-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #a855f7, #f472b6);
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .admin-login-submit:hover::before {
          opacity: 1;
        }

        .admin-login-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 25px rgba(147, 51, 234, 0.45);
        }

        .admin-login-submit:active {
          transform: translateY(0);
        }

        .admin-login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .admin-login-submit > * {
          position: relative;
          z-index: 1;
        }

        /* ── Footer ── */
        .admin-login-footer {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .admin-login-footer p {
          font-size: 0.75rem;
          color: #475569;
          letter-spacing: 0.05em;
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .admin-login-card {
            padding: 1.5rem;
            border-radius: 16px;
          }

          .admin-login-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
