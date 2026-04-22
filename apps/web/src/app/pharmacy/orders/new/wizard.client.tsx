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

type Step1 = z.infer<typeof OrderWizardStep1Schema>;
type Step2 = z.infer<typeof OrderWizardStep2Schema>;
type Step3 = z.infer<typeof OrderWizardStep3Schema>;
type Step4 = z.infer<typeof OrderWizardStep4Schema>;
type WizardState = Step1 & Step2 & Step3 & Step4;

const STORAGE_KEY = 'pharmatrack_order_wizard';
const STEP_COUNT = 4;
const STEP_LABELS = ['Data Pasien', 'Obat-obatan', 'Opsi Pengiriman', 'Konfirmasi'];

const INITIAL_STATE: WizardState = {
  patientName: '',
  patientPhone: '',
  deliveryAddress: '',
  items: [{ name: '', quantity: 1, unitPriceCents: undefined }],
  priority: 'normal',
  paymentMode: 'cod',
  notes: '',
};

function getFieldErrors(schema: z.ZodTypeAny, data: unknown): Record<string, string> {
  const result = schema.safeParse(data);
  if (result.success) return {};
  const flat = result.error.flatten() as { fieldErrors: Record<string, string[] | undefined> };
  const out: Record<string, string> = {};
  for (const [k, msgs] of Object.entries(flat.fieldErrors)) {
    if (msgs?.[0]) out[k] = msgs[0];
  }
  return out;
}

