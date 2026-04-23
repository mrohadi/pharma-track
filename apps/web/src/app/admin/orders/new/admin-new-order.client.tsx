'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PT = {
  primary: 'oklch(0.52 0.18 250)',
  primaryLight: 'oklch(0.94 0.04 250)',
  text: 'oklch(0.18 0.02 250)',
  muted: 'oklch(0.58 0.03 250)',
  border: 'oklch(0.92 0.012 250)',
  bg: 'oklch(0.97 0.008 250)',
  card: '#ffffff',
  danger: 'oklch(0.55 0.2 25)',
  dangerLight: 'oklch(0.95 0.05 25)',
  success: 'oklch(0.52 0.15 145)',
};

type Item = { name: string; quantity: number; unitPriceCents?: number };

type FormState = {
  patientName: string;
  patientPhone: string;
  deliveryAddress: string;
  items: Item[];
  priority: 'normal' | 'express';
  paymentMode: 'cod' | 'prepaid';
  notes: string;
};

const INITIAL: FormState = {
  patientName: '',
  patientPhone: '',
  deliveryAddress: '',
  items: [{ name: '', quantity: 1, unitPriceCents: undefined }],
  priority: 'normal',
  paymentMode: 'cod',
  notes: '',
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: PT.muted,
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: 12, color: PT.danger, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: '100%',
  borderRadius: 8,
  border: `1px solid ${hasError ? PT.danger : PT.border}`,
  padding: '9px 12px',
  fontSize: 13.5,
  fontFamily: 'inherit',
  color: PT.text,
  background: PT.card,
  outline: 'none',
  boxSizing: 'border-box',
});

