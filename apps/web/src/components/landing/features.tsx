const FEATURES = [
  {
    icon: '💊',
    title: 'Manajemen Order Cerdas',
    desc: 'Apotek membuat dan mengelola order dengan pelacakan status real-time dari pickup hingga pintu pasien.',
  },
  {
    icon: '🚴',
    title: 'Dispatch Driver Otomatis',
    desc: 'Driver menerima notifikasi instan, navigasi efisien, dan konfirmasi pengiriman langsung dari ponsel.',
  },
  {
    icon: '📊',
    title: 'Pusat Kendali Admin',
    desc: 'Visibilitas penuh atas semua order, pengguna, dan metrik performa di seluruh jaringan.',
  },
  {
    icon: '🔔',
    title: 'Notifikasi Real-Time',
    desc: 'Setiap pihak mendapat informasi di setiap langkah — tidak ada update yang terlewat.',
  },
  {
    icon: '📍',
    title: 'Pelacakan Langsung',
    desc: 'Pasien dan apotek melacak pengiriman di peta langsung dari dispatch hingga tiba.',
  },
  {
    icon: '🔒',
    title: 'Aman & Terpercaya',
    desc: 'Data pasien dilindungi dengan akses berbasis peran dan log siap audit yang sudah terintegrasi.',
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-14 sm:px-6 sm:py-[72px] md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-12 text-center">
          <div className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.06em] text-blue-600">
            Semua yang Anda butuhkan
          </div>
          <h2 className="text-[26px] font-extrabold tracking-[-0.8px] text-slate-900 sm:text-[32px] md:text-[36px]">
            Dirancang untuk setiap peran di tim
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
            >
              <div className="mb-3 text-[32px]">{f.icon}</div>
              <div className="mb-2 text-[15px] font-bold text-slate-800">{f.title}</div>
              <div className="text-[13.5px] leading-[1.65] text-slate-500">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
