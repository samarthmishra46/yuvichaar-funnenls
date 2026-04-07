'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Inbox,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  DollarSign,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Inbox', href: '/admin/inbox', icon: Inbox, showBadge: true },
  { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
  { name: 'Staff', href: '/admin/staff', icon: Users },
  { name: 'Staff Tasks', href: '/admin/staff-tasks', icon: ClipboardList },
  { name: 'Finances', href: '/admin/finances', icon: DollarSign },
  { name: 'Templates', href: '/admin/templates', icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/admin/inbox?limit=1');
        const data = await res.json();
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 bg-white border-r border-[#e2e8f0] flex flex-col py-5 px-3 z-40 transition-[width] duration-[250ms] ease-in-out shadow-[0_1px_3px_0_rgb(0_0_0/0.05)] ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      } max-md:w-[72px]`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#9333ea] to-[#e91e8c] flex items-center justify-center shrink-0">
          <span className="text-white font-extrabold text-lg">Y</span>
        </div>
        {!collapsed && (
          <span className="text-lg whitespace-nowrap max-md:hidden">
            <span className="text-[#0f172a] font-bold">Yuvi</span>
            <span className="text-pink-400 font-bold">chaar</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const showBadge = (item as any).showBadge && unreadCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 no-underline whitespace-nowrap relative ${
                active
                  ? 'text-[#e91e8c] bg-[#fdf2f8] hover:bg-[#fce7f3]'
                  : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8f9fa]'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <div className="relative">
                <Icon className="w-5 h-5 shrink-0" />
                {showBadge && collapsed && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#e91e8c] rounded-full" />
                )}
              </div>
              {!collapsed && (
                <span className="max-md:hidden flex-1 flex items-center justify-between">
                  {item.name}
                  {showBadge && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs font-bold bg-[#e91e8c] text-white rounded-full min-w-[20px] text-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#f8f9fa] border border-[#e2e8f0] text-[#64748b] cursor-pointer mx-auto transition-all duration-200 hover:bg-[#f1f3f5] hover:text-[#0f172a] max-md:hidden"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
