'use client';

import { useState, useTransition } from 'react';

type NotifPrefs = { pushNotifications: boolean };

const TOGGLES = [
  {
    key: 'pushNotifications' as const,
    label: 'Update status order',
    desc: 'Notifikasi saat driver pickup dan delivered',
  },
];

export function NotificationsSection({ initial }: { initial: NotifPrefs }) {
  const [prefs, setPrefs] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(k: keyof NotifPrefs) {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const res = await fetch('/api/pharmacy/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [k]: next[k] }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? 'Gagal menyimpan');
        setPrefs(prefs); // revert
        return;
      }
      setSaved(true);
    });
  }

  return (
    <section className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {TOGGLES.map((t) => (
        <div key={t.key} className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-slate-800">{t.label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{t.desc}</p>
          </div>
          <button
            type="button"
            onClick={() => toggle(t.key)}
            disabled={isPending}
            aria-pressed={prefs[t.key]}
            className={`focus:ring-brand-500 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 ${prefs[t.key] ? 'bg-green-500' : 'bg-slate-200'}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${prefs[t.key] ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>
      ))}
      {(saved || error) && (
        <div className="px-6 py-3">
          {saved && <p className="text-xs text-green-600">Preferensi disimpan.</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </section>
  );
}
