import Link from 'next/link';
import { requireRole } from '@/lib/guards';
import { listRecentOrdersForPharmacy } from '@pharmatrack/db';
import { OrderList } from './order-list.client';

export default async function PharmacyHistoryPage() {
  const session = await requireRole('pharmacy');
  const pharmacyId = session.user.pharmacyId as string | undefined;

  const orders = pharmacyId ? await listRecentOrdersForPharmacy(pharmacyId, 100) : [];

  return (
    <div className="p-7">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Riwayat Order</h1>
          <p className="mt-1 text-[13.5px] text-slate-500">100 order terakhir</p>
        </div>
        <Link
          href="/pharmacy/orders/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New Order
        </Link>
      </div>

      <OrderList orders={orders} />
    </div>
  );
}
