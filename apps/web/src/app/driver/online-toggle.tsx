'use client';

import { useTransition } from 'react';
import { toggleDriverOnlineAction } from './actions';

export function OnlineToggle({ online }: { online: boolean }) {
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleDriverOnlineAction(!online);
    });
  }

  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div>
        <div className="text-sm font-bold text-slate-800">Status Saya</div>
        <div
          className={`mt-0.5 text-xs font-semibold ${online ? 'text-green-600' : 'text-slate-400'}`}
        >
          {online ? '● Online — Menerima order' : '● Offline'}
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={pending}
        aria-label="Toggle online status"
        className={`relative h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
          online ? 'bg-green-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all duration-200 ${
            online ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}
