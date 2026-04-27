'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type OrderField = {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  medicineText: string;
  deliveryAddress: string;
  notes: string;
};

export function OrderActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [dispatchState, setDispatchState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [dispatchError, setDispatchError] = useState('');
  const [cancelState, setCancelState] = useState<'idle' | 'loading' | 'confirm'>('idle');
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [fields, setFields] = useState<OrderField | null>(null);

  async function handleDispatch() {
    setDispatchState('loading');
    setDispatchError('');
    try {
      const res = await fetch(`/api/pharmacy/orders/${orderId}/dispatch`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setDispatchError(data.error ?? 'Gagal dispatch driver');
        setDispatchState('error');
        return;
      }
      setDispatchState('idle');
      startTransition(() => router.refresh());
    } catch {
      setDispatchError('Network error');
      setDispatchState('error');
    }
  }

  async function handleCancel() {
    if (cancelState !== 'confirm') {
      setCancelState('confirm');
      return;
    }
    setCancelState('loading' as never);
    try {
      const res = await fetch(`/api/pharmacy/orders/${orderId}/cancel`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? 'Gagal membatalkan order');
      }
      setCancelState('idle');
      startTransition(() => router.refresh());
    } catch {
      alert('Network error');
      setCancelState('idle');
    }
  }

  async function openEdit() {
    setEditError('');
    setEditOpen(true);
    if (fields) return;
    try {
      const res = await fetch(`/api/pharmacy/orders/${orderId}`);
      const data = await res.json();
      setFields({
        patientName: data.patientName ?? '',
        patientPhone: data.patientPhone ?? '',
        patientEmail: data.patientEmail ?? '',
        medicineText: data.medicineText ?? '',
        deliveryAddress: data.deliveryAddress ?? '',
        notes: data.notes ?? '',
      });
    } catch {
      setEditError('Gagal memuat data order');
    }
  }

  async function handleEditSave() {
    if (!fields) return;
    setEditLoading(true);
    setEditError('');
    try {
      const res = await fetch(`/api/pharmacy/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error ?? 'Gagal menyimpan');
        setEditLoading(false);
        return;
      }
      setEditOpen(false);
      setEditLoading(false);
      startTransition(() => router.refresh());
    } catch {
      setEditError('Network error');
      setEditLoading(false);
    }
  }

  const cancelLabel =
    cancelState === 'confirm' ? 'Yakin?' : cancelState === ('loading' as string) ? '...' : 'Cancel';

  return (
    <>
      <div className="mt-2.5 flex gap-2">
        <button
          onClick={handleDispatch}
          disabled={dispatchState === 'loading'}
          className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {dispatchState === 'loading' ? 'Mencari driver...' : 'Dispatch Driver'}
        </button>
        <button
          onClick={openEdit}
          className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Edit
        </button>
        <button
          onClick={handleCancel}
          onBlur={() => setCancelState((s) => (s === 'confirm' ? 'idle' : s))}
          className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          {cancelLabel}
        </button>
      </div>
      {dispatchState === 'error' && <p className="mt-1 text-xs text-red-500">{dispatchError}</p>}

      {/* Edit modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h2 className="mb-4 text-base font-bold text-slate-800">Edit Order</h2>
            {!fields && !editError && <p className="text-sm text-slate-400">Memuat...</p>}
            {editError && <p className="mb-2 text-xs text-red-500">{editError}</p>}
            {fields && (
              <div className="space-y-3">
                <Field label="Nama Pasien">
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={fields.patientName}
                    onChange={(e) => setFields({ ...fields, patientName: e.target.value })}
                  />
                </Field>
                <Field label="No. HP">
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={fields.patientPhone}
                    onChange={(e) => setFields({ ...fields, patientPhone: e.target.value })}
                  />
                </Field>
                <Field label="Email (opsional)">
                  <input
                    type="email"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={fields.patientEmail}
                    onChange={(e) => setFields({ ...fields, patientEmail: e.target.value })}
                  />
                </Field>
                <Field label="Obat">
                  <textarea
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    rows={2}
                    value={fields.medicineText}
                    onChange={(e) => setFields({ ...fields, medicineText: e.target.value })}
                  />
                </Field>
                <Field label="Alamat Pengiriman">
                  <textarea
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    rows={2}
                    value={fields.deliveryAddress}
                    onChange={(e) => setFields({ ...fields, deliveryAddress: e.target.value })}
                  />
                </Field>
                <Field label="Catatan">
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={fields.notes}
                    onChange={(e) => setFields({ ...fields, notes: e.target.value })}
                  />
                </Field>
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleEditSave}
                disabled={editLoading || !fields}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {editLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      {children}
    </div>
  );
}
