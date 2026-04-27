'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { PendingLegalDocRow } from '@pharmatrack/db';

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

export function LegalDocRow({ review }: { review: PendingLegalDocRow }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(action: 'approve' | 'reject') {
    let reason: string | undefined;
    if (action === 'reject') {
      const r = prompt('Alasan penolakan:');
      if (!r?.trim()) return;
      reason = r.trim();
    }

    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/pharmacies/${review.pharmacyId}/legal`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        auditId: review.auditId,
        ...(action === 'approve' ? review.requested : {}),
        ...(reason ? { reason } : {}),
      }),
    });
    setBusy(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? 'Gagal');
      return;
    }
    router.refresh();
  }

  return (
    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
        {review.pharmacyName}
      </td>
      <td style={{ padding: '12px 16px', color: '#475569', fontSize: 12 }}>
        {review.actorEmail ?? '—'}
      </td>
      <td style={{ padding: '12px 16px', color: '#0f172a', fontFamily: 'monospace', fontSize: 12 }}>
        {review.requested.siaNumber ?? '—'}
      </td>
      <td style={{ padding: '12px 16px', color: '#0f172a', fontFamily: 'monospace', fontSize: 12 }}>
        {review.requested.sipaNumber ?? '—'}
      </td>
      <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 12 }} suppressHydrationWarning>
        {new Date(review.requestedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </td>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              disabled={busy}
              onClick={() => patch('approve')}
              style={{ ...BTN, background: '#16a34a', color: '#fff' }}
            >
              Setujui
            </button>
            <button
              disabled={busy}
              onClick={() => patch('reject')}
              style={{ ...BTN, background: '#fff', color: '#dc2626', border: '1px solid #fecaca' }}
            >
              Tolak
            </button>
          </div>
          {error && <span style={{ fontSize: 11, color: '#dc2626' }}>{error}</span>}
        </div>
      </td>
    </tr>
  );
}
