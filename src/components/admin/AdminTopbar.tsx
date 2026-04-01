'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut, Shield } from 'lucide-react';

export default function AdminTopbar() {
  const { data: session } = useSession();

  return (
    <>
      <header className="admin-topbar">
        <div className="admin-topbar__left">
          <h2 className="admin-topbar__title">Admin Panel</h2>
        </div>

        <div className="admin-topbar__right">
          <div className="admin-topbar__user">
            <div className="admin-topbar__avatar">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="admin-topbar__info">
              <span className="admin-topbar__name">
                {session?.user?.name || 'Admin'}
              </span>
              <span className="admin-topbar__role">Administrator</span>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="admin-topbar__logout"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <style jsx>{`
        .admin-topbar {
          position: sticky;
          top: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          height: 64px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05);
        }

        .admin-topbar__left {
          display: flex;
          align-items: center;
        }

        .admin-topbar__title {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .admin-topbar__right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-topbar__user {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .admin-topbar__avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #9333ea, #e91e8c);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-topbar__info {
          display: flex;
          flex-direction: column;
        }

        .admin-topbar__name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.2;
        }

        .admin-topbar__role {
          font-size: 0.6875rem;
          color: #64748b;
          line-height: 1.2;
        }

        .admin-topbar__logout {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #f8f9fa;
          border: 1px solid #e2e8f0;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-topbar__logout:hover {
          background: #fee2e2;
          border-color: #fecaca;
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .admin-topbar {
            padding: 0 1rem;
          }

          .admin-topbar__info {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
