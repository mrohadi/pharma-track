'use client';

import { useState, useTransition } from 'react';
import {
  DriverSignupStep1Schema,
  DriverSignupStep2Schema,
  DriverSignupStep3Schema,
  DriverSignupStep4Schema,
  type DriverSignupInput,
} from '@pharmatrack/shared';
import { PT, AuthField, PrimaryButton, GhostButton } from './auth-form.client';

const ID_PROVINCES = [
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

const ID_BANKS = [
  'BCA',
  'BRI',
  'BNI',
  'Mandiri',
  'BSI',
  'CIMB Niaga',
  'Danamon',
  'Permata',
  'GoPay',
  'OVO',
  'Dana',
  'ShopeePay',
];

const STEPS = ['Akun', 'Data Diri', 'Kendaraan', 'Rekening'] as const;

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
      nik: String(formData.get('nik') ?? '').trim(),
      province: String(formData.get('province') ?? '').trim(),
    };
    const res = DriverSignupStep2Schema.safeParse(data);
    if (!res.success) {
      setError(res.error.errors[0]?.message ?? 'Validasi gagal');
      return;
    }
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
    if (!res.success) {
      setError(res.error.errors[0]?.message ?? 'Validasi gagal');
      return;
    }
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
    if (!res.success) {
      setError(res.error.errors[0]?.message ?? 'Validasi gagal');
      return;
    }

    const payload = { ...fields, ...res.data } as DriverSignupInput;
    startTransition(async () => {
      const response = await fetch('/api/signup/driver', {
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: PT.successLight,
          borderRadius: 12,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 32 }}>✅</div>
        <p style={{ fontWeight: 700, color: PT.success, margin: 0 }}>Pendaftaran berhasil!</p>
        <p style={{ fontSize: 13, color: PT.success, margin: 0, opacity: 0.8 }}>
          Akun driver Anda sedang diverifikasi. Anda akan dihubungi setelah disetujui.
        </p>
        <PrimaryButton onClick={onSuccess}>Ke halaman masuk</PrimaryButton>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <StepIndicator steps={STEPS} current={step} />

      {step === 0 && (
        <div
          style={{
            padding: '10px 14px',
            background: PT.primaryLight,
            borderRadius: 10,
            fontSize: 12.5,
            color: PT.primaryText,
            fontWeight: 500,
          }}
        >
          🚴 Daftar sebagai mitra pengemudi. Verifikasi dokumen diperlukan sebelum mulai bertugas.
        </div>
      )}
      {step === 3 && (
        <div
          style={{
            padding: '10px 14px',
            background: PT.successLight,
            borderRadius: 10,
            fontSize: 12.5,
            color: PT.success,
            fontWeight: 500,
          }}
        >
          💰 Data rekening digunakan untuk pencairan penghasilan harian Anda.
        </div>
      )}

      {error && (
        <p
          style={{
            background: PT.dangerLight,
            color: PT.danger,
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 13,
            margin: 0,
          }}
        >
          {error}
        </p>
      )}

      {step === 0 && (
        <form action={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <AuthField
            label="Nama Lengkap (sesuai KTP) *"
            name="name"
            placeholder="Budi Santoso"
            icon="👤"
            defaultValue={fields.name}
          />
          <AuthField
            label="No. Telepon / WhatsApp *"
            name="phone"
            placeholder="+62 812 3456 7890"
            icon="📱"
            defaultValue={fields.phone}
          />
          <AuthField
            label="Email"
            name="email"
            type="email"
            placeholder="budi@example.com"
            icon="✉️"
            autoComplete="email"
            defaultValue={fields.email}
          />
          <AuthField
            label="Password *"
            name="password"
            type="password"
            placeholder="Min. 8 karakter"
            icon="🔒"
            autoComplete="new-password"
          />
          <PrimaryButton>Lanjut →</PrimaryButton>
        </form>
      )}

      {step === 1 && (
        <form action={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <NikField defaultValue={fields.nik} />
          <PTSelect
            label="Domisili / Provinsi *"
            name="province"
            defaultValue={fields.province ?? 'DKI Jakarta'}
            options={ID_PROVINCES.map((p) => ({ value: p, label: p }))}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <GhostButton
              onClick={() => {
                setError(null);
                setStep(0);
              }}
            >
              ← Kembali
            </GhostButton>
            <PrimaryButton>Lanjut →</PrimaryButton>
          </div>
        </form>
      )}

      {step === 2 && (
        <form action={handleStep3} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: PT.text, marginBottom: 8 }}>
              Jenis Kendaraan *
            </div>
            <VehicleTypeField defaultValue={fields.vehicleType} />
          </div>
          <AuthField
            label="Merek & Tipe Kendaraan *"
            name="vehicleModel"
            placeholder="Honda Beat 2023"
            icon="🏍️"
            defaultValue={fields.vehicleModel}
          />
          <AuthField
            label="Nomor Polisi *"
            name="licensePlate"
            placeholder="B 1234 XYZ"
            icon="🔖"
            defaultValue={fields.licensePlate}
          />
          <SimClassField defaultValue={fields.simClass} />
          <AuthField
            label="Nomor SIM *"
            name="simNumber"
            placeholder="1234567890123456"
            icon="📄"
            defaultValue={fields.simNumber}
          />
          <AuthField
            label="Masa Berlaku SIM *"
            name="simExpiresAt"
            type="date"
            defaultValue={fields.simExpiresAt}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <GhostButton
              onClick={() => {
                setError(null);
                setStep(1);
              }}
            >
              ← Kembali
            </GhostButton>
            <PrimaryButton>Lanjut →</PrimaryButton>
          </div>
        </form>
      )}

      {step === 3 && (
        <form action={handleStep4} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <PTSelect
            label="Bank / E-Wallet *"
            name="payoutBank"
            defaultValue={fields.payoutBank ?? 'BCA'}
            options={ID_BANKS.map((b) => ({ value: b, label: b }))}
          />
          <AuthField
            label="Nomor Rekening *"
            name="payoutAccountNumber"
            placeholder="1234567890"
            icon="🏦"
            defaultValue={fields.payoutAccountNumber}
          />
          <AuthField
            label="Nama Pemilik Rekening *"
            name="payoutAccountName"
            placeholder="BUDI SANTOSO"
            icon="👤"
            defaultValue={fields.payoutAccountName}
          />

          <div
            style={{
              padding: '10px 14px',
              background: PT.bg,
              borderRadius: 10,
              border: `1px solid ${PT.border}`,
              fontSize: 12,
              color: PT.muted,
              lineHeight: 1.6,
            }}
          >
            ⚠️ Pastikan nama pemilik rekening sesuai dengan nama di KTP. Rekening yang tidak sesuai
            dapat menghambat pencairan.
          </div>

          {/* Summary */}
          <div
            style={{
              padding: '12px 14px',
              background: PT.bg,
              borderRadius: 10,
              border: `1px solid ${PT.border}`,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: PT.text, marginBottom: 8 }}>
              Ringkasan Pendaftaran
            </div>
            {[
              { l: 'Nama', v: fields.name },
              { l: 'NIK', v: fields.nik },
              { l: 'Kendaraan', v: fields.vehicleModel },
              { l: 'Nopol', v: fields.licensePlate },
            ].map((r) => (
              <div
                key={r.l}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  padding: '4px 0',
                  borderBottom: `1px solid ${PT.border}`,
                }}
              >
                <span style={{ color: PT.muted }}>{r.l}</span>
                <span style={{ fontWeight: 600, color: PT.text }}>{r.v ?? '—'}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <GhostButton
              onClick={() => {
                setError(null);
                setStep(2);
              }}
            >
              ← Kembali
            </GhostButton>
            <PrimaryButton pending={pending}>
              {pending ? 'Mendaftar…' : 'Daftar Sekarang ✓'}
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function StepIndicator({ steps, current }: { steps: readonly string[]; current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
                transition: 'all 0.2s',
                background: i < current ? PT.success : i === current ? PT.primary : PT.border,
                color: i <= current ? '#fff' : PT.muted,
              }}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: i === current ? 700 : 500,
                color: i === current ? PT.primary : PT.muted,
                whiteSpace: 'nowrap',
              }}
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                flex: 1,
                height: 2,
                background: i < current ? PT.success : PT.border,
                margin: '0 6px',
                marginBottom: 16,
                transition: 'background 0.3s',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function NikField({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: PT.text }}>NIK (16 digit) *</span>
      <div style={{ position: 'relative' }}>
        <span
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 14,
            pointerEvents: 'none',
          }}
        >
          🪪
        </span>
        <input
          type="text"
          name="nik"
          inputMode="numeric"
          maxLength={16}
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 16))}
          placeholder="3271012345670001"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: `1.5px solid ${PT.border}`,
            borderRadius: 10,
            background: '#fff',
            padding: '10px 12px 10px 36px',
            fontSize: 13.5,
            color: PT.text,
            outline: 'none',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = PT.primary;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${PT.primaryLight}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = PT.border;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );
}

