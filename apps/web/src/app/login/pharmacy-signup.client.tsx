'use client';

import { useState, useTransition } from 'react';
import {
  PharmacySignupStep1Schema,
  PharmacySignupStep2Schema,
  PharmacySignupStep3Schema,
  type PharmacySignupInput,
  formatNpwp,
} from '@pharmatrack/shared';

const STEPS = ['Akun', 'Info Apotek', 'Dokumen KYC'] as const;

type Fields = Partial<PharmacySignupInput>;

export function PharmacySignupForm({ onSuccess }: { onSuccess: () => void }) {
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
      picName: String(formData.get('picName') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
    };
    const res = PharmacySignupStep1Schema.safeParse(data);
    if (!res.success) {
      setError(res.error.errors[0]?.message ?? 'Validasi gagal');
      return;
    }
    merge(res.data);
    setStep(1);
  }

  function handleStep2(formData: FormData) {
    setError(null);
    const data = {
      pharmacyName: String(formData.get('pharmacyName') ?? '').trim(),
      pharmacyAddress: String(formData.get('pharmacyAddress') ?? '').trim(),
      pharmacyPhone: String(formData.get('pharmacyPhone') ?? '').trim(),
      province: String(formData.get('province') ?? '').trim(),
      city: String(formData.get('city') ?? '').trim(),
    };
    const res = PharmacySignupStep2Schema.safeParse(data);
    if (!res.success) {
      setError(res.error.errors[0]?.message ?? 'Validasi gagal');
      return;
    }
    merge(res.data);
    setStep(2);
  }

  function handleStep3(formData: FormData) {
    setError(null);
    const rawNpwp = String(formData.get('npwp') ?? '').trim();
    const data = {
      npwp: rawNpwp,
      siaNumber: String(formData.get('siaNumber') ?? '').trim() || undefined,
      sipaNumber: String(formData.get('sipaNumber') ?? '').trim() || undefined,
    };
    const res = PharmacySignupStep3Schema.safeParse(data);
    if (!res.success) {
      setError(res.error.errors[0]?.message ?? 'Validasi gagal');
      return;
    }

    const payload = { ...fields, ...res.data } as PharmacySignupInput;

    startTransition(async () => {
      const response = await fetch('/api/signup/pharmacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await response.json()) as { success?: boolean; error?: string };
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
          Akun apotek Anda sedang menunggu verifikasi admin. Anda akan dihubungi setelah akun
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
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                i <= step ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`text-xs ${i === step ? 'font-semibold text-slate-800' : 'text-slate-400'}`}
            >
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
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={fields.email}
          />
          <Field
            label="Kata Sandi (min. 8 karakter)"
            name="password"
            type="password"
            autoComplete="new-password"
          />
          <Field label="Nama PIC (penanggung jawab)" name="picName" defaultValue={fields.picName} />
          <Field label="Nomor HP (+62 / 08…)" name="phone" defaultValue={fields.phone} />
          <Next />
        </form>
      )}

      {/* Step 2 — Pharmacy info */}
      {step === 1 && (
        <form action={handleStep2} className="flex flex-col gap-4">
          <Field label="Nama Apotek" name="pharmacyName" defaultValue={fields.pharmacyName} />
          <Field
            label="Alamat Apotek"
            name="pharmacyAddress"
            defaultValue={fields.pharmacyAddress}
          />
          <Field
            label="Telepon Apotek (+62 / 08…)"
            name="pharmacyPhone"
            defaultValue={fields.pharmacyPhone}
          />
          <Field label="Provinsi" name="province" defaultValue={fields.province} />
          <Field label="Kota / Kabupaten" name="city" defaultValue={fields.city} />
          <div className="flex gap-2">
            <Back
              onClick={() => {
                setError(null);
                setStep(0);
              }}
            />
            <Next />
          </div>
        </form>
      )}

      {/* Step 3 — KYC */}
      {step === 2 && (
        <form action={handleStep3} className="flex flex-col gap-4">
          <NpwpField defaultValue={fields.npwp} />
          <Field label="Nomor SIA (opsional)" name="siaNumber" defaultValue={fields.siaNumber} />
          <Field label="Nomor SIPA (opsional)" name="sipaNumber" defaultValue={fields.sipaNumber} />
          <div className="flex gap-2">
            <Back
              onClick={() => {
                setError(null);
                setStep(1);
              }}
            />
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

function NpwpField({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? '');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 15);
    setValue(formatNpwp(digits));
  }

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">NPWP (##.###.###.#-###.###)</span>
      <input
        type="text"
        name="npwp"
        value={value}
        onChange={handleChange}
        placeholder="12.345.678.9-012.345"
        className="focus:border-brand-500 focus:ring-brand-500 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1"
      />
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
