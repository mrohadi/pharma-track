'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  OrderWizardStep1Schema,
  OrderWizardStep2Schema,
  OrderWizardStep3Schema,
  OrderWizardStep4Schema,
  type OrderWizardInput,
} from '@pharmatrack/shared';
import type { z } from 'zod';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step1 = z.infer<typeof OrderWizardStep1Schema>;
type Step2 = z.infer<typeof OrderWizardStep2Schema>;
type Step3 = z.infer<typeof OrderWizardStep3Schema>;
type Step4 = z.infer<typeof OrderWizardStep4Schema>;

type WizardState = Step1 & Step2 & Step3 & Step4;

const STORAGE_KEY = 'pharmatrack_order_wizard';
const STEP_COUNT = 4;

const INITIAL_STATE: WizardState = {
  patientName: '',
  patientPhone: '',
  deliveryAddress: '',
  items: [{ name: '', quantity: 1, unitPriceCents: undefined }],
  priority: 'normal',
  paymentMode: 'cod',
  notes: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFieldErrors(schema: z.ZodTypeAny, data: unknown): Record<string, string> {
  const result = schema.safeParse(data);
  if (result.success) return {};
  const flat = result.error.flatten() as {
    fieldErrors: Record<string, string[] | undefined>;
  };
  const out: Record<string, string> = {};
  for (const [k, msgs] of Object.entries(flat.fieldErrors)) {
    if (msgs?.[0]) out[k] = msgs[0];
  }
  return out;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const { error, className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full rounded border px-3 py-2 text-sm ${
        error ? 'border-red-400 focus:ring-red-300' : 'focus:ring-brand-300 border-slate-300'
      } focus:outline-none focus:ring-2 ${className ?? ''}`}
    />
  );
}

// ─── Step components ──────────────────────────────────────────────────────────

function Step1Patient({
  state,
  onChange,
  errors,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Langkah 1 — Data Pasien</h2>
      <Field label="Nama Pasien *" error={errors.patientName}>
        <Input
          value={state.patientName}
          onChange={(e) => onChange({ patientName: e.target.value })}
          placeholder="Budi Santoso"
          error={errors.patientName}
        />
      </Field>
      <Field label="Nomor Telepon *" error={errors.patientPhone}>
        <Input
          value={state.patientPhone}
          onChange={(e) => onChange({ patientPhone: e.target.value })}
          placeholder="08123456789"
          error={errors.patientPhone}
        />
      </Field>
      <Field label="Alamat Pengiriman (opsional)" error={errors.deliveryAddress}>
        <textarea
          value={state.deliveryAddress ?? ''}
          onChange={(e) => onChange({ deliveryAddress: e.target.value })}
          placeholder="Jl. Contoh No. 1, Kelurahan…"
          rows={3}
          className="focus:ring-brand-300 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
        />
        <p className="text-xs text-slate-500">
          Jika kosong, WhatsApp otomatis akan dikirim ke pasien untuk mengisi alamat.
        </p>
      </Field>
    </div>
  );
}

function Step2Items({
  state,
  onChange,
  errors,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  errors: Record<string, string>;
}) {
  function updateItem(idx: number, patch: Partial<WizardState['items'][number]>) {
    const updated = state.items.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    onChange({ items: updated });
  }

  function addItem() {
    onChange({ items: [...state.items, { name: '', quantity: 1, unitPriceCents: undefined }] });
  }

  function removeItem(idx: number) {
    onChange({ items: state.items.filter((_, i) => i !== idx) });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Langkah 2 — Daftar Obat</h2>
      {errors.items && <p className="text-xs text-red-600">{errors.items}</p>}

      {state.items.map((item, idx) => (
        <div key={idx} className="space-y-3 rounded border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Obat #{idx + 1}</span>
            {state.items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Hapus
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Nama Obat *"
              error={(errors as Record<string, string>)[`items.${idx}.name`]}
            >
              <Input
                value={item.name}
                onChange={(e) => updateItem(idx, { name: e.target.value })}
                placeholder="Amoxicillin 500mg"
                error={(errors as Record<string, string>)[`items.${idx}.name`]}
              />
            </Field>
            <Field
              label="Jumlah *"
              error={(errors as Record<string, string>)[`items.${idx}.quantity`]}
            >
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                error={(errors as Record<string, string>)[`items.${idx}.quantity`]}
              />
            </Field>
          </div>
          <Field label="Harga Satuan (Rp, opsional)">
            <Input
              type="number"
              min={0}
              value={item.unitPriceCents !== undefined ? item.unitPriceCents / 100 : ''}
              onChange={(e) =>
                updateItem(idx, {
                  unitPriceCents: e.target.value
                    ? Math.round(Number(e.target.value) * 100)
                    : undefined,
                })
              }
              placeholder="0"
            />
          </Field>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="hover:border-brand-500 hover:text-brand-700 flex items-center gap-1 rounded border border-dashed border-slate-400 px-3 py-2 text-sm text-slate-600"
      >
        + Tambah Obat
      </button>
    </div>
  );
}

function Step3Options({
  state,
  onChange,
  errors,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Langkah 3 — Prioritas & Pembayaran</h2>

      <Field label="Prioritas" error={errors.priority}>
        <div className="flex gap-3">
          {(['normal', 'urgent'] as const).map((p) => (
            <label key={p} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="priority"
                value={p}
                checked={state.priority === p}
                onChange={() => onChange({ priority: p })}
                className="accent-brand-600"
              />
              <span className="text-sm capitalize">{p === 'urgent' ? 'Urgent 🔴' : 'Normal'}</span>
            </label>
          ))}
        </div>
      </Field>

      <Field label="Metode Pembayaran" error={errors.paymentMode}>
        <select
          value={state.paymentMode}
          onChange={(e) => onChange({ paymentMode: e.target.value as Step3['paymentMode'] })}
          className="focus:ring-brand-300 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
        >
          <option value="cod">COD (Bayar di Tempat)</option>
          <option value="prepaid">Prepaid (Sudah Lunas)</option>
          <option value="insurance">Asuransi</option>
        </select>
      </Field>
    </div>
  );
}

function Step4Review({
  state,
  onChange,
  errors,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Langkah 4 — Konfirmasi & Catatan</h2>

      <div className="space-y-2 rounded border border-slate-200 bg-slate-50 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Pasien</span>
          <span className="font-medium">{state.patientName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Telepon</span>
          <span className="font-mono">{state.patientPhone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Alamat</span>
          <span className="max-w-[60%] text-right">
            {state.deliveryAddress || <em className="text-slate-400">Akan diminta via WhatsApp</em>}
          </span>
        </div>
        <div className="border-t border-slate-200 pt-2">
          <span className="text-slate-500">Obat</span>
          <ul className="mt-1 space-y-1 pl-3">
            {state.items.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>{item.name}</span>
                <span className="text-slate-600">× {item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2">
          <span className="text-slate-500">Prioritas</span>
          <span className={state.priority === 'urgent' ? 'font-semibold text-red-600' : ''}>
            {state.priority === 'urgent' ? 'Urgent' : 'Normal'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Pembayaran</span>
          <span className="capitalize">
            {state.paymentMode === 'cod'
              ? 'COD'
              : state.paymentMode === 'prepaid'
                ? 'Prepaid'
                : 'Asuransi'}
          </span>
        </div>
      </div>

      <Field label="Catatan (opsional)" error={errors.notes}>
        <textarea
          value={state.notes ?? ''}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Catatan tambahan untuk kurir atau apotek…"
          rows={3}
          className="focus:ring-brand-300 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
        />
      </Field>
    </div>
  );
}

// ─── Wizard shell ─────────────────────────────────────────────────────────────

export function OrderWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Persist to localStorage so a page refresh doesn't lose data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { step: number; state: WizardState };
        setStep(parsed.step);
        setState(parsed.state);
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, state }));
    } catch {
      // ignore quota errors
    }
  }, [step, state]);

  function patch(update: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...update }));
  }

  function validateStep(s: number): boolean {
    let errs: Record<string, string> = {};
    if (s === 1) errs = getFieldErrors(OrderWizardStep1Schema, state);
    if (s === 2) errs = getFieldErrors(OrderWizardStep2Schema, { items: state.items });
    if (s === 3) errs = getFieldErrors(OrderWizardStep3Schema, state);
    if (s === 4) errs = getFieldErrors(OrderWizardStep4Schema, state);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEP_COUNT));
    setErrors({});
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
    setErrors({});
  }

  async function handleSubmit() {
    if (!validateStep(4)) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload: OrderWizardInput = {
        patientName: state.patientName,
        patientPhone: state.patientPhone,
        deliveryAddress: state.deliveryAddress || undefined,
        items: state.items,
        priority: state.priority,
        paymentMode: state.paymentMode,
        notes: state.notes || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `Server error ${res.status}`);
      }

      // Clear persisted wizard state on success
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }

      router.push('/p');
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  const stepProps = { state, onChange: patch, errors };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {Array.from({ length: STEP_COUNT }, (_, i) => i + 1).map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                n < step
                  ? 'bg-brand-600 text-white'
                  : n === step
                    ? 'border-brand-600 text-brand-700 border-2'
                    : 'border border-slate-300 text-slate-400'
              }`}
            >
              {n < step ? '✓' : n}
            </div>
            {n < STEP_COUNT && (
              <div className={`h-0.5 w-8 ${n < step ? 'bg-brand-500' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div>
        {step === 1 && <Step1Patient {...stepProps} />}
        {step === 2 && <Step2Items {...stepProps} />}
        {step === 3 && <Step3Options {...stepProps} />}
        {step === 4 && <Step4Review {...stepProps} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 1}
          className="rounded px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30"
        >
          ← Kembali
        </button>

        {step < STEP_COUNT ? (
          <button
            type="button"
            onClick={nextStep}
            className="bg-brand-600 hover:bg-brand-700 rounded px-5 py-2 text-sm font-medium text-white"
          >
            Lanjut →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-brand-600 hover:bg-brand-700 rounded px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? 'Menyimpan…' : 'Buat Order'}
          </button>
        )}
      </div>

      {submitError && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {submitError}
        </div>
      )}
    </div>
  );
}
