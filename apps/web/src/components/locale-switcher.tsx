'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function LocaleSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function switchLocale(next: string) {
    document.cookie = `locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        onClick={() => switchLocale('id')}
        className={locale === 'id' ? 'font-semibold text-slate-800' : 'text-slate-400 hover:text-slate-700'}
      >
        ID
      </button>
      <span className="text-slate-300">/</span>
      <button
        onClick={() => switchLocale('en')}
        className={locale === 'en' ? 'font-semibold text-slate-800' : 'text-slate-400 hover:text-slate-700'}
      >
        EN
      </button>
    </div>
  );
}
