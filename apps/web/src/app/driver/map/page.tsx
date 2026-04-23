import { DeliveryMap } from '@/components/delivery-map';
import { requireRole } from '@/lib/guards';
import { getDriverByUserId, listDriverQueue } from '@pharmatrack/db';
import Link from 'next/link';
import { BottomNav } from '../bottom-nav';

export default async function DriverMapPage() {
  const session = await requireRole('driver');

  const driver = await getDriverByUserId(session.user.id);
  if (!driver) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-red-600">Profil driver tidak ditemukan.</p>
      </div>
    );
  }

  const queue = await listDriverQueue(driver.id);
  const active = queue.filter(
    (o) => o.status === 'assigned' || o.status === 'picked_up' || o.status === 'in_transit',
  );

  if (active.length === 0) {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="text-5xl">🗺️</span>
          <h2 className="text-lg font-bold text-slate-700">Tidak ada delivery aktif</h2>
          <p className="text-sm text-slate-400">Peta akan tampil saat ada order aktif.</p>
          <Link
            href="/driver"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white"
          >
            Ke Beranda
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const order = active[0];
  const address = order.deliveryAddress ?? order.patientName;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 bg-white px-4 pb-3 pt-12 shadow-sm">
        <Link href="/driver/active" className="text-blue-600">
          ← Kembali
        </Link>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-slate-800">{order.patientName}</div>
          <div className="truncate text-xs text-slate-500">{address}</div>
        </div>
      </header>

      {/* Full-screen map */}
      <div className="flex-1 overflow-hidden">
        <DeliveryMap address={address} patientName={order.patientName} />
      </div>

      {/* Other active orders */}
      {active.length > 1 && (
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            Order berikutnya ({active.length - 1})
          </p>
          <ul className="space-y-1">
            {active.slice(1).map((o) => (
              <li key={o.id} className="flex items-center gap-2 text-[13px] text-slate-600">
                <span className="text-slate-400">📍</span>
                <span className="font-semibold text-slate-800">{o.patientName}</span>
                {o.deliveryAddress && (
                  <span className="truncate text-slate-400">— {o.deliveryAddress}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
