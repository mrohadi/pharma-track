import { getDriverByUserId, listDriverQueue, listBatchesForDriver } from '@pharmatrack/db';
import { requireRole } from '@/lib/guards';
import { ORDER_STATUS_LABELS, ORDER_STATUS_BADGE } from '@/lib/format';
import { PickupForm } from './pickup-form';

const BATCH_STATUS_BADGE: Record<string, string> = {
  assigned: 'bg-indigo-100 text-indigo-800',
  picked_up: 'bg-violet-100 text-violet-800',
  completed: 'bg-green-100 text-green-800',
};

export default async function DriverHome() {
  const session = await requireRole('driver');

  const driver = await getDriverByUserId(session.user.id);
  if (!driver) {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="mb-2 text-2xl font-bold">Driver</h1>
        <p className="text-red-600">No driver profile found for your account. Contact admin.</p>
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
      <h1 className="mb-1 text-2xl font-bold">Your deliveries</h1>
      <p className="mb-4 text-sm text-slate-500">
        {driver.vehicle && `${driver.vehicle} · `}
        {driver.licensePlate ?? ''}
      </p>

      {/* Batches needing pickup */}
      {activeBatches.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Batches</h2>
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
                    {b.status === 'assigned' ? 'Awaiting pickup' : 'Picked up'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {b.orderCount} order{b.orderCount === 1 ? '' : 's'}
                </p>
                {b.status === 'assigned' && (
                  <div className="mt-3">
                    <p className="mb-1 text-xs text-slate-500">
                      Enter the 6-digit pickup PIN from the pharmacy:
                    </p>
                    <PickupForm batchId={b.id} />
                  </div>
                )}
                {b.status === 'picked_up' && b.pickupConfirmedAt && (
                  <p className="mt-1 text-xs text-green-600">
                    Picked up at {new Date(b.pickupConfirmedAt).toLocaleString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Individual orders */}
      <h2 className="mb-2 text-lg font-semibold">Orders</h2>
      {queue.length === 0 ? (
        <p className="text-sm text-slate-600">No orders assigned to you right now.</p>
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
                  {ORDER_STATUS_LABELS[o.status] ?? o.status}
                </span>
              </div>
              <p className="text-sm text-slate-600">{o.medicineText}</p>
              {o.deliveryAddress && (
                <p className="mt-1 text-sm text-slate-500">{o.deliveryAddress}</p>
              )}
              {!o.deliveryAddress && (
                <p className="mt-1 text-xs italic text-amber-600">Address not yet collected</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
