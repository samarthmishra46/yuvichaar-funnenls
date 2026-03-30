'use client';

import { usePathname } from 'next/navigation';
import SessionProvider from '@/components/providers/SessionProvider';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { Toaster } from '@/components/ui/toast';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // Login page has its own full-screen design — skip layout chrome
  if (isLoginPage) {
    return (
      <SessionProvider>
        {children}
        <Toaster />
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-layout__main">
          <AdminTopbar />
          <main className="admin-layout__content">{children}</main>
        </div>
        <Toaster />
      </div>

      <style>{`
        .admin-layout {
          min-height: 100vh;
          background: #0a0a0f;
          color: #f8fafc;
        }

        .admin-layout__main {
          margin-left: 260px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.25s ease;
        }

        .admin-layout__content {
          flex: 1;
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .admin-layout__main {
            margin-left: 72px;
          }

          .admin-layout__content {
            padding: 1rem;
          }
        }
      `}</style>
    </SessionProvider>
  );
}
