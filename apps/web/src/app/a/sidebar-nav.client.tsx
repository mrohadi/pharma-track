'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PTLogo } from '@/components/logo';
import { SignOutButton } from '@/components/sign-out-button';

const PT = {
  sidebar: 'oklch(0.15 0.04 255)',
  sidebarHover: 'rgba(255,255,255,0.07)',
  sidebarActive: 'rgba(255,255,255,0.13)',
  danger: 'oklch(0.55 0.2 25)',
};

const NAV = [
  { href: '/a', icon: '📊', label: 'Dashboard' },
  { href: '/a/orders', icon: '📦', label: 'Orders' },
  { href: '/a/users', icon: '👥', label: 'Users' },
  { href: '/a/analytics', icon: '📈', label: 'Analytics' },
  { href: '/a/settings', icon: '⚙️', label: 'Settings' },
];

export function AdminSidebar({
  userName,
  userEmail,
  pendingCount,
}: {
  userName: string;
  userEmail: string;
  pendingCount: number;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/a') return pathname === '/a';
    return pathname.startsWith(href);
  }

  return (
    <div
      style={{
        width: 240,
        background: PT.sidebar,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '22px 18px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <PTLogo size={34} white />
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15.5, lineHeight: 1.2 }}>
            PharmaTrack
          </div>
          <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginTop: 1 }}>
            Administrator
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        {NAV.map((item) => {
          const active = isActive(item.href);
          const badge = item.href === '/a/users' && pendingCount > 0 ? pendingCount : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                marginBottom: 2,
                background: active ? PT.sidebarActive : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.58)',
                fontSize: 13.5,
                fontWeight: active ? 600 : 400,
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = PT.sidebarHover;
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              {item.label}
              {badge && (
                <span
                  style={{
                    marginLeft: 'auto',
                    background: PT.danger,
                    color: '#fff',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 7px',
                  }}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: '14px 14px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            background: 'oklch(0.52 0.18 250)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {userName}
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.38)',
              fontSize: 11,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {userEmail}
          </div>
        </div>
        <SignOutButton className="cursor-pointer border-none bg-transparent p-0 text-[11px] text-white/40 transition-colors hover:text-white/70" />
      </div>
    </div>
  );
}
