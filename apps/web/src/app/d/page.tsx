import { getTranslations } from 'next-intl/server';
import { getDriverByUserId, listDriverQueue, listBatchesForDriver } from '@pharmatrack/db';
import { requireRole } from '@/lib/guards';
import { ORDER_STATUS_BADGE } from '@/lib/format';
import { PickupForm } from './pickup-form';
import { DeliveryControls } from './delivery-controls';

const BATCH_STATUS_BADGE: Record<string, string> = {
  assigned: 'bg-indigo-100 text-indigo-800',
  picked_up: 'bg-violet-100 text-violet-800',
  completed: 'bg-green-100 text-green-800',
};

export default async function DriverHome() {
  const [session, t, tStatus] = await Promise.all([
    requireRole('driver'),
    getTranslations('DriverPage'),
    getTranslations('OrderStatus'),
  ]);

  const driver = await getDriverByUserId(session.user.id);
  if (!driver) {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="mb-2 text-2xl font-bold">{t('noDriver')}</h1>
        <p className="text-red-600">{t('noDriverError')}</p>
      </main>
    );
  }

  const [queue, driverBatches] = await Promise.all([
    listDriverQueue(driver.id),
    listBatchesForDriver(driver.id),
  ]);

  const activeBatches = driverBatches.filter(
    (b) => b.status === 'assigned' || b.status === 'picked_up',
  );

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="mb-1 text-2xl font-bold">{t('heading')}</h1>
      <p className="mb-4 text-sm text-slate-500">
        {driver.vehicle && `${driver.vehicle} · `}
        {driver.licensePlate ?? ''}
      </p>

      {activeBatches.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">{t('batches')}</h2>
          <ul className="space-y-3">
            {activeBatches.map((b) => (
              <li key={b.id} className="rounded border border-slate-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{b.pharmacyName}</span>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      BATCH_STATUS_BADGE[b.status] ?? 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {b.status === 'assigned' ? t('awaitingPickup') : t('pickedUp')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {t('orderCount', { count: b.orderCount })}
                </p>
                {b.status === 'assigned' && (
                  <div className="mt-3">
                    <p className="mb-1 text-xs text-slate-500">{t('pickupPinPrompt')}</p>
                    <PickupForm batchId={b.id} />
                  </div>
                )}
                {b.status === 'picked_up' && b.pickupConfirmedAt && (
                  <p className="mt-1 text-xs text-green-600">
                    {t('pickedUpAt', { time: new Date(b.pickupConfirmedAt).toLocaleString() })}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mb-2 text-lg font-semibold">{t('orders')}</h2>
      {queue.length === 0 ? (
        <p className="text-sm text-slate-600">{t('noOrders')}</p>
      ) : (
        <ul className="space-y-3">
          {queue.map((o) => (
            <li key={o.id} className="rounded border border-slate-200 p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-medium">{o.patientName}</span>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    ORDER_STATUS_BADGE[o.status] ?? 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tStatus(o.status as Parameters<typeof tStatus>[0]) ?? o.status}
                </span>
              </div>
              <p className="text-sm text-slate-600">{o.medicineText}</p>
              {o.deliveryAddress && (
                <p className="mt-1 text-sm text-slate-500">{o.deliveryAddress}</p>
              )}
              {!o.deliveryAddress && (
                <p className="mt-1 text-xs italic text-amber-600">{t('addressNotCollected')}</p>
              )}
              <DeliveryControls
                orderId={o.id}
                status={o.status}
                podPhotoRequired={o.podPhotoRequired}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
