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
      <div className="min-h-screen bg-[#f8f9fa] text-[#0f172a]">
        <ClientSidebar />
        <div className="ml-[260px] md:ml-[260px] max-md:ml-[72px] min-h-screen flex flex-col transition-[margin-left] duration-250 ease-in-out">
          <ClientTopbar />
          <main className="flex-1 p-8 md:p-8 max-md:p-4">{children}</main>
        </div>
        <Toaster />
      </div>
    </SessionProvider>
  );
}
