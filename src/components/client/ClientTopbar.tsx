'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function ClientTopbar() {
  const { data: session } = useSession();

  return (
    <>
      <header className="client-topbar">
        <div className="client-topbar__left">
          <h2 className="client-topbar__title">Client Dashboard</h2>
        </div>

        <div className="client-topbar__right">
          <div className="client-topbar__user">
            <div className="client-topbar__avatar">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div className="client-topbar__info">
              <span className="client-topbar__name">
                {session?.user?.name || 'Client'}
              </span>
              <span className="client-topbar__email">
                {session?.user?.email || ''}
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="client-topbar__logout"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <style jsx>{`
        .client-topbar {
          position: sticky;
          top: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          height: 64px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e8f0;
        }

        .client-topbar__left {
          display: flex;
          align-items: center;
        }

        .client-topbar__title {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .client-topbar__right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .client-topbar__user {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .client-topbar__avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #e91e8c, #9333ea);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.8125rem;
        }

        .client-topbar__info {
          display: flex;
          flex-direction: column;
        }

        .client-topbar__name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.2;
        }

        .client-topbar__email {
          font-size: 0.6875rem;
          color: #64748b;
          line-height: 1.2;
        }

        .client-topbar__logout {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: transparent;
          border: 1px solid #e2e8f0;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .client-topbar__logout:hover {
          background: #fee2e2;
          border-color: #fca5a5;
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .client-topbar {
            padding: 0 1rem;
          }

          .client-topbar__info {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
