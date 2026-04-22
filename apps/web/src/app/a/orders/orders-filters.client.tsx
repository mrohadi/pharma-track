'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { ExportButton } from '../export-button';

const TABS = [
  { label: 'Semua', value: '' },
  { label: 'Menunggu', value: 'pending_address' },
  { label: 'Dalam Perjalanan', value: 'in_transit' },
  { label: 'Terkirim', value: 'delivered' },
  { label: 'Dibatalkan', value: 'cancelled' },
];

export function OrdersFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const currentStatus = sp.get('status') ?? '';

  function navigate(params: Record<string, string>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete('page');
    startTransition(() => router.push(`/a/orders?${next.toString()}`));
  }

  return (
    <div
      style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}
    >
      {/* Status tabs */}
      <div
        style={{
          display: 'flex',
          background: '#fff',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {TABS.map((tab) => {
          const active = currentStatus === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => navigate({ status: tab.value })}
              style={{
                padding: '7px 16px',
                border: 'none',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: active ? 'oklch(0.52 0.18 250)' : 'transparent',
                color: active ? '#fff' : '#64748b',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
        <span
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 14,
            color: '#94a3b8',
            pointerEvents: 'none',
          }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder="Cari order, pasien, apotek…"
          defaultValue={sp.get('q') ?? ''}
          onChange={(e) => navigate({ q: e.target.value })}
          style={{
            width: '100%',
            padding: '7px 12px 7px 32px',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            fontSize: 13,
            fontFamily: 'inherit',
            outline: 'none',
            background: '#fff',
          }}
        />
      </div>

      {/* Export */}
      <ExportButton status={currentStatus || undefined} />
    </div>
  );
}
