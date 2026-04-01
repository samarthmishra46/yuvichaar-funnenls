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
  MapPin,
} from 'lucide-react';

interface CustomSection {
  id: string;
  title: string;
  contentType: string;
}

const staticNavItems = [
  { name: 'Dashboard', href: '/client', icon: LayoutDashboard },
  { name: 'Brand Info', href: '/client/brand', icon: Building2 },
  { name: 'Roadmap', href: '/client/roadmap', icon: MapPin },
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
    <aside className="fixed top-0 left-0 bottom-0 w-[260px] max-md:w-[72px] bg-white border-r border-[#e2e8f0] flex flex-col py-5 px-3 z-40 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#e91e8c] to-[#9333ea] flex items-center justify-center shrink-0">
          <span className="text-white font-extrabold text-lg">Y</span>
        </div>
        <span className="text-lg whitespace-nowrap max-md:hidden">
          <span className="font-bold text-gray-900">Yuvi</span>
          <span className="font-bold text-pink-500">chaar</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {staticNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium transition-all no-underline whitespace-nowrap ${
                active
                  ? 'text-[#e91e8c] bg-[#fdf2f8] hover:bg-[rgba(233,30,140,0.1)]'
                  : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8f9fa]'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="max-md:hidden">{item.name}</span>
            </Link>
          );
        })}

        {/* Dynamic custom sections */}
        {sections.length > 0 && (
          <>
            <div className="h-px bg-[#e2e8f0] my-3 mx-2 max-md:mx-1" />
            <span className="text-[0.6875rem] font-semibold text-[#94a3b8] uppercase tracking-wider px-3 mb-1 max-md:hidden">
              Custom Sections
            </span>
            {sections.map((section) => {
              const href = `/client/sections/${section.id}`;
              const active = pathname === href;
              return (
                <Link
                  key={section.id}
                  href={href}
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium transition-all no-underline whitespace-nowrap ${
                    active
                      ? 'text-[#e91e8c] bg-[#fdf2f8] hover:bg-[rgba(233,30,140,0.1)]'
                      : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8f9fa]'
                  }`}
                >
                  <Layers className="w-5 h-5 shrink-0" />
                  <span className="max-md:hidden">{section.title}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
}
