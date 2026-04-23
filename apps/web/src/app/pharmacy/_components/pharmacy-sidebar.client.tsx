'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out-button';

const SIDEBAR_BG = 'oklch(0.15 0.04 255)';

const NAV = [
  { href: '/pharmacy', icon: '📊', label: 'Dashboard' },
  { href: '/pharmacy/orders/new', icon: '➕', label: 'Order Baru' },
  { href: '/pharmacy/history', icon: '📋', label: 'Riwayat Order' },
  { href: '/pharmacy/settings', icon: '⚙️', label: 'Settings' },
];

export function PharmacySidebar({
  initial,
  pharmacyName,
  userEmail,
}: {
  initial: string;
  pharmacyName: string;
  userEmail: string;
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
    if (href === '/pharmacy') return pathname === '/pharmacy';
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
          padding: '20px 18px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          +
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
            PharmaTrack
          </div>
          <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginTop: 1 }}>Apotek</div>
        </div>
        <button
          onClick={closeDrawer}
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
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeDrawer}
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
          {initial}
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
            {pharmacyName}
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
      {/* Desktop: fixed sidebar (lg+) */}
      <div
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex"
        style={{ width: 240 }}
      >
        {sidebarContent}
      </div>

      {/* Mobile/tablet: top bar (< lg) */}
      <div
        className={`items-center justify-between px-4 py-3 lg:hidden ${open ? 'hidden' : 'flex'}`}
        style={{ background: SIDEBAR_BG, position: 'sticky', top: 0, zIndex: 50 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            +
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>PharmaTrack</span>
        </div>
        <button
          onClick={openDrawer}
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

      {/* Drawer overlay (mobile/tablet) */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/60 lg:hidden"
            style={{ zIndex: 60 }}
            onClick={closeDrawer}
          />
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
