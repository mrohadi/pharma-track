import { requireRole } from '@/lib/guards';
import { getPharmacyById } from '@pharmatrack/db';
import { SignOutButton } from '@/components/sign-out-button';
import { SidebarNav } from './_components/sidebar-nav';

export default async function PharmacyLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('pharmacy');
  const pharmacyId = session.user.pharmacyId as string | undefined;
  const pharmacy = pharmacyId ? await getPharmacyById(pharmacyId) : null;

  const initial = (pharmacy?.name ?? session.user.email ?? 'A').charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col bg-[oklch(0.15_0.04_255)]">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-lg font-bold text-white">
            +
          </div>
          <div>
            <div className="text-sm font-bold leading-tight text-white">PharmaTrack</div>
            <div className="text-[11px] text-white/40">Apotek</div>
          </div>
        </div>

        {/* Nav — client component for active state */}
        <SidebarNav />

        {/* User footer */}
        <div className="flex items-center gap-2.5 border-t border-white/10 px-4 py-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-white">
              {pharmacy?.name ?? 'Apotek'}
            </div>
            <div className="truncate text-[11px] text-white/40">{session.user.email}</div>
          </div>
          <SignOutButton className="shrink-0 rounded px-2 py-1 text-[11px] font-medium text-white/40 transition-colors hover:text-white/70" />
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}
