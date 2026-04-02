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
      <div className="min-h-screen bg-[#f8f9fa] text-[#0f172a]">
        <AdminSidebar />
        <div className="ml-[260px] md:ml-[260px] max-md:ml-[72px] min-h-screen flex flex-col transition-[margin-left] duration-[250ms] ease-in-out">
          <AdminTopbar />
          <main className="flex-1 p-8 max-md:p-4 bg-white">{children}</main>
        </div>
        <Toaster />
      </div>
    </SessionProvider>
  );
}
