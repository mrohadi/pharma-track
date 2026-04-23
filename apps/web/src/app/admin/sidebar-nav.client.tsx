'use client';

import { PTLogo } from '@/components/logo';
import { SignOutButton } from '@/components/sign-out-button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const SIDEBAR_BG = 'oklch(0.15 0.04 255)';
const DANGER = 'oklch(0.55 0.2 25)';

const NAV = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/orders', icon: '📦', label: 'Orders' },
  { href: '/admin/users', icon: '👥', label: 'Users' },
  { href: '/admin/analytics', icon: '📈', label: 'Analytics' },
  { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
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
  const [open, setOpen] = useState(false);

  function openDrawer() {
    setOpen(true);
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0 });
  }

  function closeDrawer() {
    setOpen(false);
    document.body.style.overflow = '';
  }

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <div
      style={{
        width: 240,
        background: SIDEBAR_BG,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
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
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15.5, lineHeight: 1.2 }}>
            PharmaTrack
          </div>
          <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginTop: 1 }}>
            Administrator
          </div>
        </div>
        {/* Close button — only visible on mobile when drawer open */}
        <button
          onClick={() => closeDrawer()}
          aria-label="Close menu"
          className="lg:hidden"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.6)',
            fontSize: 18,
            width: 32,
            height: 32,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, minHeight: 0, padding: '10px', overflowY: 'auto' }}>
        {NAV.map((item) => {
          const active = isActive(item.href);
          const badge = item.href === '/admin/users' && pendingCount > 0 ? pendingCount : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => closeDrawer()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                marginBottom: 2,
                background: active ? 'rgba(255,255,255,0.13)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.58)',
                fontSize: 13.5,
                fontWeight: active ? 600 : 400,
                textDecoration: 'none',
              }}
            >
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              {item.label}
              {badge && (
                <span
                  style={{
                    marginLeft: 'auto',
                    background: DANGER,
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
          padding: '14px',
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

  return (
    <>
      {/* ── Desktop: fixed sidebar (lg+) ── */}
      <div
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex"
        style={{ width: 240 }}
      >
        {sidebarContent}
      </div>

      {/* ── Mobile/tablet: top bar (< lg) ── */}
      <div
        className={`items-center justify-between px-4 py-3 lg:hidden ${open ? 'hidden' : 'flex'}`}
        style={{ background: SIDEBAR_BG, position: 'sticky', top: 0, zIndex: 50 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PTLogo size={28} white />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>PharmaTrack</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Pending badge on mobile */}
          {pendingCount > 0 && (
            <Link
              href="/admin/users"
              style={{
                background: DANGER,
                color: '#fff',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                textDecoration: 'none',
              }}
            >
              {pendingCount} pending
            </Link>
          )}
          <button
            onClick={() => openDrawer()}
            aria-label="Open menu"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 20,
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {/* ── Drawer overlay (mobile/tablet) ── */}
      {open && (
        <>
          {/* Backdrop — sits above the sticky top bar (z-30) */}
          <div
            className="fixed inset-0 bg-black/60 lg:hidden"
            style={{ zIndex: 60 }}
            onClick={() => closeDrawer()}
          />
          {/* Drawer — above backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 240,
              zIndex: 70,
              height: '100%',
            }}
          >
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
