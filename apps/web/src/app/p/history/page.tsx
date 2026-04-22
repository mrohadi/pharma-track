import Link from 'next/link';
import { requireRole } from '@/lib/guards';
import { listRecentOrdersForPharmacy } from '@pharmatrack/db';
import { OrderList } from './order-list.client';

export default async function PharmacyHistoryPage() {
  const session = await requireRole('pharmacy');
  const pharmacyId = session.user.pharmacyId as string | undefined;

  const orders = pharmacyId ? await listRecentOrdersForPharmacy(pharmacyId, 100) : [];

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Riwayat Order</h1>
          <p className="mt-0.5 text-sm text-slate-500">100 order terakhir</p>
        </div>
        <Link
          href="/p/orders/new"
          className="bg-brand-600 hover:bg-brand-700 rounded px-4 py-2 text-sm font-medium text-white"
        >
          + Order Baru
        </Link>
      </div>

      <OrderList orders={orders} />
    </main>
  );
}
