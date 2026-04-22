'use client';

import { useState, useTransition } from 'react';

type LegalFields = { siaNumber: string; sipaNumber: string };

export function LegalSection({ initial }: { initial: LegalFields }) {
  const [form, setForm] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const set = (k: keyof LegalFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSubmitted(false);
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitted(false);
    startTransition(async () => {
      const res = await fetch('/api/pharmacy/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? 'Gagal mengajukan pembaruan');
        return;
      }
      setSubmitted(true);
    });
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sia" className="mb-1 block text-sm font-medium text-slate-700">
              No. SIA (Surat Izin Apotek)
            </label>
            <input
              id="sia"
              value={form.siaNumber}
              onChange={set('siaNumber')}
              className="focus:ring-brand-500 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="sipa" className="mb-1 block text-sm font-medium text-slate-700">
              No. SIPA (Izin Praktik Apoteker)
            </label>
            <input
              id="sipa"
              value={form.sipaNumber}
              onChange={set('sipaNumber')}
              className="focus:ring-brand-500 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2"
            />
          </div>
        </div>

        <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠️ Perubahan dokumen legalitas memerlukan verifikasi ulang oleh admin (1×24 jam).
        </div>

        {submitted && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Permintaan pembaruan terkirim. Status: <strong>Menunggu verifikasi admin</strong>.
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="bg-brand-600 hover:bg-brand-700 rounded px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? 'Mengajukan…' : 'Ajukan Pembaruan'}
          </button>
        </div>
      </form>
    </section>
  );
}
