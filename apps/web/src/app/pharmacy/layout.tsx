import { requireRole } from '@/lib/guards';
import { getPharmacyById } from '@pharmatrack/db';
import { PharmacySidebar } from './_components/pharmacy-sidebar.client';

export default async function PharmacyLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole('pharmacy');
  const pharmacyId = session.user.pharmacyId as string | undefined;
  const pharmacy = pharmacyId ? await getPharmacyById(pharmacyId) : null;

  const pharmacyName = pharmacy?.name ?? 'Apotek';
  const initial = (pharmacyName ?? session.user.email ?? 'A').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 font-sans lg:flex">
      {/* Sidebar */}
      <PharmacySidebar
        initial={initial}
        pharmacyName={pharmacyName}
        userEmail={session.user.email ?? ''}
      />

      {/* Desktop spacer */}
      <div className="hidden lg:block" style={{ width: 240, flexShrink: 0 }} />

      {/* Main */}
      <div className="min-w-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}
