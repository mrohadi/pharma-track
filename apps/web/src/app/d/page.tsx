import { requireRole } from '@/lib/guards';
import { getDriverByUserId, listDriverQueue, listBatchesForDriver } from '@pharmatrack/db';
import { getTodayEarnings } from '@pharmatrack/db';
import { BottomNav } from './bottom-nav';
import { OnlineToggle } from './online-toggle';
import { PickupForm } from './pickup-form';
import { DeliveryControls } from './delivery-controls';

function formatRupiah(cents: number): string {
  return `Rp${Math.round(cents / 100).toLocaleString('id-ID')}`;
}

export default async function DriverHome() {
  const session = await requireRole('driver');

  const driver = await getDriverByUserId(session.user.id);
  if (!driver) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <h1 className="mb-2 text-xl font-bold text-slate-800">Profil driver tidak ditemukan</h1>
          <p className="text-sm text-red-600">Hubungi admin untuk bantuan.</p>
        </div>
      </div>
    );
  }

  const [queue, driverBatches, todayEarningsCents] = await Promise.all([
    listDriverQueue(driver.id),
    listBatchesForDriver(driver.id),
    getTodayEarnings(driver.id),
  ]);

  const activeBatches = driverBatches.filter(
    (b) => b.status === 'assigned' || b.status === 'picked_up',
  );
  const deliveredToday = driverBatches.filter((b) => b.status === 'completed').length;
  const isOnline = driver.status !== 'offline';

  return (
    <div className="flex min-h-screen flex-col" style={{ paddingBottom: 80 }}>
      {/* Dark header */}
      <header className="bg-slate-800 px-4 pb-5 pt-12">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Selamat datang 👋</div>
            <div className="mt-0.5 text-xl font-extrabold tracking-tight text-white">
              {session.user.name ?? session.user.email}
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white">
            {(session.user.name ?? session.user.email ?? 'D')[0].toUpperCase()}
          </div>
        </div>
        {/* Today stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Terkirim', value: String(deliveredToday) },
            {
              label: 'Penghasilan',
              value: todayEarningsCents > 0 ? formatRupiah(todayEarningsCents) : 'Rp0',
            },
            { label: 'Antrian', value: String(queue.length) },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-2 py-2.5 text-center"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <div className="text-base font-extrabold text-white">{s.value}</div>
              <div className="mt-0.5 text-[10px] font-medium text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="flex-1 px-4 pt-4">
        {/* Online toggle */}
        <OnlineToggle online={isOnline} />

        {/* Active batches */}
        {activeBatches.length > 0 && (
          <section className="mb-4">
            <h2 className="mb-2 text-sm font-bold text-slate-700">Batch Aktif</h2>
            <ul className="space-y-2">
              {activeBatches.map((b) => (
                <li key={b.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">{b.pharmacyName}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        b.status === 'assigned'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-violet-100 text-violet-700'
                      }`}
                    >
                      {b.status === 'assigned' ? 'Menunggu pickup' : 'Sudah diambil'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{b.orderCount} order</p>
                  {b.status === 'assigned' && (
                    <div className="mt-2">
                      <p className="mb-1 text-xs text-slate-400">
                        Masukkan PIN pickup dari apotek:
                      </p>
                      <PickupForm batchId={b.id} />
                    </div>
                  )}
                  {b.status === 'picked_up' && b.pickupConfirmedAt && (
                    <p className="mt-1 text-xs text-green-600">
                      Diambil: {new Date(b.pickupConfirmedAt).toLocaleTimeString('id-ID')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Available orders queue */}
        <h2 className="mb-2 text-sm font-bold text-slate-700">
          Pekerjaan Tersedia ({queue.length})
        </h2>
        {queue.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-400">
              {isOnline ? 'Belum ada order masuk.' : 'Aktifkan status Online untuk menerima order.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {queue.map((o) => (
              <li
                key={o.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="border-b border-slate-100 px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{o.patientName}</div>
                      {o.deliveryAddress && (
                        <div className="mt-0.5 text-xs text-slate-500">📍 {o.deliveryAddress}</div>
                      )}
                    </div>
                    <span
                      className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        o.status === 'assigned'
                          ? 'bg-indigo-100 text-indigo-700'
                          : o.status === 'picked_up'
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {o.status === 'assigned'
                        ? 'Menunggu pickup'
                        : o.status === 'picked_up'
                          ? 'Sudah diambil'
                          : 'Dalam perjalanan'}
                    </span>
                  </div>
                  <div className="mt-1.5 text-xs text-slate-500">💊 {o.medicineText}</div>
                </div>
                <div className="px-4 pb-3 pt-2">
                  <DeliveryControls
                    orderId={o.id}
                    status={o.status}
                    podPhotoRequired={o.podPhotoRequired}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
