import Link from 'next/link';
import { PTLogo } from '@/components/logo';

export function Hero() {
  return (
    <>
      {/* NAV */}
      <nav className="bg-white/92 sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 px-10 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <PTLogo size={32} />
          <span className="text-[17px] font-extrabold tracking-tight text-slate-800">
            PharmaTrack
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#features"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Fitur
          </a>
          <a
            href="#pricing"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Harga
          </a>
          <a
            href="#contact"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Kontak
          </a>
          <Link
            href="/login"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Masuk
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Mulai Sekarang
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto grid max-w-[1100px] grid-cols-2 items-center gap-16 px-10 pb-16 pt-20">
        {/* Left */}
        <div>
          <div className="mb-[22px] inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
            Kini hadir di 40+ kota
          </div>
          <h1 className="mb-5 text-[52px] font-black leading-[1.08] tracking-[-1.5px] text-slate-900">
            Pengiriman obat,
            <br />
            <span className="text-blue-600">lebih cerdas.</span>
          </h1>
          <p className="mb-9 max-w-[440px] text-[17px] leading-[1.7] text-slate-500">
            PharmaTrack menghubungkan apotek, driver, dan administrator dalam satu platform cerdas —
            memastikan setiap resep sampai ke tangan pasien dengan cepat.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-blue-700"
            >
              Mulai gratis →
            </Link>
            <a
              href="#how-it-works"
              className="rounded-xl border border-slate-200 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Tonton demo ▶
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-6">
            {['Tanpa biaya setup', 'Gratis 30 hari', 'Batalkan kapan saja'].map((t) => (
              <div
                key={t}
                className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500"
              >
                <span className="font-extrabold text-green-600">✓</span> {t}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Dashboard mock */}
        <div className="relative">
          <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-[oklch(0.96_0.015_250)] shadow-[0_24px_64px_rgba(0,0,0,0.10)]">
            {/* Titlebar */}
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-3">
              <PTLogo size={20} white />
              <span className="text-[12px] font-semibold text-white/70">PharmaTrack Dashboard</span>
              <div className="ml-auto flex gap-1.5">
                {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                  <div key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                ))}
              </div>
            </div>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-2.5 p-4">
              {[
                { l: 'Orders Today', v: '142', ic: '📦' },
                { l: 'Delivered', v: '118', ic: '✅' },
                { l: 'In Transit', v: '19', ic: '🚴' },
                { l: 'Pharmacies', v: '24', ic: '🏥' },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-[11px] font-medium text-slate-400">{s.l}</div>
                  <div className="mt-1 text-[22px] font-extrabold text-slate-800">{s.v}</div>
                  <div className="mt-1 text-lg">{s.ic}</div>
                </div>
              ))}
            </div>
            {/* Recent orders */}
            <div className="px-4 pb-4">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-800">
                  Order Terbaru
                </div>
                {[
                  {
                    id: '#4821',
                    ph: 'MediPlus',
                    status: 'Terkirim',
                    color: 'bg-green-100 text-green-700',
                  },
                  {
                    id: '#4822',
                    ph: 'QuickCare Rx',
                    status: 'Dalam Perjalanan',
                    color: 'bg-amber-100 text-amber-700',
                  },
                  {
                    id: '#4823',
                    ph: 'City Pharma',
                    status: 'Menunggu',
                    color: 'bg-blue-100 text-blue-700',
                  },
                ].map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2 text-xs last:border-0"
                  >
                    <span className="font-semibold text-slate-800">{o.id}</span>
                    <span className="text-slate-500">{o.ph}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${o.color}`}
                    >
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <span className="text-[22px]">🚴</span>
            <div>
              <div className="text-[11px] font-bold text-slate-800">Driver dalam perjalanan</div>
              <div className="text-[11px] font-semibold text-green-600">ETA 8 menit</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
