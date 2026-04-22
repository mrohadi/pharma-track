'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/p', icon: '📊', label: 'Dashboard' },
  { href: '/p/orders/new', icon: '➕', label: 'Order Baru' },
  { href: '/p/history', icon: '📋', label: 'Riwayat Order' },
  { href: '/p/settings', icon: '⚙️', label: 'Settings' },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-2.5 py-3">
      {navItems.map((item) => {
        const isActive = item.href === '/p' ? pathname === '/p' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] transition-colors ${
              isActive
                ? 'bg-white/13 font-semibold text-white'
                : 'hover:bg-white/7 font-medium text-white/60 hover:text-white'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
