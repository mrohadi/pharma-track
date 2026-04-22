'use client';

import { useState, useTransition } from 'react';

type AddressFields = { province: string; city: string; address: string };

const PROVINCES = [
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Banten',
  'Sumatera Utara',
  'Sulawesi Selatan',
  'Bali',
  'Kalimantan Timur',
  'Yogyakarta',
];

export function AddressSection({ initial }: { initial: AddressFields }) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const setField =
    (k: keyof AddressFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setSaved(false);
    };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await fetch('/api/pharmacy/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? 'Gagal menyimpan');
        return;
      }
      setSaved(true);
    });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="province" className="mb-1 block text-sm font-medium text-slate-700">
              Provinsi
            </label>
            <select
              id="province"
              value={form.province}
              onChange={setField('province')}
              className="focus:ring-brand-500 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2"
            >
              <option value="">— Pilih provinsi —</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="city" className="mb-1 block text-sm font-medium text-slate-700">
              Kota / Kabupaten
            </label>
            <input
              id="city"
              value={form.city}
              onChange={setField('city')}
              className="focus:ring-brand-500 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className="mb-1 block text-sm font-medium text-slate-700">
              Alamat Lengkap
            </label>
            <input
              id="address"
              value={form.address}
              onChange={setField('address')}
              className="focus:ring-brand-500 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600">Alamat berhasil disimpan.</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="bg-brand-600 hover:bg-brand-700 rounded px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? 'Menyimpan…' : 'Simpan Alamat'}
          </button>
        </div>
      </form>
    </section>
  );
}
