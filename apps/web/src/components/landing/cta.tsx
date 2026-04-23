import Link from 'next/link';
import { PTLogo } from '@/components/logo';

export function Cta() {
  return (
    <section className="bg-slate-800 px-4 py-14 sm:px-10 sm:py-[72px]">
      <div className="mx-auto max-w-[600px] text-center">
        <div className="mb-5 flex justify-center">
          <PTLogo size={48} white />
        </div>
        <h2 className="mb-3 text-[26px] font-extrabold tracking-[-0.8px] text-white sm:text-[32px] md:text-[36px]">
          Siap mempercepat pengiriman apotek Anda?
        </h2>
        <p className="mb-8 text-[16px] text-white/55">
          Bergabung dengan ribuan apotek yang telah menggunakan PharmaTrack.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-xl bg-white px-8 py-3 text-base font-semibold text-slate-800 shadow-lg transition hover:bg-slate-50"
        >
          Mulai gratis sekarang →
        </Link>
      </div>
    </section>
  );
}
