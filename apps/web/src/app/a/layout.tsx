import { requireRole } from '@/lib/guards';
import { listAllPharmacies, listAllDrivers } from '@pharmatrack/db';
import { AdminSidebar } from './sidebar-nav.client';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, pharmacies, drivers] = await Promise.all([
    requireRole('admin'),
    listAllPharmacies(),
    listAllDrivers(),
  ]);

  const pendingCount =
    pharmacies.filter((p) => p.verificationStatus === 'pending').length +
    drivers.filter((d) => d.verificationStatus === 'pending').length;

  const userName = session.user.name ?? session.user.email ?? 'Admin';
  const userEmail = session.user.email ?? '';

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: 'oklch(0.97 0.008 250)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <AdminSidebar userName={userName} userEmail={userEmail} pendingCount={pendingCount} />
      {/* offset for fixed sidebar */}
      <div style={{ marginLeft: 240, flex: 1, overflowY: 'auto', minWidth: 0 }}>{children}</div>
    </div>
  );
}
