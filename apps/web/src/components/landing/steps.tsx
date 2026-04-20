import { useTranslations } from 'next-intl';

export function Steps() {
  const t = useTranslations('Landing.steps');
  const items = Array.from({ length: 3 }, (_, i) => ({
    title: t(`items.${i}.title`),
    desc: t(`items.${i}.desc`),
  }));

  return (
    <section id="how-it-works" className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-12 text-center text-3xl font-bold text-slate-800">{t('heading')}</h2>
        <div className="grid gap-10 sm:grid-cols-3">
          {items.map((item, i) => (
            <div key={item.title} className="flex flex-col items-center text-center">
              <div className="bg-brand-500 mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white">
                {i + 1}
              </div>
              <h3 className="mb-2 font-semibold text-slate-800">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
