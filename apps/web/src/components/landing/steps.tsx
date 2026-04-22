const STEPS = [
  {
    n: '01',
    title: 'Apotek Membuat Order',
    desc: 'Masukkan detail pasien, obat-obatan, dan alamat pengiriman dalam hitungan detik.',
  },
  {
    n: '02',
    title: 'Driver Dikirim',
    desc: 'Driver terdekat yang tersedia mendapat notifikasi instan dan menerima tugas.',
  },
  {
    n: '03',
    title: 'Terkirim & Dikonfirmasi',
    desc: 'Pasien menerima obat; bukti pengiriman digital tersimpan otomatis.',
  },
];

export function Steps() {
  return (
    <section id="how-it-works" className="bg-slate-50 px-10 py-[72px]">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-12 text-center">
          <div className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.06em] text-blue-600">
            Cara kerjanya
          </div>
          <h2 className="text-[36px] font-extrabold tracking-[-0.8px] text-slate-900">
            Mudah dalam 3 langkah
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="px-6 py-6 text-center">
              <div className="mx-auto mb-[18px] flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-[0_8px_20px_rgba(37,99,235,0.35)]">
                {s.n}
              </div>
              <div className="mb-2.5 text-[16px] font-bold text-slate-900">{s.title}</div>
              <div className="text-[13.5px] leading-[1.65] text-slate-500">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
