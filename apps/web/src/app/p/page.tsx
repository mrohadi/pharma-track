import Link from 'next/link';
import { listRecentOrdersForPharmacy } from '@pharmatrack/db';
import { requireRole } from '@/lib/guards';
import { ORDER_STATUS_LABELS, maskPhone } from '@/lib/format';
import { PodPhotoLink } from '@/components/pod-photo-link';

export default async function PharmacyHome() {
  const session = await requireRole('pharmacy');
  const pharmacyId = session.user.pharmacyId as string | undefined;

  const recent = pharmacyId ? await listRecentOrdersForPharmacy(pharmacyId) : [];

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pharmacy portal</h1>
        <Link
          href="/p/upload"
          className="bg-brand-600 hover:bg-brand-700 rounded px-4 py-2 text-sm font-medium text-white"
        >
          Upload CSV
        </Link>
      </div>

      <h2 className="mb-2 text-lg font-semibold">Recent orders</h2>
      {recent.length === 0 ? (
        <p className="text-sm text-slate-600">
          No orders yet.{' '}
          <Link href="/p/upload" className="text-brand-700 underline">
            Upload a CSV
          </Link>{' '}
          to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Patient</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">POD</th>
                <th className="px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((o) => (
                <tr key={o.id}>
                  <td className="px-3 py-2">{o.patientName}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">
                    {maskPhone(o.patientPhone)}
                  </td>
                  <td className="px-3 py-2">{ORDER_STATUS_LABELS[o.status] ?? o.status}</td>
                  <td className="px-3 py-2">
                    {o.podPhotoUrl ? <PodPhotoLink photoKey={o.podPhotoUrl} /> : null}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
