import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function Hero() {
  const t = useTranslations('Landing.hero');
  return (
    <section className="from-brand-700 to-brand-500 relative overflow-hidden bg-gradient-to-br px-6 py-24 text-white sm:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-200">
          {t('eyebrow')}
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">{t('heading')}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">{t('subheading')}</p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="text-brand-700 rounded-xl bg-white px-8 py-3 text-base font-semibold shadow-lg transition hover:bg-blue-50"
          >
            {t('ctaPrimary')}
          </Link>
          <a
            href="#how-it-works"
            className="rounded-xl border border-white/40 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/10"
          >
            {t('ctaSecondary')}
          </a>
        </div>
      </div>
    </section>
  );
}
