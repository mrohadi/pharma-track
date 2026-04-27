import Link from 'next/link';
import { listRecentOrdersForPharmacy, getPharmacyById } from '@pharmatrack/db';
import { getPharmacyDashboardStats } from '@pharmatrack/db';
import { requireRole } from '@/lib/guards';
import { maskPhone } from '@/lib/format';
import { OrderActions } from './_components/order-actions.client';

export default async function PharmacyHome() {
  const session = await requireRole('pharmacy');
  const pharmacyId = session.user.pharmacyId as string | undefined;

  const [stats, recent, pharmacy] = await Promise.all([
    pharmacyId ? getPharmacyDashboardStats(pharmacyId) : null,
    pharmacyId ? listRecentOrdersForPharmacy(pharmacyId, 10) : [],
    pharmacyId ? getPharmacyById(pharmacyId) : null,
  ]);

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const pendingOrders = recent.filter((o) =>
    ['pending_address', 'address_collected'].includes(o.status),
  );
  const inTransitOrders = recent.filter((o) =>
    ['assigned', 'picked_up', 'in_transit'].includes(o.status),
  );
  const activeOrders = [...pendingOrders, ...inTransitOrders];

  const statusLabel: Record<string, string> = {
    pending_address: 'Menunggu',
    address_collected: 'Menunggu',
    assigned: 'Dalam Perjalanan',
    picked_up: 'Dalam Perjalanan',
    in_transit: 'Dalam Perjalanan',
    delivered: 'Terkirim',
    failed: 'Gagal',
    cancelled: 'Dibatalkan',
  };

  const statusBadge: Record<string, string> = {
    pending_address: 'bg-blue-100 text-blue-700',
    address_collected: 'bg-blue-100 text-blue-700',
    assigned: 'bg-amber-100 text-amber-700',
    picked_up: 'bg-amber-100 text-amber-700',
    in_transit: 'bg-amber-100 text-amber-700',
    delivered: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-500',
  };

  return (
    <div className="p-7">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <p className="mt-1 text-[13.5px] text-slate-500" suppressHydrationWarning>
            {pharmacy?.name ?? 'Apotek'} · {today}
          </p>
        </div>
        <Link
          href="/pharmacy/orders/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New Order
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <StatCard
          label="Order Hari Ini"
          value={stats?.todayOrders ?? 0}
          sub={stats?.todayOrders ? `↑ dari kemarin` : undefined}
          icon="📦"
          color="blue"
        />
        <StatCard
          label="Terkirim"
          value={stats?.deliveredToday ?? 0}
          sub={
            stats && stats.todayOrders > 0
              ? `${Math.round((stats.deliveredToday / stats.todayOrders) * 100)}% berhasil`
              : undefined
          }
          icon="✅"
          color="green"
        />
        <StatCard
          label="Dalam Perjalanan"
          value={stats?.inTransitToday ?? 0}
          sub="Rata-rata ETA 14 mnt"
          icon="🚴"
          color="amber"
        />
        <StatCard
          label="Menunggu"
          value={stats?.pendingToday ?? 0}
          sub="Menunggu driver"
          icon="⏳"
          color="teal"
        />
      </div>

      {/* Main grid: 2fr / 1fr */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        {/* Active orders card */}
        <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <span className="text-[15px] font-bold text-slate-800">Order Tertunda</span>
            {pendingOrders.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {pendingOrders.length} menunggu
              </span>
            )}
          </div>

          {activeOrders.length === 0 ? (
            <div className="px-5 py-14 text-center text-sm text-slate-400">
              Tidak ada order aktif.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activeOrders.map((o) => {
                const isPending = ['pending_address', 'address_collected'].includes(o.status);
                const minutesAgo = Math.floor(
                  (Date.now() - new Date(o.createdAt).getTime()) / 60_000,
                );
                const timeAgo =
                  minutesAgo < 60
                    ? `${minutesAgo} mnt lalu`
                    : `${Math.floor(minutesAgo / 60)} jam lalu`;

                return (
                  <li key={o.id} className="px-5 py-3.5">
                    <div className="mb-1.5 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">#{o.id.slice(0, 6)}</span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge[o.status] ?? 'bg-slate-100 text-slate-500'}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          {statusLabel[o.status] ?? o.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{timeAgo}</span>
                    </div>

                    <div className="text-[13px] font-medium text-slate-800">{o.patientName}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{maskPhone(o.patientPhone)}</div>

                    {o.deliveryAddress && (
                      <div className="mt-1 text-xs text-slate-500">📍 {o.deliveryAddress}</div>
                    )}

                    {o.items.length > 0 && (
                      <div className="mt-1 text-xs text-slate-500">
                        💊 {o.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                      </div>
                    )}

                    {isPending && <OrderActions orderId={o.id} />}

                    {!isPending && (
                      <div className="mt-1 text-xs text-slate-500">
                        🚴 Driver:{' '}
                        <span className="font-semibold text-slate-700">{o.driverName ?? '—'}</span>{' '}
                        · ETA ~14 mnt
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3.5">
          {/* Quick actions */}
          <div className="rounded-[14px] border border-slate-200 bg-white p-5">
            <p className="mb-3.5 text-[14px] font-bold text-slate-800">Aksi Cepat</p>
            <div className="flex flex-col gap-2">
              <Link
                href="/pharmacy/orders/new"
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
              >
                + Buat Order
              </Link>
              <Link
                href="/pharmacy/history"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Lihat Riwayat
              </Link>
            </div>
          </div>

          {/* Daily summary */}
          <div className="rounded-[14px] border border-slate-200 bg-white p-5">
            <p className="mb-3 text-[14px] font-bold text-slate-800">Ringkasan Hari Ini</p>
            <div className="divide-y divide-slate-100">
              <SummaryRow
                label="Total Penjualan"
                value={
                  stats && stats.totalSalesTodayCents > 0
                    ? `Rp${(stats.totalSalesTodayCents / 100).toLocaleString('id-ID')}`
                    : '—'
                }
              />
              <SummaryRow
                label="Rata-rata Waktu Kirim"
                value={stats?.avgDeliveryMinutes != null ? `${stats.avgDeliveryMinutes} mnt` : '—'}
              />
              <SummaryRow label="Rating Driver" value="—" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: string;
  color: 'blue' | 'green' | 'amber' | 'teal';
}) {
  const iconBg = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    teal: 'bg-teal-50 text-teal-600',
  };

  return (
    <div className="rounded-[14px] border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-start justify-between">
        <span className="text-[13px] font-medium text-slate-500">{label}</span>
        <span className={`rounded-xl p-2 text-xl ${iconBg[color]}`}>{icon}</span>
      </div>
      <div className="text-[28px] font-extrabold leading-none tracking-tight text-slate-800">
        {value}
      </div>
      {sub && <div className="mt-1.5 text-xs font-semibold text-green-600">{sub}</div>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 text-[13px]">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
}
