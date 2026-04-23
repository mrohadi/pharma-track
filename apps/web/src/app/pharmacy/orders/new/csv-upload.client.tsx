'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadOrdersCsv, type UploadResult } from '../../upload/actions';

export function CsvUploadPanel() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<UploadResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(file: File) {
    const form = new FormData();
    form.append('file', file);
    setResult(null);
    startTransition(async () => {
      const r = await uploadOrdersCsv(form);
      setResult(r);
      if (r.ok) {
        setTimeout(() => {
          router.push('/pharmacy');
          router.refresh();
        }, 1200);
      }
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    submit(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setFileName(file.name);
    submit(file);
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
      {/* Main panel */}
      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <h2 className="mb-1 text-[16px] font-bold text-slate-800">Upload CSV Order</h2>
        <p className="mb-5 text-[13px] text-slate-500">
          Unggah file CSV berisi daftar order. Kolom wajib:{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">patient_name</code>,{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">patient_phone</code>,{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">medicine</code>. Opsional:{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">delivery_address</code>.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`mb-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-12 transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40'
          }`}
        >
          <span className="text-4xl">📂</span>
          <div className="text-center">
            <p className="text-[13.5px] font-semibold text-slate-700">
              {fileName ? fileName : 'Klik atau seret file CSV ke sini'}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">Maks. 2 MB · 5.000 baris</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {/* Status */}
        {pending && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <span className="animate-spin">⏳</span> Memproses CSV…
          </div>
        )}

        {result?.ok === true && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            ✓ {result.inserted} order berhasil dibuat. Mengalihkan ke dashboard…
          </div>
        )}

        {result && result.ok === false && (
          <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="font-semibold">
              Upload ditolak{result.reason ? `: ${result.reason}` : ''}.
            </div>
            {result.errors.length > 0 && (
              <ul className="max-h-60 list-disc space-y-1 overflow-y-auto pl-5 text-xs">
                {result.errors.slice(0, 50).map((err, i) => (
                  <li key={i}>
                    <span className="font-mono">baris {err.row}</span>
                    {err.field ? ` (${err.field})` : ''}: {err.message}
                  </li>
                ))}
                {result.errors.length > 50 && (
                  <li className="italic">…dan {result.errors.length - 50} lagi.</li>
                )}
              </ul>
            )}
          </div>
        )}

        <div className="mt-5 border-t border-slate-100 pt-4">
          <a
            href="/api/csv-template"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            ↓ Unduh template CSV
          </a>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-3">
        <div className="rounded-[14px] border border-slate-200 bg-white p-5">
          <p className="mb-3 text-[14px] font-bold text-slate-800">Format CSV</p>
          <div className="overflow-x-auto rounded-lg border border-slate-100 bg-slate-50 p-3">
            <table className="w-full text-[11.5px] text-slate-600">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="pb-1.5 pr-3 font-semibold">Kolom</th>
                  <th className="pb-1.5 font-semibold">Wajib?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { col: 'patient_name', req: true },
                  { col: 'patient_phone', req: true },
                  { col: 'medicine', req: true },
                  { col: 'delivery_address', req: false },
                ].map((r) => (
                  <tr key={r.col}>
                    <td className="py-1.5 pr-3 font-mono">{r.col}</td>
                    <td className="py-1.5">
                      {r.req ? (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                          Ya
                        </span>
                      ) : (
                        <span className="text-slate-400">Opsional</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[14px] border border-blue-100 bg-blue-50 p-4">
          <p className="mb-1.5 text-xs font-bold text-blue-700">💡 Tips</p>
          <p className="text-[12.5px] leading-relaxed text-blue-600">
            Upload bersifat atomik — jika ada baris yang error, tidak ada order yang tersimpan.
            Perbaiki file lalu upload ulang.
          </p>
        </div>
      </div>
    </div>
  );
}
