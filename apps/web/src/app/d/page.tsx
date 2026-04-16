import { getDriverByUserId, listDriverQueue } from '@pharmatrack/db';
import { requireRole } from '@/lib/guards';
import { ORDER_STATUS_LABELS, ORDER_STATUS_BADGE } from '@/lib/format';

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

  const queue = await listDriverQueue(driver.id);

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="mb-1 text-2xl font-bold">Your deliveries</h1>
      <p className="mb-4 text-sm text-slate-500">
        {driver.vehicle && `${driver.vehicle} · `}
        {driver.licensePlate ?? ''}
      </p>

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
                <p className="mt-1 text-sm text-slate-500">📍 {o.deliveryAddress}</p>
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
