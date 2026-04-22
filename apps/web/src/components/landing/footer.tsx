import { PTLogo } from '@/components/logo';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-slate-800 px-10 py-7">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between">
        <div className="flex items-center gap-2">
          <PTLogo size={22} white />
          <span className="text-[13px] text-white/40">
            © 2026 PharmaTrack. Hak cipta dilindungi.
          </span>
        </div>
        <div className="flex gap-6">
          {['Privasi', 'Ketentuan', 'Dukungan'].map((l) => (
            <a
              key={l}
              href="#"
              className="text-white/38 text-[13px] font-medium transition hover:text-white/60"
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
