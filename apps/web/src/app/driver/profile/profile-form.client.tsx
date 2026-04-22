'use client';

import { useTransition, useState } from 'react';
import { updateDriverProfileAction } from '../actions';
import type { Driver } from '@pharmatrack/db';

const VEHICLE_TYPE_OPTIONS = [
  { value: 'motorcycle', label: 'Sepeda Motor' },
  { value: 'car', label: 'Mobil' },
  { value: 'bicycle', label: 'Sepeda' },
] as const;

const SIM_CLASS_OPTIONS = ['A', 'B1', 'B2', 'C'] as const;

const BANK_OPTIONS = [
  'BCA', 'BNI', 'BRI', 'Mandiri', 'CIMB', 'Danamon', 'BSI', 'Permata', 'Lainnya',
];

type Props = { driver: Driver };

export function ProfileForm({ driver }: Props) {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const get = (key: string) => (fd.get(key) as string | null)?.trim() || undefined;

    startTransition(async () => {
      const result = await updateDriverProfileAction({
        vehicleType: (get('vehicleType') as Driver['vehicleType']) ?? undefined,
        vehicleModel: get('vehicleModel'),
        vehicle: get('vehicle'),
        licensePlate: get('licensePlate'),
        simClass: (get('simClass') as Driver['simClass']) ?? undefined,
        simNumber: get('simNumber'),
        simExpiresAt: get('simExpiresAt'),
        payoutBank: get('payoutBank'),
        payoutAccountNumber: get('payoutAccountNumber'),
        payoutAccountName: get('payoutAccountName'),
      });
      if (result.ok) {
        setSuccess(true);
      } else {
        setError(result.reason);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Kendaraan */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Kendaraan</h2>
        <div className="space-y-3">
          <Field label="Tipe Kendaraan">
            <select
              name="vehicleType"
              defaultValue={driver.vehicleType ?? ''}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Pilih —</option>
              {VEHICLE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Model Kendaraan">
            <input name="vehicleModel" defaultValue={driver.vehicleModel ?? ''} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Honda Vario 125" />
          </Field>
          <Field label="Merek / Deskripsi">
            <input name="vehicle" defaultValue={driver.vehicle ?? ''} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Honda" />
          </Field>
          <Field label="Plat Nomor">
            <input name="licensePlate" defaultValue={driver.licensePlate ?? ''} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="B 1234 ABC" />
          </Field>
        </div>
      </section>

      {/* SIM */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">SIM</h2>
        <div className="space-y-3">
          <Field label="Kelas SIM">
            <select name="simClass" defaultValue={driver.simClass ?? ''} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Pilih —</option>
              {SIM_CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Nomor SIM">
            <input name="simNumber" defaultValue={driver.simNumber ?? ''} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </Field>
          <Field label="Berlaku Hingga">
            <input type="date" name="simExpiresAt" defaultValue={driver.simExpiresAt ?? ''} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </Field>
        </div>
      </section>

      {/* Rekening Payout */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Rekening Payout</h2>
        <div className="space-y-3">
          <Field label="Bank">
            <select name="payoutBank" defaultValue={driver.payoutBank ?? ''} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Pilih —</option>
              {BANK_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Nomor Rekening">
            <input name="payoutAccountNumber" defaultValue={driver.payoutAccountNumber ?? ''} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" inputMode="numeric" />
          </Field>
          <Field label="Atas Nama">
            <input name="payoutAccountName" defaultValue={driver.payoutAccountName ?? ''} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </Field>
        </div>
      </section>

      {success && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          Profil berhasil disimpan.
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {pending ? 'Menyimpan…' : 'Simpan Perubahan'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      {children}
    </div>
  );
}
