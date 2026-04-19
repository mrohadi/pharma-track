'use client';

import { useState, useTransition } from 'react';
import {
  DriverSignupStep1Schema,
  DriverSignupStep2Schema,
  DriverSignupStep3Schema,
  DriverSignupStep4Schema,
  type DriverSignupInput,
} from '@pharmatrack/shared';

const STEPS = ['Akun', 'Data Diri', 'Kendaraan', 'Pembayaran'] as const;

type Fields = Partial<DriverSignupInput>;

export function DriverSignupForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState<Fields>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function merge(patch: Partial<Fields>) {
    setFields((prev) => ({ ...prev, ...patch }));
  }

  function handleStep1(formData: FormData) {
    setError(null);
    const data = {
      email: String(formData.get('email') ?? '').trim(),
      password: String(formData.get('password') ?? ''),
      name: String(formData.get('name') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
    };
    const res = DriverSignupStep1Schema.safeParse(data);
    if (!res.success) { setError(res.error.errors[0]?.message ?? 'Validasi gagal'); return; }
    merge(res.data);
    setStep(1);
  }

  function handleStep2(formData: FormData) {
    setError(null);
    const data = {
      nik: String(formData.get('nik') ?? '').trim(),
      province: String(formData.get('province') ?? '').trim(),
    };
    const res = DriverSignupStep2Schema.safeParse(data);
    if (!res.success) { setError(res.error.errors[0]?.message ?? 'Validasi gagal'); return; }
    merge(res.data);
    setStep(2);
  }

  function handleStep3(formData: FormData) {
    setError(null);
    const data = {
      vehicleType: String(formData.get('vehicleType') ?? ''),
      vehicleModel: String(formData.get('vehicleModel') ?? '').trim(),
      licensePlate: String(formData.get('licensePlate') ?? '').trim(),
      simClass: String(formData.get('simClass') ?? ''),
      simNumber: String(formData.get('simNumber') ?? '').trim(),
      simExpiresAt: String(formData.get('simExpiresAt') ?? '').trim(),
    };
    const res = DriverSignupStep3Schema.safeParse(data);
    if (!res.success) { setError(res.error.errors[0]?.message ?? 'Validasi gagal'); return; }
    merge(res.data);
    setStep(3);
  }

  function handleStep4(formData: FormData) {
    setError(null);
    const data = {
      payoutBank: String(formData.get('payoutBank') ?? '').trim(),
      payoutAccountNumber: String(formData.get('payoutAccountNumber') ?? '').trim(),
      payoutAccountName: String(formData.get('payoutAccountName') ?? '').trim(),
    };
    const res = DriverSignupStep4Schema.safeParse(data);
    if (!res.success) { setError(res.error.errors[0]?.message ?? 'Validasi gagal'); return; }

    const payload = { ...fields, ...res.data } as DriverSignupInput;

    startTransition(async () => {
      const response = await fetch('/api/signup/driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || json.error) {
        setError(json.error ?? 'Pendaftaran gagal');
        return;
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4 rounded-lg bg-green-50 p-6 text-center">
        <p className="font-semibold text-green-800">Pendaftaran berhasil!</p>
        <p className="text-sm text-green-700">
          Akun driver Anda sedang menunggu verifikasi admin. Anda akan dihubungi setelah akun
          disetujui. Silakan masuk setelah mendapat konfirmasi.
        </p>
        <button
          type="button"
          onClick={onSuccess}
          className="bg-brand-600 hover:bg-brand-700 rounded-md px-4 py-2 text-sm font-medium text-white"
        >
          Ke halaman masuk
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Step indicator */}
      <div className="flex items-center gap-1.5">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                i <= step ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i + 1}
            </span>
            <span className={`text-xs ${i === step ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="text-slate-300">›</span>}
          </div>
        ))}
      </div>

      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {/* Step 1 — Account */}
      {step === 0 && (
        <form action={handleStep1} className="flex flex-col gap-4">
          <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={fields.email} />
          <Field label="Kata Sandi (min. 8 karakter)" name="password" type="password" autoComplete="new-password" />
          <Field label="Nama Lengkap" name="name" defaultValue={fields.name} />
          <Field label="Nomor HP (+62 / 08…)" name="phone" defaultValue={fields.phone} />
          <Next />
        </form>
      )}

      {/* Step 2 — Personal */}
      {step === 1 && (
        <form action={handleStep2} className="flex flex-col gap-4">
          <NikField defaultValue={fields.nik} />
          <Field label="Provinsi domisili" name="province" defaultValue={fields.province} />
          <div className="flex gap-2">
            <Back onClick={() => { setError(null); setStep(0); }} />
            <Next />
          </div>
        </form>
      )}

      {/* Step 3 — Vehicle */}
      {step === 2 && (
        <form action={handleStep3} className="flex flex-col gap-4">
          <SelectField
            label="Jenis Kendaraan"
            name="vehicleType"
            defaultValue={fields.vehicleType}
            options={[
              { value: 'motorcycle', label: 'Motor' },
              { value: 'car', label: 'Mobil' },
              { value: 'bicycle', label: 'Sepeda' },
            ]}
          />
          <Field label="Model Kendaraan" name="vehicleModel" defaultValue={fields.vehicleModel} />
          <Field label="Nomor Plat" name="licensePlate" defaultValue={fields.licensePlate} />
          <SelectField
            label="Kelas SIM"
            name="simClass"
            defaultValue={fields.simClass}
            options={[
              { value: 'A', label: 'A' },
              { value: 'B1', label: 'B1' },
              { value: 'B2', label: 'B2' },
              { value: 'C', label: 'C' },
            ]}
          />
          <Field label="Nomor SIM" name="simNumber" defaultValue={fields.simNumber} />
          <Field label="Tanggal Kadaluarsa SIM" name="simExpiresAt" type="date" defaultValue={fields.simExpiresAt} />
          <div className="flex gap-2">
            <Back onClick={() => { setError(null); setStep(1); }} />
            <Next />
          </div>
        </form>
      )}

      {/* Step 4 — Payout */}
      {step === 3 && (
        <form action={handleStep4} className="flex flex-col gap-4">
          <Field label="Nama Bank" name="payoutBank" defaultValue={fields.payoutBank} />
          <Field label="Nomor Rekening" name="payoutAccountNumber" defaultValue={fields.payoutAccountNumber} />
          <Field label="Nama Pemilik Rekening" name="payoutAccountName" defaultValue={fields.payoutAccountName} />
          <div className="flex gap-2">
            <Back onClick={() => { setError(null); setStep(2); }} />
            <button
              type="submit"
              disabled={pending}
              className="bg-brand-600 hover:bg-brand-700 flex-1 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {pending ? 'Mendaftar…' : 'Daftar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────

function Field({
  label,
  name,
  type = 'text',
  autoComplete,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className="focus:border-brand-500 focus:ring-brand-500 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1"
      />
    </label>
  );
}

function NikField({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? '');
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">NIK (16 digit)</span>
      <input
        type="text"
        name="nik"
        inputMode="numeric"
        maxLength={16}
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 16))}
        placeholder="3201234567890001"
        className="focus:border-brand-500 focus:ring-brand-500 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ''}
        className="focus:border-brand-500 focus:ring-brand-500 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1"
      >
        <option value="" disabled>Pilih…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function Next() {
  return (
    <button
      type="submit"
      className="bg-brand-600 hover:bg-brand-700 rounded-md px-4 py-2 text-sm font-medium text-white"
    >
      Lanjut →
    </button>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
    >
      ← Kembali
    </button>
  );
}
