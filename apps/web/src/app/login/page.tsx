import { redirect } from 'next/navigation';
import { getSession, homeForRole } from '@/lib/session';
import type { Role } from '@pharmatrack/shared';
import { PTLogo } from '@/components/logo';
import { AuthForm } from './auth-form.client';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  const { next } = await searchParams;

  if (session?.user) {
    redirect(next ?? homeForRole(session.user.role as Role));
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* LEFT PANEL */}
      <div className="relative hidden w-[400px] flex-shrink-0 flex-col justify-center overflow-hidden px-9 py-12 lg:flex" style={{ background: 'oklch(0.15 0.04 255)' }}>
        {/* decorative circles */}
        <div className="absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-white/[0.03]" />
        <div className="absolute -bottom-10 -left-10 h-[200px] w-[200px] rounded-full bg-white/[0.03]" />

        <div className="relative z-10">
          <div className="mb-9 flex items-center gap-2.5">
            <PTLogo size={36} white />
            <span className="text-[18px] font-extrabold text-white">PharmaTrack</span>
          </div>

          <h2 className="mb-3 text-[26px] font-extrabold leading-[1.3] tracking-[-0.5px] text-white">
            Platform pengiriman obat terpercaya di Indonesia.
          </h2>
          <p className="mb-9 text-[13.5px] leading-[1.7]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Menghubungkan apotek, driver, dan administrator dalam satu platform cerdas.
          </p>

          <div className="flex flex-col gap-3">
            {[
              { icon: '💊', text: 'Manajemen order real-time' },
              { icon: '📍', text: 'Pelacakan pengiriman live' },
              { icon: '📊', text: 'Laporan & analitik lengkap' },
              { icon: '🔒', text: 'Data pasien aman & terenkripsi' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px] bg-white/10 text-base">
                  {item.icon}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.62)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto px-10 py-10" style={{ background: 'oklch(0.97 0.008 250)' }}>
        <div className="w-full max-w-[440px]">
          <AuthForm next={next} />
        </div>
      </div>
    </div>
  );
}
