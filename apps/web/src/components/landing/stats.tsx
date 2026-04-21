import { useTranslations } from 'next-intl';

export function Stats() {
  const t = useTranslations('Landing.stats');
  const items = Array.from({ length: 4 }, (_, i) => ({
    value: t(`items.${i}.value`),
    label: t(`items.${i}.label`),
  }));

  return (
    <section className="bg-brand-700 px-6 py-14 text-white">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-4xl font-extrabold">{item.value}</div>
            <div className="mt-1 text-sm text-blue-200">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
