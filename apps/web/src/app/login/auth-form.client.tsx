'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth-client';
import { PharmacySignupForm } from './pharmacy-signup.client';
import { DriverSignupForm } from './driver-signup.client';

type Tab = 'login' | 'pharmacy' | 'driver';

export function AuthForm({ next }: { next?: string }) {
  const [tab, setTab] = useState<Tab>('login');

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex rounded-lg border border-slate-200 p-1 text-sm">
        {(
          [
            { id: 'login', label: 'Masuk' },
            { id: 'pharmacy', label: 'Daftar Apotek' },
            { id: 'driver', label: 'Daftar Driver' },
          ] as { id: Tab; label: string }[]
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors ${
              tab === id
                ? 'bg-brand-600 text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'login' && <LoginPanel next={next} />}
      {tab === 'pharmacy' && <PharmacySignupForm onSuccess={() => setTab('login')} />}
      {tab === 'driver' && <DriverSignupForm onSuccess={() => setTab('login')} />}
    </div>
  );
}

function LoginPanel({ next }: { next?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    startTransition(async () => {
      const res = await signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message ?? 'Gagal masuk');
        return;
      }
      router.replace(next ?? '/');
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="focus:border-brand-500 focus:ring-brand-500 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Kata Sandi</span>
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
        {pending ? 'Sedang masuk…' : 'Masuk'}
      </button>
    </form>
  );
}
