'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Pharmacy } from '@pharmatrack/db';

const STATUS_STYLE: Record<string, { badge: string; dot: string }> = {
  pending: { badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-400' },
  active: { badge: 'bg-green-100 text-green-800', dot: 'bg-green-400' },
  suspended: { badge: 'bg-red-100 text-red-800', dot: 'bg-red-400' },
  rejected: { badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu',
  active: 'Aktif',
  suspended: 'Disuspend',
  rejected: 'Ditolak',
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

export function PharmacyRow({ pharmacy }: { pharmacy: Pharmacy }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(action: string, reason?: string) {
    setBusy(true);
    await fetch(`/api/admin/pharmacies/${pharmacy.id}/verification`, {
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

  const s = pharmacy.verificationStatus;
  const st = STATUS_STYLE[s] ?? STATUS_STYLE.rejected;
  const shortId = pharmacy.id.slice(0, 6).toUpperCase();

  return (
    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
      {/* ID */}
      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>
        {shortId}
      </td>

      {/* Apotek name */}
      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
        {pharmacy.name}
        {pharmacy.city && (
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400, marginTop: 1 }}>
            {pharmacy.city}
          </div>
        )}
      </td>

      {/* Kontak */}
      <td style={{ padding: '12px 16px', color: '#475569' }}>
        {pharmacy.picName ?? '—'}
        {pharmacy.phone && (
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{pharmacy.phone}</div>
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

      {/* Bergabung */}
      <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }} suppressHydrationWarning>
        {new Date(pharmacy.createdAt).toLocaleDateString('id-ID', {
          month: 'short',
          year: 'numeric',
        })}
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
            Edit
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
