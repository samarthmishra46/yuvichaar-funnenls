'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function ClientTopbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-8 max-md:px-4 h-16 bg-white/90 backdrop-blur-xl border-b border-[#e2e8f0]">
      <div className="flex items-center">
        <h2 className="text-base font-semibold text-[#0f172a]">Client Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e91e8c] to-[#9333ea] flex items-center justify-center text-white font-bold text-[0.8125rem]">
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <div className="flex flex-col max-md:hidden">
            <span className="text-[0.8125rem] font-semibold text-[#0f172a] leading-tight">
              {session?.user?.name || 'Client'}
            </span>
            <span className="text-[0.6875rem] text-[#64748b] leading-tight">
              {session?.user?.email || ''}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-transparent border border-[#e2e8f0] text-[#64748b] cursor-pointer transition-all hover:bg-[#fee2e2] hover:border-[#fca5a5] hover:text-[#ef4444]"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
