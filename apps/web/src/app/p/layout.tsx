import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/guards';
import { SignOutButton } from '@/components/sign-out-button';
import { LocaleSwitcher } from '@/components/locale-switcher';

export default async function PharmacyLayout({ children }: { children: React.ReactNode }) {
  const [session, t, locale] = await Promise.all([
    requireRole('pharmacy'),
    getTranslations('PharmacyLayout'),
    getLocale(),
  ]);
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
        <div className="text-brand-700 font-semibold">{t('brand')}</div>
        <div className="flex items-center gap-3 text-sm">
          <LocaleSwitcher locale={locale} />
          <span className="text-slate-300">|</span>
          <Link
            href="/p/orders/new"
            className="bg-brand-600 hover:bg-brand-700 rounded px-3 py-1 text-sm font-medium text-white"
          >
            Order Baru
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/p/settings" className="text-slate-500 hover:text-slate-800">
            {t('settings')}
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">{session.user.email}</span>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
