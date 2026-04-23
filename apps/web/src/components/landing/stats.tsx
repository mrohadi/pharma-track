const STATS = [
  { value: '98%', label: 'Tingkat ketepatan waktu' },
  { value: '3.200+', label: 'Apotek aktif' },
  { value: '12 mnt', label: 'Rata-rata waktu dispatch' },
  { value: '4,9★', label: 'Kepuasan driver' },
];

export function Stats() {
  return (
    <section className="bg-blue-600 px-4 py-8 sm:px-10">
      <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-6 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-[32px] font-black tracking-[-1px] text-white">{s.value}</div>
            <div className="mt-1 text-[13px] font-medium text-white/65">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
