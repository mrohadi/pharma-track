'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { uploadOrdersCsv, type UploadResult } from './actions';

export function UploadForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<UploadResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await uploadOrdersCsv(form);
      setResult(r);
      if (r.ok) {
        // Give the user a beat to see the success message before we refresh.
        setTimeout(() => router.refresh(), 800);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="file" className="mb-1 block text-sm font-medium">
          CSV file
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="block w-full rounded border border-slate-300 p-2 text-sm"
        />
        <p className="mt-1 text-xs text-slate-500">
          Required columns: patient_name, patient_phone, medicine. Optional: delivery_address.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-brand-600 hover:bg-brand-700 rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Uploading…' : 'Upload'}
      </button>

      {result?.ok === true && (
        <div className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-800">
          Success — {result.inserted} order{result.inserted === 1 ? '' : 's'} created.
        </div>
      )}

      {result && result.ok === false && (
        <div className="space-y-2 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          <div className="font-medium">
            Upload rejected{result.reason ? `: ${result.reason}` : ''}.
          </div>
          {result.errors.length > 0 && (
            <ul className="max-h-64 list-disc space-y-1 overflow-y-auto pl-5">
              {result.errors.slice(0, 50).map((err, i) => (
                <li key={i}>
                  <span className="font-mono">row {err.row}</span>
                  {err.field ? ` (${err.field})` : ''}: {err.message}
                </li>
              ))}
              {result.errors.length > 50 && (
                <li className="italic">…and {result.errors.length - 50} more.</li>
              )}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
