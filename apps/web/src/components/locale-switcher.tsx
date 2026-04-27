'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function LocaleSwitcher({
  locale,
  variant = 'light',
}: {
  locale: string;
  variant?: 'light' | 'dark';
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function switchLocale(next: string) {
    document.cookie = `locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  }

  const activeStyle =
    variant === 'dark' ? { color: '#fff', fontWeight: 700 } : { color: '#1e293b', fontWeight: 700 };
  const inactiveStyle =
    variant === 'dark' ? { color: 'rgba(255,255,255,0.35)' } : { color: '#94a3b8' };
  const separatorStyle =
    variant === 'dark' ? { color: 'rgba(255,255,255,0.2)' } : { color: '#cbd5e1' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
      <button
        onClick={() => switchLocale('id')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          fontFamily: 'inherit',
          fontSize: 11,
          ...(locale === 'id' ? activeStyle : inactiveStyle),
        }}
      >
        ID
      </button>
      <span style={separatorStyle}>/</span>
      <button
        onClick={() => switchLocale('en')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          fontFamily: 'inherit',
          fontSize: 11,
          ...(locale === 'en' ? activeStyle : inactiveStyle),
        }}
      >
        EN
      </button>
    </div>
  );
}
