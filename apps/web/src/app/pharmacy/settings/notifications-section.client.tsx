'use client';

import { useState, useTransition } from 'react';

type NotifPrefs = {
  pushNotifications: boolean;
  driverArrivalNotif: boolean;
  promoNotif: boolean;
};

const TOGGLES: { key: keyof NotifPrefs; label: string; desc: string }[] = [
  {
    key: 'pushNotifications',
    label: 'Update status order',
    desc: 'Notifikasi saat driver pickup dan delivered',
  },
  {
    key: 'driverArrivalNotif',
    label: 'Driver tiba di apotek',
    desc: 'Pemberitahuan ketika driver sedang menuju apotek',
  },
  {
    key: 'promoNotif',
    label: 'Info & promo platform',
    desc: 'Berita terbaru dan penawaran dari PharmaTrack',
  },
];

export function NotificationsSection({ initial }: { initial: NotifPrefs }) {
  const [prefs, setPrefs] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(k: keyof NotifPrefs) {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
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
        setPrefs(prefs);
      }
    });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="divide-y divide-slate-100">
        {TOGGLES.map((t) => (
          <div key={t.key} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-[14px] font-semibold text-slate-800">{t.label}</p>
              <p className="mt-0.5 text-[12.5px] text-slate-500">{t.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(t.key)}
              disabled={isPending}
              aria-pressed={prefs[t.key]}
              className={`relative inline-flex h-[26px] w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-50 ${
                prefs[t.key] ? 'bg-green-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-[22px] w-[22px] rounded-full bg-white shadow transition-transform ${
                  prefs[t.key] ? 'translate-x-[18px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
      {error && (
        <div className="border-t border-slate-100 px-6 py-3">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </section>
  );
}
