'use client';

import { useState } from 'react';
import Link from 'next/link';
import { OrderWizard } from './wizard.client';
import { CsvUploadPanel } from './csv-upload.client';

type Mode = 'manual' | 'csv';

export function NewOrderClient() {
  const [mode, setMode] = useState<Mode>('manual');

  return (
    <div className="p-7">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Buat Order Baru</h1>
          <p className="mt-1 text-[13.5px] text-slate-500">Lengkapi detail pengiriman</p>
        </div>
        <Link
          href="/pharmacy"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          ← Kembali
        </Link>
      </div>

      {/* Mode toggle */}
      <div className="mb-6 flex w-fit overflow-hidden rounded-xl border border-slate-200 bg-white">
        <button
          onClick={() => setMode('manual')}
          className={`px-5 py-2.5 text-sm font-semibold transition-colors ${
            mode === 'manual' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          ✏️ Input Manual
        </button>
        <button
          onClick={() => setMode('csv')}
          className={`px-5 py-2.5 text-sm font-semibold transition-colors ${
            mode === 'csv' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          📂 Upload CSV
        </button>
      </div>

      {mode === 'manual' ? <OrderWizard /> : <CsvUploadPanel />}
    </div>
  );
}
