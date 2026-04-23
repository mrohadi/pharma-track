import { MapSVG } from '@/components/map-svg';
import { requireRole } from '@/lib/guards';
import { getDriverByUserId, listDriverQueue } from '@pharmatrack/db';
import Link from 'next/link';
import { BottomNav } from '../bottom-nav';
import { DeliveryControls } from '../delivery-controls';

const STATUS_STEPS = [
  { id: 'assigned', label: 'Menuju Apotek', icon: '🏥', desc: 'Ambil order dari apotek' },
  { id: 'picked_up', label: 'Order Diambil', icon: '📦', desc: 'Dalam perjalanan ke pasien' },
  { id: 'in_transit', label: 'Tiba di Lokasi', icon: '📍', desc: 'Serahkan obat ke pasien' },
] as const;

// type StepId = (typeof STATUS_STEPS)[number]['id'];

function stepIndex(status: string): number {
  const i = STATUS_STEPS.findIndex((s) => s.id === status);
  return i === -1 ? 0 : i;
}

export default async function ActiveDeliveryPage() {
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
  // Active = assigned / picked_up / in_transit
  const active = queue.filter(
    (o) => o.status === 'assigned' || o.status === 'picked_up' || o.status === 'in_transit',
  );

  if (active.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-5xl">🚴</span>
        <h2 className="text-lg font-bold text-slate-700">Tidak ada delivery aktif</h2>
        <p className="text-sm text-slate-400">Terima order dari tab Beranda.</p>
        <Link
          href="/driver"
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white"
        >
          Ke Beranda
        </Link>
        <BottomNav />
      </div>
    );
  }

  // Show first active order prominently
  const order = active[0];
  const si = stepIndex(order.status);
  const cur = STATUS_STEPS[si];

  return (
    <div className="flex min-h-screen flex-col" style={{ paddingBottom: 80 }}>
      {/* Map */}
      <div className="relative" style={{ height: 220, flexShrink: 0 }}>
        <MapSVG route />
        {/* ETA overlay */}
        <div
          className="absolute left-3 rounded-xl bg-white/95 px-3 py-2 shadow-md"
          style={{ top: 52 }}
        >
          <div className="text-lg font-black text-slate-800">~14 min</div>
          <div className="text-[11px] font-medium text-slate-400">estimasi tiba</div>
        </div>
        <div
          className="absolute right-3 cursor-pointer rounded-xl bg-white/95 px-3 py-2 shadow-md"
          style={{ top: 52 }}
        >
          <span className="text-lg">🧭</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {/* Status stepper */}
        <div className="mb-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex gap-1.5">
            {STATUS_STEPS.map((s, i) => (
              <div
                key={s.id}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{ background: i <= si ? '#2563eb' : '#e2e8f0' }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{cur?.icon}</span>
            <div>
              <div className="text-sm font-bold text-slate-800">{cur?.label}</div>
              <div className="text-xs text-slate-400">{cur?.desc}</div>
            </div>
          </div>
        </div>

        {/* Order card */}
        <div className="mb-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            Order aktif
          </div>
          <div className="space-y-1 text-[13px] leading-relaxed text-slate-600">
            <div>
              👤 Pasien: <span className="font-semibold text-slate-800">{order.patientName}</span>
            </div>
            {order.deliveryAddress && <div>📍 {order.deliveryAddress}</div>}
            <div>💊 {order.medicineText}</div>
          </div>

          {/* Call / message buttons */}
          <div className="mt-3 flex gap-2">
            <a
              href={`tel:${order.patientPhone}`}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 py-2 text-[12px] font-semibold text-slate-700"
            >
              📞 Hubungi
            </a>
            <a
              href={`https://wa.me/${order.patientPhone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 py-2 text-[12px] font-semibold text-slate-700"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>

        {/* Delivery action controls (existing component handles OTP flow) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <DeliveryControls
            orderId={order.id}
            status={order.status}
            podPhotoRequired={order.podPhotoRequired}
          />
        </div>

        {/* Additional orders */}
        {active.length > 1 && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              Order lainnya ({active.length - 1})
            </div>
            <ul className="space-y-2">
              {active.slice(1).map((o) => (
                <li key={o.id} className="text-[13px] text-slate-600">
                  <span className="font-semibold text-slate-800">{o.patientName}</span>
                  {o.deliveryAddress && (
                    <span className="ml-1 text-slate-400">— {o.deliveryAddress}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
