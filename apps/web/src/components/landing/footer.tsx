import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('Landing.footer');
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <span className="text-brand-700 text-sm font-semibold">PharmaTrack</span>
        <p className="text-center text-xs text-slate-400">{t('tagline')}</p>
        <p className="text-xs text-slate-400">
          {t('copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