export function AdminNewOrderClient() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateItem(idx: number, patch: Partial<Item>) {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));
  }

  function addItem() {
    setForm((f) => ({
      ...f,
      items: [...f.items, { name: '', quantity: 1, unitPriceCents: undefined }],
    }));
  }

  function removeItem(idx: number) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.patientName.trim()) errs.patientName = 'Nama pasien wajib diisi';
    if (!form.patientPhone.trim()) errs.patientPhone = 'Nomor kontak wajib diisi';
    if (!form.deliveryAddress.trim()) errs.deliveryAddress = 'Alamat pengiriman wajib diisi';
    if (form.items.length === 0) errs.items = 'Minimal 1 item obat';
    form.items.forEach((it, i) => {
      if (!it.name.trim()) errs[`item_${i}_name`] = 'Nama obat wajib diisi';
      if (it.quantity < 1) errs[`item_${i}_qty`] = 'Jumlah minimal 1';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setSubmitError(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? `Server error ${res.status}`);
        }
        router.push('/admin/orders');
        router.refresh();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
      }
    });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-7">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: PT.text, margin: 0 }}>
            Buat Order Baru
          </h1>
          <p style={{ fontSize: 13, color: PT.muted, marginTop: 4 }}>
            Buat order pengiriman manual
          </p>
        </div>
        <Link
          href="/admin/orders"
          style={{
            borderRadius: 8,
            border: `1px solid ${PT.border}`,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            color: PT.muted,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          ← Kembali
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        {/* Left: form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Patient info */}
          <div
            style={{
              background: PT.card,
              borderRadius: 14,
              padding: 20,
              border: `1px solid ${PT.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: PT.text, marginBottom: 16 }}>
              Data Pasien
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Nama Lengkap *" error={errors.patientName}>
                <input
                  style={inputStyle(!!errors.patientName)}
                  value={form.patientName}
                  onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
                  placeholder="Nama pasien"
                />
              </Field>
              <Field label="Nomor Kontak *" error={errors.patientPhone}>
                <input
                  style={inputStyle(!!errors.patientPhone)}
                  value={form.patientPhone}
                  onChange={(e) => setForm((f) => ({ ...f, patientPhone: e.target.value }))}
                  placeholder="+62..."
                />
              </Field>
              <Field label="Alamat Pengiriman *" error={errors.deliveryAddress}>
                <textarea
                  style={{
                    ...inputStyle(!!errors.deliveryAddress),
                    resize: 'vertical',
                    minHeight: 80,
                  }}
                  value={form.deliveryAddress}
                  onChange={(e) => setForm((f) => ({ ...f, deliveryAddress: e.target.value }))}
                  placeholder="Alamat lengkap"
                />
              </Field>
            </div>
          </div>

          {/* Items */}
          <div
            style={{
              background: PT.card,
              borderRadius: 14,
              padding: 20,
              border: `1px solid ${PT.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: PT.text }}>Obat-obatan</div>
              <button
                type="button"
                onClick={addItem}
                style={{
                  background: PT.primaryLight,
                  color: PT.primary,
                  border: 'none',
                  borderRadius: 7,
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                + Tambah
              </button>
            </div>
            {errors.items && (
              <p style={{ fontSize: 12, color: PT.danger, marginBottom: 10 }}>{errors.items}</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {form.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: PT.bg,
                    border: `1px solid ${PT.border}`,
                  }}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_80px_120px_32px]">
                    <Field label="Nama Obat *" error={errors[`item_${idx}_name`]}>
                      <input
                        style={inputStyle(!!errors[`item_${idx}_name`])}
                        value={item.name}
                        onChange={(e) => updateItem(idx, { name: e.target.value })}
                        placeholder="Nama obat"
                      />
                    </Field>
                    <Field label="Qty *" error={errors[`item_${idx}_qty`]}>
                      <input
                        type="number"
                        min={1}
                        style={inputStyle(!!errors[`item_${idx}_qty`])}
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                      />
                    </Field>
                    <Field label="Harga (opsional)">
                      <input
                        type="number"
                        min={0}
                        style={inputStyle()}
                        value={item.unitPriceCents ?? ''}
                        onChange={(e) =>
                          updateItem(idx, {
                            unitPriceCents: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="Rp"
                      />
                    </Field>
                    {form.items.length > 1 && (
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          style={{
                            background: PT.dangerLight,
                            color: PT.danger,
                            border: 'none',
                            borderRadius: 7,
                            width: 32,
                            height: 36,
                            cursor: 'pointer',
                            fontSize: 16,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'inherit',
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div
            style={{
              background: PT.card,
              borderRadius: 14,
              padding: 20,
              border: `1px solid ${PT.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: PT.text, marginBottom: 16 }}>
              Catatan
            </div>
            <textarea
              style={{ ...inputStyle(), resize: 'vertical', minHeight: 80 }}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Instruksi khusus (opsional)"
            />
          </div>
        </div>

        {/* Right: options + submit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Delivery options */}
          <div
            style={{
              background: PT.card,
              borderRadius: 14,
              padding: 20,
              border: `1px solid ${PT.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: PT.text, marginBottom: 16 }}>
              Opsi Pengiriman
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Prioritas">
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['normal', 'express'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, priority: p }))}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: 8,
                        border: `1px solid ${form.priority === p ? PT.primary : PT.border}`,
                        background: form.priority === p ? PT.primaryLight : PT.card,
                        color: form.priority === p ? PT.primary : PT.muted,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {p === 'normal' ? '🚴 Normal' : '⚡ Express'}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Pembayaran">
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['cod', 'prepaid'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, paymentMode: m }))}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: 8,
                        border: `1px solid ${form.paymentMode === m ? PT.primary : PT.border}`,
                        background: form.paymentMode === m ? PT.primaryLight : PT.card,
                        color: form.paymentMode === m ? PT.primary : PT.muted,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {m === 'cod' ? '💵 COD' : '💳 Prepaid'}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {/* Submit */}
          <div
            style={{
              background: PT.card,
              borderRadius: 14,
              padding: 20,
              border: `1px solid ${PT.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            {submitError && (
              <div
                style={{
                  background: PT.dangerLight,
                  color: PT.danger,
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                {submitError}
              </div>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              style={{
                width: '100%',
                background: isPending ? PT.muted : PT.primary,
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '12px 0',
                fontSize: 14,
                fontWeight: 700,
                cursor: isPending ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.2s',
              }}
            >
              {isPending ? 'Menyimpan…' : '✓ Kirim Order'}
            </button>
            <p style={{ fontSize: 12, color: PT.muted, marginTop: 10, textAlign: 'center' }}>
              Order akan masuk ke antrian pengiriman
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
