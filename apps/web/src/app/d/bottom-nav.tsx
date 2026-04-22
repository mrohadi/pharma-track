'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/d', label: 'Beranda', icon: '🏠' },
  { href: '/d/active', label: 'Aktif', icon: '🚴' },
  { href: '/d/history', label: 'Riwayat', icon: '📋' },
  { href: '/d/profile', label: 'Profil', icon: '👤' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-200 bg-white/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-3 transition-colors"
          >
            <span className="text-[22px] leading-none">{tab.icon}</span>
            <span
              className={`text-[10px] font-semibold leading-tight ${
                active ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              {tab.label}
            </span>
            {active && <span className="mt-0.5 h-1 w-1 rounded-full bg-blue-600" />}
          </Link>
        );
      })}
    </nav>
  );
}
