'use client';

import { useState, useTransition } from 'react';
import { createBatchAction, type CreateBatchActionResult } from './actions';
import type { DriverRow } from '@pharmatrack/db';

type BatchableOrder = {
  id: string;
  patientName: string;
  status: string;
};

export function CreateBatchForm({
  orders,
  drivers,
  pharmacyId,
}: {
  orders: BatchableOrder[];
  drivers: DriverRow[];
  pharmacyId: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<CreateBatchActionResult | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === orders.length) setSelected(new Set());
    else setSelected(new Set(orders.map((o) => o.id)));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.set('orderIds', Array.from(selected).join(','));
    form.set('pharmacyId', pharmacyId);
    startTransition(async () => {
      const r = await createBatchAction(form);
      setResult(r);
      if (r.ok) setSelected(new Set());
    });
  }

  if (result?.ok) {
    return (
      <div className="rounded border border-green-300 bg-green-50 p-4">
        <p className="text-lg font-medium text-green-800">Batch created!</p>
        <p className="mt-1 text-sm text-green-700">
          {result.orderCount} order{result.orderCount === 1 ? '' : 's'} assigned.
        </p>
        <div className="mt-3 rounded border border-green-400 bg-white p-3 text-center">
          <p className="text-xs text-slate-500">Pickup PIN (show to pharmacy)</p>
          <p className="font-mono text-3xl font-bold tracking-widest text-green-700">
            {result.pin}
          </p>
        </div>
        <button onClick={() => setResult(null)} className="mt-3 text-sm text-green-700 underline">
          Create another batch
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {orders.length === 0 ? (
        <p className="text-sm text-slate-500">
          No batchable orders (need address_collected or assigned status).
        </p>
      ) : (
        <>
          <div className="rounded border border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs">
              <input
                type="checkbox"
                checked={selected.size === orders.length}
                onChange={toggleAll}
              />
              <span className="text-slate-500">
                {selected.size} of {orders.length} selected
              </span>
            </div>
            <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.has(o.id)}
                    onChange={() => toggle(o.id)}
                  />
                  <span>{o.patientName}</span>
                  <span className="ml-auto text-xs text-slate-400">{o.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label htmlFor="driverId" className="mb-1 block text-sm font-medium">
              Assign to driver
            </label>
            <select
              id="driverId"
              name="driverId"
              required
              className="w-full rounded border border-slate-300 p-2 text-sm"
            >
              <option value="">Choose driver…</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name ?? 'Unnamed'} {d.vehicle ? `(${d.vehicle})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={pending || selected.size === 0}
            className="bg-brand-600 hover:bg-brand-700 rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? 'Creating…' : `Create batch (${selected.size} orders)`}
          </button>
        </>
      )}

      {result && !result.ok && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {result.reason}
        </div>
      )}
    </form>
  );
}
