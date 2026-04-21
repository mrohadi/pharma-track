import Link from 'next/link';
import { requireRole } from '@/lib/guards';
import { listAllPharmacies, listAllDrivers } from '@pharmatrack/db';
import { UsersTabs } from './tabs.client';

export default async function AdminUsersPage() {
  await requireRole('admin');

  const [pharmacies, drivers] = await Promise.all([listAllPharmacies(), listAllDrivers()]);

  const totalPharmacies = pharmacies.length;
  const activeDrivers = drivers.filter((d) => d.verificationStatus === 'active').length;
  const pendingApprovals =
    pharmacies.filter((p) => p.verificationStatus === 'pending').length +
    drivers.filter((d) => d.verificationStatus === 'pending').length;
  const suspendedUsers =
    pharmacies.filter((p) => p.verificationStatus === 'suspended').length +
    drivers.filter((d) => d.verificationStatus === 'suspended').length;

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-6">
        <Link href="/a" className="text-sm text-slate-500 hover:underline">
          ← Orders
        </Link>
        <h1 className="mt-1 text-2xl font-bold">User Management</h1>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Pharmacies
          </div>
          <div className="mt-1 text-3xl font-bold text-slate-900">{totalPharmacies}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Active Drivers
          </div>
          <div className="mt-1 text-3xl font-bold text-blue-700">{activeDrivers}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Pending Approvals
          </div>
          <div className="mt-1 text-3xl font-bold text-yellow-600">{pendingApprovals}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Suspended Users
          </div>
          <div className="mt-1 text-3xl font-bold text-red-700">{suspendedUsers}</div>
        </div>
      </div>

      <UsersTabs pharmacies={pharmacies} drivers={drivers} />
    </main>
  );
}
