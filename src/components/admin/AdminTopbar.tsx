'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut, Shield } from 'lucide-react';

export default function AdminTopbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-8 max-md:px-4 h-16 bg-white/95 backdrop-blur-[12px] border-b border-[#e2e8f0] shadow-[0_1px_3px_0_rgb(0_0_0/0.05)]">
      <div className="flex items-center">
        <h2 className="text-base font-semibold text-[#0f172a]">Admin Panel</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9333ea] to-[#e91e8c] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col max-md:hidden">
            <span className="text-[0.8125rem] font-semibold text-[#0f172a] leading-tight">
              {session?.user?.name || 'Admin'}
            </span>
            <span className="text-[0.6875rem] text-[#64748b] leading-tight">Administrator</span>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-[#f8f9fa] border border-[#e2e8f0] text-[#64748b] cursor-pointer transition-all duration-200 hover:bg-[#fee2e2] hover:border-[#fecaca] hover:text-[#ef4444]"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
