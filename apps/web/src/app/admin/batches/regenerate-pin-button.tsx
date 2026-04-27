'use client';

import { useState, useTransition } from 'react';
import { regeneratePinAction } from './actions';

export function RegeneratePinButton({ batchId }: { batchId: string }) {
  const [pin, setPin] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setPin(null);
    setError(null);
    startTransition(async () => {
      const result = await regeneratePinAction(batchId);
      if (result.ok) {
        setPin(result.pin);
      } else {
        setError(result.reason);
      }
    });
  }

  if (pin) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 4,
            color: '#15803d',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            padding: '4px 12px',
          }}
        >
          {pin}
        </span>
        <button
          onClick={() => setPin(null)}
          style={{
            fontSize: 11,
            color: '#64748b',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontFamily: 'inherit',
          }}
        >
          Tutup
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={pending}
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#4338ca',
          background: '#eef2ff',
          border: '1px solid #c7d2fe',
          borderRadius: 6,
          padding: '4px 10px',
          cursor: pending ? 'not-allowed' : 'pointer',
          opacity: pending ? 0.6 : 1,
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        {pending ? '…' : '🔑 Tampilkan PIN'}
      </button>
      {error && <p style={{ fontSize: 11, color: '#b91c1c', marginTop: 4 }}>{error}</p>}
    </div>
  );
}
