import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function Cta() {
  const t = useTranslations('Landing.cta');
  return (
    <section className="bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mb-4 text-3xl font-bold text-slate-800">{t('heading')}</h2>
        <p className="mb-8 text-slate-500">{t('subheading')}</p>
        <Link
          href="/login"
          className="bg-brand-600 hover:bg-brand-700 inline-block rounded-xl px-10 py-3 text-base font-semibold text-white shadow-lg transition"
        >
          {t('button')}
        </Link>
      </div>
    </section>
  );
}