function VehicleTypeField({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? 'motorcycle');
  return (
    <>
      <input type="hidden" name="vehicleType" value={value} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { v: 'motorcycle', icon: '🏍️', label: 'Motor' },
          { v: 'car', icon: '🚗', label: 'Mobil' },
        ].map((j) => (
          <div
            key={j.v}
            onClick={() => setValue(j.v)}
            style={{
              padding: 12,
              borderRadius: 10,
              border: `2px solid ${value === j.v ? PT.primary : PT.border}`,
              textAlign: 'center',
              cursor: 'pointer',
              background: value === j.v ? PT.primaryLight : '#fff',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 4 }}>{j.icon}</div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: value === j.v ? PT.primaryText : PT.text,
              }}
            >
              {j.label}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SimClassField({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? 'C');
  return (
    <>
      <input type="hidden" name="simClass" value={value} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: PT.text, marginBottom: 8 }}>
          Golongan SIM *
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['C', 'A', 'B1'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue(s)}
              style={{
                padding: '8px 18px',
                borderRadius: 9,
                border: `2px solid ${value === s ? PT.primary : PT.border}`,
                background: value === s ? PT.primaryLight : '#fff',
                color: value === s ? PT.primaryText : PT.text,
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              SIM {s}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function PTSelect({
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: PT.text }}>{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        style={{
          border: `1.5px solid ${PT.border}`,
          borderRadius: 10,
          background: '#fff',
          padding: '10px 12px',
          fontSize: 13.5,
          color: PT.text,
          outline: 'none',
          fontFamily: 'inherit',
          appearance: 'auto',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
