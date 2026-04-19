import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('HomePage');
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 p-8">
      <h1 className="text-brand-700 text-4xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-lg text-slate-600">{t('description')}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <a
          href="/p"
          className="hover:border-brand-500 rounded-lg border border-slate-200 p-4 transition"
        >
          <div className="font-semibold">{t('pharmacy.title')}</div>
          <div className="text-sm text-slate-500">{t('pharmacy.subtitle')}</div>
        </a>
        <a
          href="/a"
          className="hover:border-brand-500 rounded-lg border border-slate-200 p-4 transition"
        >
          <div className="font-semibold">{t('admin.title')}</div>
          <div className="text-sm text-slate-500">{t('admin.subtitle')}</div>
        </a>
        <a
          href="/d"
          className="hover:border-brand-500 rounded-lg border border-slate-200 p-4 transition"
        >
          <div className="font-semibold">{t('driver.title')}</div>
          <div className="text-sm text-slate-500">{t('driver.subtitle')}</div>
        </a>
      </div>
    </main>
  );
}
