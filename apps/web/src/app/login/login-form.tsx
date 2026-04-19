'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { signIn } from '@/lib/auth-client';

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('LoginForm');

  function onSubmit(formData: FormData) {
    setError(null);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    startTransition(async () => {
      const res = await signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message ?? 'Sign-in failed');
        return;
      }
      router.replace(next ?? '/');
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{t('email')}</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="focus:border-brand-500 focus:ring-brand-500 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{t('password')}</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          minLength={8}
          className="focus:border-brand-500 focus:ring-brand-500 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1"
        />
      </label>
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-brand-600 hover:bg-brand-700 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
