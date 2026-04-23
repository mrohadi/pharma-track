'use client';

import { useState, useTransition } from 'react';

export function SecuritySection() {
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const set = (k: keyof typeof pw) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPw((p) => ({ ...p, [k]: e.target.value }));
    setSaved(false);
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!pw.current) {
      setError('Masukkan password saat ini.');
      return;
    }
    if (pw.next.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }
    if (pw.next !== pw.confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    startTransition(async () => {
      // Password change goes through better-auth — use the change-password endpoint.
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string; message?: string };
        setError(d.message ?? d.error ?? 'Gagal memperbarui password');
        return;
      }
      setPw({ current: '', next: '', confirm: '' });
      setSaved(true);
    });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cur-pw" className="mb-1 block text-sm font-medium text-slate-700">
            🔒 Password Saat Ini
          </label>
          <input
            id="cur-pw"
            type="password"
            value={pw.current}
            onChange={set('current')}
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new-pw" className="mb-1 block text-sm font-medium text-slate-700">
              🔒 Password Baru
            </label>
            <input
              id="new-pw"
              type="password"
              value={pw.next}
              onChange={set('next')}
              placeholder="Min. 8 karakter"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="confirm-pw" className="mb-1 block text-sm font-medium text-slate-700">
              🔒 Konfirmasi Password
            </label>
            <input
              id="confirm-pw"
              type="password"
              value={pw.confirm}
              onChange={set('confirm')}
              placeholder="Ulangi"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600">Password berhasil diperbarui.</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Memperbarui…' : 'Perbarui Password'}
          </button>
        </div>
      </form>
    </section>
  );
}
