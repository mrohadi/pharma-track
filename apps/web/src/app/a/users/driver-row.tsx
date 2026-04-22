'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { DriverRow } from '@pharmatrack/db';

const STATUS_STYLE: Record<string, { badge: string; dot: string }> = {
  pending:   { badge: 'bg-amber-100 text-amber-800',  dot: 'bg-amber-400' },
  active:    { badge: 'bg-green-100 text-green-800',  dot: 'bg-green-400' },
  suspended: { badge: 'bg-red-100 text-red-800',      dot: 'bg-red-400'   },
  rejected:  { badge: 'bg-slate-100 text-slate-600',  dot: 'bg-slate-400' },
};

const STATUS_LABEL: Record<string, string> = {
  pending:   'Menunggu',
  active:    'Aktif',
  suspended: 'Disuspend',
  rejected:  'Ditolak',
};

const ONLINE_LABEL: Record<string, string> = {
  offline:     'Offline',
  available:   'Online',
  on_delivery: 'Antar',
};

const BTN: React.CSSProperties = {
  borderRadius: 6,
  padding: '4px 10px',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  border: 'none',
  transition: 'opacity 0.15s',
};

export function DriverRowComponent({ driver }: { driver: DriverRow }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(action: string, reason?: string) {
    setBusy(true);
    await fetch(`/api/admin/drivers/${driver.id}/verification`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    router.refresh();
    setBusy(false);
  }

  async function handleSuspend() {
    const reason = prompt('Alasan suspend:');
    if (!reason?.trim()) return;
    await patch('suspend', reason.trim());
  }

  const s = driver.verificationStatus;
  const st = STATUS_STYLE[s] ?? STATUS_STYLE.rejected;
  const shortId = driver.id.slice(0, 6).toUpperCase();

  return (
    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
      {/* ID */}
      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>
        {shortId}
      </td>

      {/* Driver name + online status */}
      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
        {driver.name ?? '—'}
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400, marginTop: 1 }}>
          {ONLINE_LABEL[driver.status] ?? driver.status}
        </div>
      </td>

      {/* Telepon (email as fallback) */}
      <td style={{ padding: '12px 16px', color: '#475569', fontSize: 12 }}>
        {driver.email}
      </td>

      {/* Kendaraan */}
      <td style={{ padding: '12px 16px', color: '#475569' }}>
        {driver.vehicle ?? '—'}
        {driver.licensePlate && (
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{driver.licensePlate}</div>
        )}
      </td>

      {/* Status */}
      <td style={{ padding: '12px 16px' }}>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${st.badge}`}
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${st.dot}`} />
          {STATUS_LABEL[s] ?? s}
        </span>
      </td>

      {/* Bergabung — no createdAt on DriverRow; show status instead */}
      <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>
        —
      </td>

      {/* Actions */}
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {s === 'pending' && (
            <button
              disabled={busy}
              onClick={() => patch('approve')}
              style={{ ...BTN, background: '#16a34a', color: '#fff' }}
            >
              Setujui
            </button>
          )}
          {s === 'suspended' && (
            <button
              disabled={busy}
              onClick={() => patch('activate')}
              style={{ ...BTN, background: 'oklch(0.52 0.18 250)', color: '#fff' }}
            >
              Aktifkan
            </button>
          )}
          <button
            disabled={busy}
            onClick={() => {}}
            style={{ ...BTN, background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}
          >
            View
          </button>
          {(s === 'pending' || s === 'active') && (
            <button
              disabled={busy}
              onClick={handleSuspend}
              style={{ ...BTN, background: '#fff', color: '#dc2626', border: '1px solid #fecaca' }}
            >
              Suspend
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
