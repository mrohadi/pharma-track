'use client';

import { useState, useTransition } from 'react';
import { confirmPickupAction, type PickupActionResult } from './actions';

export function PickupForm({ batchId }: { batchId: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<PickupActionResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.set('batchId', batchId);
    startTransition(async () => {
      const r = await confirmPickupAction(form);
      setResult(r);
    });
  }

  if (result?.ok) {
    return <span className="text-sm font-medium text-green-700">Pickup confirmed!</span>;
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        name="pin"
        type="text"
        inputMode="numeric"
        pattern="[0-9]{6}"
        maxLength={6}
        placeholder="6-digit PIN"
        required
        className="w-24 rounded border border-slate-300 p-1.5 text-center font-mono text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {pending ? '…' : 'Confirm pickup'}
      </button>
      {result && !result.ok && <span className="text-xs text-red-600">{result.reason}</span>}
    </form>
  );
}
