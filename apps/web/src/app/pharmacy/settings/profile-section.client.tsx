'use client';

import { useState, useTransition } from 'react';
import { formatNpwp } from '@pharmatrack/shared';

type ProfileFields = {
  name: string;
  picName: string;
  phone: string;
  npwp: string;
};

export function ProfileSection({ initial }: { initial: ProfileFields }) {
  const [form, setForm] = useState({ ...initial, npwp: formatNpwp(initial.npwp) });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const set = (k: keyof ProfileFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (k === 'npwp') {
      const d = e.target.value.replace(/\D/g, '').slice(0, 15);
      setForm((f) => ({ ...f, npwp: formatNpwp(d) }));
    } else {
      setForm((f) => ({ ...f, [k]: e.target.value }));
    }
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
          <Field label="Nama Apotek" id="name" value={form.name} onChange={set('name')} colSpan />
          <Field
            label="Nama PIC / Apoteker"
            id="picName"
            value={form.picName}
            onChange={set('picName')}
            colSpan
          />
          <Field
            label="No. Telepon / WhatsApp"
            id="phone"
            value={form.phone}
            onChange={set('phone')}
          />
          <Field label="NPWP" id="npwp" value={form.npwp} onChange={set('npwp')} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600">Profil berhasil disimpan.</p>}
        <div className="flex justify-end">
          <SubmitButton pending={isPending}>Simpan Perubahan</SubmitButton>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  type = 'text',
  colSpan,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  colSpan?: boolean;
}) {
  return (
    <div className={colSpan ? 'sm:col-span-2' : ''}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? 'Menyimpan…' : children}
    </button>
  );
}
