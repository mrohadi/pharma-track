'use client';

import { useState, useTransition } from 'react';
import {
  PharmacySignupStep1Schema,
  PharmacySignupStep2Schema,
  PharmacySignupStep3Schema,
  type PharmacySignupInput,
  formatNpwp,
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

const STEPS = ['Akun', 'Data Apotek', 'Konfirmasi'] as const;

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
          Akun apotek Anda sedang menunggu verifikasi admin dalam 1×24 jam.
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
          📋 Daftarkan apotek Anda. Pendaftaran akan diverifikasi oleh admin dalam 1×24 jam.
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
            label="Nama PIC / Apoteker *"
            name="picName"
            placeholder="dr. Siti Rahayu, S.Farm"
            icon="👤"
            defaultValue={fields.picName}
          />
          <AuthField
            label="Email *"
            name="email"
            type="email"
            placeholder="apotek@example.co.id"
            icon="✉️"
            autoComplete="email"
            defaultValue={fields.email}
          />
          <AuthField
            label="No. Telepon / WhatsApp *"
            name="phone"
            placeholder="+62 812 3456 7890"
            icon="📱"
            defaultValue={fields.phone}
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
          <AuthField
            label="Nama Apotek *"
            name="pharmacyName"
            placeholder="Apotek Sehat Sejahtera"
            icon="🏥"
            defaultValue={fields.pharmacyName}
          />
          <AuthField
            label="Telepon Apotek *"
            name="pharmacyPhone"
            placeholder="+62 21 1234 5678"
            icon="📱"
            defaultValue={fields.pharmacyPhone}
          />
          <PTSelect
            label="Provinsi *"
            name="province"
            defaultValue={fields.province ?? 'DKI Jakarta'}
            options={ID_PROVINCES.map((p) => ({ value: p, label: p }))}
          />
          <AuthField
            label="Kota / Kabupaten *"
            name="city"
            placeholder="Jakarta Selatan"
            defaultValue={fields.city}
          />
          <AuthField
            label="Alamat Lengkap *"
            name="pharmacyAddress"
            placeholder="Jl. Sudirman No. 12, RT 03/RW 05"
            icon="📍"
            defaultValue={fields.pharmacyAddress}
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
          <NpwpField defaultValue={fields.npwp} />
          <AuthField
            label="No. SIA (opsional)"
            name="siaNumber"
            placeholder="SIA/123/IV/2025"
            icon="📄"
            defaultValue={fields.siaNumber}
          />
          <AuthField
            label="No. SIPA (opsional)"
            name="sipaNumber"
            placeholder="SIPA-JKT/0001/2024"
            icon="📄"
            defaultValue={fields.sipaNumber}
          />

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
              { l: 'Nama PIC', v: fields.picName },
              { l: 'Email', v: fields.email },
              { l: 'Apotek', v: fields.pharmacyName },
              { l: 'Provinsi', v: fields.province },
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
                setStep(1);
              }}
            >
              ← Kembali
            </GhostButton>
            <PrimaryButton pending={pending}>
              {pending ? 'Mendaftar…' : 'Daftarkan Apotek ✓'}
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

function NpwpField({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: PT.text }}>NPWP Apotek</span>
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
          name="npwp"
          value={value}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, '').slice(0, 15);
            setValue(formatNpwp(d));
          }}
          placeholder="12.345.678.9-012.345"
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
