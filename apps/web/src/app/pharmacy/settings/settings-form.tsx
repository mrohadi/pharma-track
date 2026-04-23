'use client';

import { useState, useTransition } from 'react';
import type { PharmacySettings } from '@pharmatrack/shared';

export function SettingsForm({ initial }: { initial: PharmacySettings }) {
  const [podPhotoRequired, setPodPhotoRequired] = useState(initial.podPhotoRequired ?? false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const res = await fetch('/api/pharmacy/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ podPhotoRequired }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? 'Failed to save settings');
        return;
      }

      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start gap-3">
        <input
          id="podPhotoRequired"
          type="checkbox"
          checked={podPhotoRequired}
          onChange={(e) => {
            setPodPhotoRequired(e.target.checked);
            setSaved(false);
          }}
          className="accent-brand-600 mt-0.5 h-4 w-4 rounded border-slate-300"
        />
        <div>
          <label htmlFor="podPhotoRequired" className="cursor-pointer font-medium text-slate-800">
            Require proof-of-delivery photo
          </label>
          <p className="text-sm text-slate-500">
            When enabled, drivers must upload a photo before confirming delivery.
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">Settings saved.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}