function InputField({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[13px] font-semibold text-slate-700">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function TextInput({
  error,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      {...rest}
      className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
        error
          ? 'border-red-400 focus:ring-red-200'
          : 'border-slate-200 focus:ring-blue-200'
      } ${className ?? ''}`}
    />
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function Step1Patient({
  state,
  onChange,
  errors,
}: {
  state: WizardState;
  onChange: (p: Partial<WizardState>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-[16px] font-bold text-slate-800">Informasi Pasien</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <InputField label="Nama Lengkap Pasien *" error={errors.patientName}>
            <TextInput
              value={state.patientName}
              onChange={(e) => onChange({ patientName: e.target.value })}
              placeholder="Budi Santoso"
              error={errors.patientName}
            />
          </InputField>
        </div>
        <InputField label="Nomor Kontak *" error={errors.patientPhone}>
          <TextInput
            value={state.patientPhone}
            onChange={(e) => onChange({ patientPhone: e.target.value })}
            placeholder="+62 812 3456 7890"
            error={errors.patientPhone}
          />
        </InputField>
        <div />
        <div className="col-span-2">
          <InputField
            label="Alamat Lengkap (opsional)"
            error={errors.deliveryAddress}
            hint="Kosongkan jika ingin dikumpulkan via WhatsApp otomatis."
          >
            <textarea
              value={state.deliveryAddress ?? ''}
              onChange={(e) => onChange({ deliveryAddress: e.target.value })}
              placeholder="Jl. Sudirman No. 12, Apt 4B, Jakarta Pusat"
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </InputField>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function Step2Items({
  state,
  onChange,
  errors,
}: {
  state: WizardState;
  onChange: (p: Partial<WizardState>) => void;
  errors: Record<string, string>;
}) {
  function updateItem(idx: number, patch: Partial<WizardState['items'][number]>) {
    onChange({ items: state.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) });
  }
  function addItem() {
    onChange({ items: [...state.items, { name: '', quantity: 1, unitPriceCents: undefined }] });
  }
  function removeItem(idx: number) {
    onChange({ items: state.items.filter((_, i) => i !== idx) });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-[16px] font-bold text-slate-800">Obat-obatan</h2>
      {errors.items && <p className="text-xs text-red-500">{errors.items}</p>}

      {state.items.map((item, idx) => (
        <div
          key={idx}
          className="relative rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="mb-3 text-xs font-semibold text-slate-400">Item {idx + 1}</div>
          {state.items.length > 1 && (
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded bg-red-100 text-xs font-bold text-red-500 hover:bg-red-200"
            >
              ×
            </button>
          )}
          <div className="grid grid-cols-[1fr_80px] gap-3">
            <InputField
              label="Nama Obat *"
              error={(errors as Record<string, string>)[`items.${idx}.name`]}
            >
              <TextInput
                value={item.name}
                onChange={(e) => updateItem(idx, { name: e.target.value })}
                placeholder="Nama obat, dosis, bentuk sediaan…"
                error={(errors as Record<string, string>)[`items.${idx}.name`]}
              />
            </InputField>
            <InputField
              label="Qty *"
              error={(errors as Record<string, string>)[`items.${idx}.quantity`]}
            >
              <TextInput
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                error={(errors as Record<string, string>)[`items.${idx}.quantity`]}
              />
            </InputField>
          </div>
          <div className="mt-3">
            <InputField label="Harga Satuan (Rp, opsional)">
              <TextInput
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
            </InputField>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600"
      >
        + Tambah Obat
      </button>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

const PRIORITIES = [
  { value: 'normal', label: 'Normal', desc: '1–2 jam', icon: '🚴' },
  { value: 'urgent', label: 'Urgen', desc: '< 30 mnt', icon: '🚨' },
] as const;

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'Bayar di Tempat (COD)' },
  { value: 'prepaid', label: 'Prepaid (Sudah Lunas)' },
  { value: 'insurance', label: 'Asuransi' },
] as const;

function Step3Options({
  state,
  onChange,
  errors,
}: {
  state: WizardState;
  onChange: (p: Partial<WizardState>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-[16px] font-bold text-slate-800">Opsi Pengiriman</h2>

      <div>
        <div className="mb-2 text-[13px] font-semibold text-slate-700">Tingkat Prioritas</div>
        <div className="grid grid-cols-2 gap-3">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange({ priority: p.value })}
              className={`rounded-xl border-2 p-4 text-center transition-all ${
                state.priority === p.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="mb-1 text-2xl">{p.icon}</div>
              <div
                className={`text-[13px] font-bold ${
                  state.priority === p.value ? 'text-blue-700' : 'text-slate-800'
                }`}
              >
                {p.label}
              </div>
              <div className="text-[11px] text-slate-400">{p.desc}</div>
            </button>
          ))}
        </div>
        {errors.priority && <p className="mt-1 text-xs text-red-500">{errors.priority}</p>}
      </div>

      <InputField label="Metode Pembayaran" error={errors.paymentMode}>
        <select
          value={state.paymentMode}
          onChange={(e) => onChange({ paymentMode: e.target.value as Step3['paymentMode'] })}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {PAYMENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </InputField>

      <InputField label="Catatan Order (opsional)">
        <TextInput
          value={state.notes ?? ''}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Instruksi pengiriman khusus…"
        />
      </InputField>
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

function Step4Review({ state }: { state: WizardState }) {
  const rows = [
    { label: 'Pasien', value: state.patientName || '—' },
    { label: 'Kontak', value: state.patientPhone || '—' },
    {
      label: 'Alamat',
      value: state.deliveryAddress || '(akan diminta via WhatsApp)',
    },
    {
      label: 'Obat',
      value:
        state.items
          .filter((i) => i.name)
          .map((i) => `${i.name} ×${i.quantity}`)
          .join(', ') || '—',
    },
    { label: 'Prioritas', value: state.priority === 'urgent' ? 'Urgen 🚨' : 'Normal 🚴' },
    {
      label: 'Pembayaran',
      value:
        state.paymentMode === 'cod'
          ? 'COD'
          : state.paymentMode === 'prepaid'
            ? 'Prepaid'
            : 'Asuransi',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-[16px] font-bold text-slate-800">Konfirmasi Order</h2>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between px-4 py-3 text-[13.5px]">
            <span className="font-medium text-slate-400">{r.label}</span>
            <span className="max-w-[60%] text-right font-semibold text-slate-800">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Side summary ─────────────────────────────────────────────────────────────

function OrderSummary({ state }: { state: WizardState }) {
  const namedItems = state.items.filter((i) => i.name);
  const hasData = state.patientName || state.deliveryAddress || namedItems.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-[14px] border border-slate-200 bg-white p-5">
        <p className="mb-3.5 text-[14px] font-bold text-slate-800">Ringkasan Order</p>
        <div className="space-y-2 text-[13px] leading-relaxed text-slate-500">
          {hasData ? (
            <>
              {state.patientName && (
                <div>
                  👤 <span className="font-semibold text-slate-800">{state.patientName}</span>
                </div>
              )}
              {state.deliveryAddress && <div>📍 {state.deliveryAddress}</div>}
              {namedItems.length > 0 && (
                <div>
                  💊{' '}
                  {namedItems.length === 1
                    ? namedItems[0].name
                    : `${namedItems.length} obat dipilih`}
                </div>
              )}
            </>
          ) : (
            <span className="italic text-slate-400">Isi formulir untuk melihat pratinjau.</span>
          )}
        </div>
      </div>

      <div className="rounded-[14px] border border-blue-100 bg-blue-50 p-4">
        <p className="mb-1.5 text-xs font-bold text-blue-700">💡 Tips</p>
        <p className="text-[12.5px] leading-relaxed text-blue-600">
          Periksa kembali nama obat dan dosis sebelum mengirim. Driver tidak dapat memverifikasi
          resep.
        </p>
      </div>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-7 flex items-center">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold transition-all ${
                  done
                    ? 'bg-green-500 text-white'
                    : active
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-300 text-slate-400'
                }`}
              >
                {done ? '✓' : n}
              </div>
              <span
                className={`whitespace-nowrap text-[11.5px] font-semibold ${
                  active ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`mx-2 mb-5 h-0.5 w-10 transition-colors ${
                  done ? 'bg-green-400' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        );
      })}
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { step: number; state: WizardState };
        setStep(parsed.step);
        setState(parsed.state);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, state }));
    } catch {
      // ignore
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

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }

      router.push('/pharmacy');
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  const stepProps = { state, onChange: patch, errors };

  return (
    <div>
      <StepIndicator step={step} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        {/* Main card */}
        <div className="rounded-[14px] border border-slate-200 bg-white p-6">
          {step === 1 && <Step1Patient {...stepProps} />}
          {step === 2 && <Step2Items {...stepProps} />}
          {step === 3 && <Step3Options {...stepProps} />}
          {step === 4 && <Step4Review state={state} />}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                ← Kembali
              </button>
            )}
            {step < STEP_COUNT ? (
              <button
                type="button"
                onClick={nextStep}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Lanjut →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Menyimpan…' : '✓ Kirim Order'}
              </button>
            )}
          </div>

          {submitError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <OrderSummary state={state} />
      </div>
    </div>
  );
}
