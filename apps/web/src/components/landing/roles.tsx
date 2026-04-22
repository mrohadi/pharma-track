const ROLES = [
  {
    role: 'Apotek',
    icon: '🏥',
    bgColor: 'bg-teal-50',
    checkColor: 'text-teal-600',
    desc: 'Kirim resep, pantau status order secara langsung, dan tinjau riwayat — tanpa perlu telepon.',
    perks: ['Buat order', 'Pelacakan langsung', 'Riwayat order', 'Rating driver'],
  },
  {
    role: 'Driver',
    icon: '🚴',
    bgColor: 'bg-green-50',
    checkColor: 'text-green-600',
    desc: 'Aplikasi mobile-first. Terima pengiriman, navigasi rute, konfirmasi serah terima, dan pantau penghasilan.',
    perks: ['Notifikasi tugas', 'Navigasi rute', 'Bukti pengiriman', 'Dasbor penghasilan'],
  },
];

export function Roles() {
  return (
    <section className="px-10 py-[72px]">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-12 text-center">
          <h2 className="text-[36px] font-extrabold tracking-[-0.8px] text-slate-900">
            Every stakeholder, perfectly connected
          </h2>
        </div>
        <div className="mx-auto grid max-w-[720px] grid-cols-2 gap-5">
          {ROLES.map((r) => (
            <div key={r.role} className="overflow-hidden rounded-2xl border border-slate-200">
              <div className={`${r.bgColor} px-6 pb-5 pt-7`}>
                <div className="mb-3 text-[36px]">{r.icon}</div>
                <div className="text-[20px] font-extrabold text-slate-800">{r.role}</div>
              </div>
              <div className="p-6">
                <p className="mb-4 text-[13.5px] leading-[1.65] text-slate-500">{r.desc}</p>
                {r.perks.map((p) => (
                  <div
                    key={p}
                    className="mb-2 flex items-center gap-2 text-[13px] font-medium text-slate-800"
                  >
                    <span className={`font-extrabold ${r.checkColor}`}>✓</span> {p}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
