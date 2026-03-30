'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      <aside
        className={`admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''}`}
      >
        {/* Logo */}
        <div className="admin-sidebar__logo">
          <div className="admin-sidebar__logo-icon">
            <span className="admin-sidebar__logo-gradient">Y</span>
          </div>
          {!collapsed && (
            <span className="admin-sidebar__logo-text">
              <span className="text-white font-bold">Yuvi</span>
              <span className="text-pink-400 font-bold">chaar</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="admin-sidebar__nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-sidebar__link ${active ? 'admin-sidebar__link--active' : ''}`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="admin-sidebar__toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>

      <style jsx>{`
        .admin-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 260px;
          background: #0d0d14;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          padding: 1.25rem 0.75rem;
          z-index: 40;
          transition: width 0.25s ease;
        }

        .admin-sidebar--collapsed {
          width: 72px;
        }

        .admin-sidebar__logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 0.5rem;
          margin-bottom: 2rem;
        }

        .admin-sidebar__logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #9333ea, #e91e8c);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .admin-sidebar__logo-gradient {
          color: white;
          font-weight: 800;
          font-size: 1.125rem;
        }

        .admin-sidebar__logo-text {
          font-size: 1.125rem;
          white-space: nowrap;
        }

        .admin-sidebar__nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }

        .admin-sidebar__link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.75rem;
          border-radius: 12px;
          color: #94a3b8;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          text-decoration: none;
          white-space: nowrap;
        }

        .admin-sidebar__link:hover {
          color: #f8fafc;
          background: rgba(255, 255, 255, 0.05);
        }

        .admin-sidebar__link--active {
          color: #f472b6;
          background: rgba(244, 114, 182, 0.1);
        }

        .admin-sidebar__link--active:hover {
          color: #f472b6;
          background: rgba(244, 114, 182, 0.15);
        }

        .admin-sidebar__toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          cursor: pointer;
          margin: 0 auto;
          transition: all 0.2s ease;
        }

        .admin-sidebar__toggle:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #f8fafc;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            width: 72px;
          }

          .admin-sidebar__logo-text,
          .admin-sidebar__link span {
            display: none;
          }

          .admin-sidebar__toggle {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
