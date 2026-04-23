import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  listBatchesForAdmin,
  listBatchableOrders,
  listDrivers,
  listPharmaciesForFilter,
} from '@pharmatrack/db';
import { requireRole } from '@/lib/guards';
import { CreateBatchForm } from './create-batch-form';

const BATCH_STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  assigned: 'bg-indigo-100 text-indigo-800',
  picked_up: 'bg-violet-100 text-violet-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default async function BatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ pharmacyId?: string }>;
}) {
  await requireRole('admin');
  const sp = await searchParams;

  const [allBatches, allDrivers, allPharmacies, t, tBatch] = await Promise.all([
    listBatchesForAdmin(),
    listDrivers(),
    listPharmaciesForFilter(),
    getTranslations('BatchesPage'),
    getTranslations('BatchStatus'),
  ]);

  const selectedPharmacyId = sp.pharmacyId ?? allPharmacies[0]?.id;
  const batchableOrders = selectedPharmacyId ? await listBatchableOrders(selectedPharmacyId) : [];

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('heading')}</h1>
        <Link href="/admin/orders" className="text-brand-700 text-sm hover:underline">
          {t('backToOrders')}
        </Link>
      </div>

      <section className="mb-8 rounded border border-slate-200 p-4">
        <h2 className="mb-3 text-lg font-semibold">{t('createBatch')}</h2>
        <div className="mb-3">
          <form action="/admin/batches" method="get" className="flex items-end gap-2">
            <div>
              <label htmlFor="pharmacyId" className="mb-1 block text-xs text-slate-500">
                {t('filterPharmacy')}
              </label>
              <select
                id="pharmacyId"
                name="pharmacyId"
                defaultValue={selectedPharmacyId ?? ''}
                className="rounded border border-slate-300 p-1.5 text-sm"
              >
                {allPharmacies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              {t('loadOrders')}
            </button>
          </form>
        </div>
        {selectedPharmacyId && (
          <CreateBatchForm
            orders={batchableOrders}
            drivers={allDrivers}
            pharmacyId={selectedPharmacyId}
          />
        )}
      </section>

      <h2 className="mb-2 text-lg font-semibold">{t('allBatches')}</h2>
      {allBatches.length === 0 ? (
        <p className="text-sm text-slate-600">{t('noBatches')}</p>
      ) : (
        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">{t('cols.pharmacy')}</th>
                <th className="px-3 py-2">{t('cols.driver')}</th>
                <th className="px-3 py-2">{t('cols.orders')}</th>
                <th className="px-3 py-2">{t('cols.status')}</th>
                <th className="px-3 py-2">{t('cols.pickedUp')}</th>
                <th className="px-3 py-2">{t('cols.created')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allBatches.map((b) => (
                <tr key={b.id}>
                  <td className="px-3 py-2">{b.pharmacyName}</td>
                  <td className="px-3 py-2">{b.driverName ?? '—'}</td>
                  <td className="px-3 py-2">{b.orderCount}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        BATCH_STATUS_BADGE[b.status] ?? 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tBatch(b.status as Parameters<typeof tBatch>[0]) ?? b.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {b.pickupConfirmedAt ? new Date(b.pickupConfirmedAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {new Date(b.createdAt).toLocaleString()}
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
