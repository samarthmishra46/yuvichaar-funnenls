'use client';

import { usePathname } from 'next/navigation';
import SessionProvider from '@/components/providers/SessionProvider';
import SuperadminSidebar from '@/components/superadmin/SuperadminSidebar';
import SuperadminTopbar from '@/components/superadmin/SuperadminTopbar';
import { Toaster } from '@/components/ui/toast';

export default function SuperadminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/superadmin/login';

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
      <div className="min-h-screen bg-[#f8f9fa] text-[#0f172a]">
        <SuperadminSidebar />
        <div className="ml-[260px] md:ml-[260px] max-md:ml-[72px] min-h-screen flex flex-col transition-[margin-left] duration-[250ms] ease-in-out">
          <SuperadminTopbar />
          <main className="flex-1 p-8 max-md:p-4 bg-white">{children}</main>
        </div>
        <Toaster />
      </div>
    </SessionProvider>
  );
}
