'use client';

import { useState } from 'react';

export function InviteUserButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'pharmacy' | 'driver'>('pharmacy');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<
    { ok: true; token: string } | { ok: false; error: string } | null
  >(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);

    const res = await fetch('/api/admin/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), role }),
    });

    setBusy(false);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setResult({
        ok: false,
        error: (data as { error?: string }).error ?? 'Gagal mengirim undangan',
      });
    } else {
      setResult({ ok: true, token: (data as { token: string }).token });
      setEmail('');
    }
  }

  function handleClose() {
    setOpen(false);
    setResult(null);
    setEmail('');
    setRole('pharmacy');
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: 'oklch(0.52 0.18 250)',
          color: '#fff',
          borderRadius: 8,
          padding: '9px 18px',
          fontSize: 13,
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          flexShrink: 0,
        }}
      >
        + Undang Pengguna
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 100,
            }}
          />

          {/* Modal */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              background: '#fff',
              borderRadius: 14,
              padding: 28,
              width: 380,
              maxWidth: 'calc(100vw - 32px)',
              zIndex: 101,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                Undang Pengguna
              </h2>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 18,
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>

            {result?.ok ? (
              <div>
                <div
                  style={{
                    padding: '16px',
                    background: '#f0fdf4',
                    borderRadius: 8,
                    border: '1px solid #bbf7d0',
                    marginBottom: 16,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13, color: '#166534', fontWeight: 600 }}>
                    Undangan berhasil dikirim ke email.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    background: 'oklch(0.52 0.18 250)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#475569',
                      marginBottom: 6,
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#475569',
                      marginBottom: 6,
                    }}
                  >
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'pharmacy' | 'driver')}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      background: '#fff',
                    }}
                  >
                    <option value="pharmacy">Apotek</option>
                    <option value="driver">Driver</option>
                  </select>
                </div>

                {result && !result.ok && (
                  <p style={{ margin: 0, fontSize: 12, color: '#dc2626' }}>{result.error}</p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  style={{
                    padding: '10px',
                    borderRadius: 8,
                    background: 'oklch(0.52 0.18 250)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: busy ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  {busy ? 'Mengirim…' : 'Kirim Undangan'}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </>
  );
}
