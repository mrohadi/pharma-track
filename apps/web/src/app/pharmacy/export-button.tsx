'use client';

import { useState } from 'react';

/**
 * Export button for pharmacy portal. Date range only (pharmacy scoping
 * is handled server-side via session).
 */
export function PharmacyExportButton() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [open, setOpen] = useState(false);

  function buildExportUrl() {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return `/api/export/pharmacy-orders${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        Export CSV
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
          <p className="mb-2 text-xs font-medium text-slate-600">Date range (optional)</p>
          <div className="mb-3 flex items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setFrom('');
                setTo('');
              }}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clear dates
            </button>
            <a
              href={buildExportUrl()}
              download
              onClick={() => setOpen(false)}
              className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
            >
              Download
            </a>
          </div>
          <p className="mt-2 text-[10px] text-slate-400">Exports up to 10,000 rows.</p>
        </div>
      )}
    </div>
  );
}
