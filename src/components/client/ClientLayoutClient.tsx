'use client';

import SessionProvider from '@/components/providers/SessionProvider';
import ClientSidebar from '@/components/client/ClientSidebar';
import ClientTopbar from '@/components/client/ClientTopbar';
import { Toaster } from '@/components/ui/toast';

export default function ClientLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="client-layout">
        <ClientSidebar />
        <div className="client-layout__main">
          <ClientTopbar />
          <main className="client-layout__content">{children}</main>
        </div>
        <Toaster />
      </div>

      <style>{`
        .client-layout {
          min-height: 100vh;
          background: #f8f9fa;
          color: #0f172a;
        }

        .client-layout__main {
          margin-left: 260px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.25s ease;
        }

        .client-layout__content {
          flex: 1;
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .client-layout__main {
            margin-left: 72px;
          }

          .client-layout__content {
            padding: 1rem;
          }
        }
      `}</style>
    </SessionProvider>
  );
}
