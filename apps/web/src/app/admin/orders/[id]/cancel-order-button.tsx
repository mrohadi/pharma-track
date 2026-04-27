'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    const reason = prompt('Alasan pembatalan (opsional):');
    if (reason === null) return; // user pressed cancel on prompt

    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason.trim() || undefined }),
    });
    setBusy(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? 'Gagal membatalkan order');
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={handleCancel}
        style={{
          borderRadius: 8,
          background: '#fff',
          color: '#dc2626',
          border: '1px solid #fecaca',
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 600,
          cursor: busy ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? 'Membatalkan…' : 'Batalkan Order'}
      </button>
      {error && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{error}</p>}
    </div>
  );
}
