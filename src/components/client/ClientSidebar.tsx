'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Video,
  Globe,
  CreditCard,
  Layers,
} from 'lucide-react';

interface CustomSection {
  id: string;
  title: string;
  contentType: string;
}

const staticNavItems = [
  { name: 'Dashboard', href: '/client', icon: LayoutDashboard },
  { name: 'Brand Info', href: '/client/brand', icon: Building2 },
  { name: 'Research', href: '/client/research', icon: FileText },
  { name: 'Videos', href: '/client/videos', icon: Video },
  { name: 'Landing Page', href: '/client/landing-page', icon: Globe },
  { name: 'Payments', href: '/client/payments', icon: CreditCard },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sections, setSections] = useState<CustomSection[]>([]);

  useEffect(() => {
    if (session?.user?.orgId) {
      fetch(`/api/organizations/${session.user.orgId}/sections`)
        .then((r) => r.json())
        .then((data) => {
          if (data.sections) setSections(data.sections);
        })
        .catch(() => {});
    }
  }, [session?.user?.orgId]);

  const isActive = (href: string) => {
    if (href === '/client') return pathname === '/client';
    return pathname.startsWith(href);
  };

  return (
    <>
      <aside className="client-sidebar">
        {/* Logo */}
        <div className="client-sidebar__logo">
          <div className="client-sidebar__logo-icon">
            <span className="client-sidebar__logo-letter">Y</span>
          </div>
          <span className="client-sidebar__logo-text">
            <span className="font-bold text-gray-900">Yuvi</span>
            <span className="font-bold text-pink-500">chaar</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="client-sidebar__nav">
          {staticNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`client-sidebar__link ${active ? 'client-sidebar__link--active' : ''}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Dynamic custom sections */}
          {sections.length > 0 && (
            <>
              <div className="client-sidebar__divider" />
              <span className="client-sidebar__section-label">Custom Sections</span>
              {sections.map((section) => {
                const href = `/client/sections/${section.id}`;
                const active = pathname === href;
                return (
                  <Link
                    key={section.id}
                    href={href}
                    className={`client-sidebar__link ${active ? 'client-sidebar__link--active' : ''}`}
                  >
                    <Layers className="w-5 h-5 shrink-0" />
                    <span>{section.title}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>
      </aside>

      <style jsx>{`
        .client-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 260px;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          padding: 1.25rem 0.75rem;
          z-index: 40;
          overflow-y: auto;
        }

        .client-sidebar__logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 0.5rem;
          margin-bottom: 2rem;
        }

        .client-sidebar__logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #e91e8c, #9333ea);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .client-sidebar__logo-letter {
          color: white;
          font-weight: 800;
          font-size: 1.125rem;
        }

        .client-sidebar__logo-text {
          font-size: 1.125rem;
          white-space: nowrap;
        }

        .client-sidebar__nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }

        .client-sidebar__link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.75rem;
          border-radius: 12px;
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          text-decoration: none;
          white-space: nowrap;
        }

        .client-sidebar__link:hover {
          color: #0f172a;
          background: #f8f9fa;
        }

        .client-sidebar__link--active {
          color: #e91e8c;
          background: #fdf2f8;
        }

        .client-sidebar__link--active:hover {
          color: #e91e8c;
          background: rgba(233, 30, 140, 0.1);
        }

        .client-sidebar__divider {
          height: 1px;
          background: #e2e8f0;
          margin: 0.75rem 0.5rem;
        }

        .client-sidebar__section-label {
          font-size: 0.6875rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0 0.75rem;
          margin-bottom: 0.25rem;
        }

        @media (max-width: 768px) {
          .client-sidebar {
            width: 72px;
          }

          .client-sidebar__logo-text,
          .client-sidebar__link span,
          .client-sidebar__section-label {
            display: none;
          }

          .client-sidebar__divider {
            margin: 0.5rem 0.25rem;
          }
        }
      `}</style>
    </>
  );
}
