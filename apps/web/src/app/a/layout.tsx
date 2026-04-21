import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/guards';
import { SignOutButton } from '@/components/sign-out-button';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { listAllPharmacies, listAllDrivers } from '@pharmatrack/db';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, t, locale, pharmacies, drivers] = await Promise.all([
    requireRole('admin'),
    getTranslations('AdminLayout'),
    getLocale(),
    listAllPharmacies(),
    listAllDrivers(),
  ]);

  const pendingCount =
    pharmacies.filter((p) => p.verificationStatus === 'pending').length +
    drivers.filter((d) => d.verificationStatus === 'pending').length;

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
        <div className="text-brand-700 font-semibold">{t('brand')}</div>
        <div className="flex items-center gap-3 text-sm">
          <LocaleSwitcher locale={locale} />
          <span className="text-slate-300">|</span>
          <Link href="/a/users" className="flex items-center gap-1 text-slate-500 hover:text-slate-800">
            Users
            {pendingCount > 0 && (
              <span className="rounded-full bg-yellow-500 px-1.5 py-0.5 text-xs font-semibold leading-none text-white">
                {pendingCount}
              </span>
            )}
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/a/audit-log" className="text-slate-500 hover:text-slate-800">
            {t('auditLog')}
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
