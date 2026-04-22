import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listRecentOrdersForPharmacy } from '@pharmatrack/db';
import { getPharmacyDashboardStats } from '@pharmatrack/db';
import { requireRole } from '@/lib/guards';
import { maskPhone } from '@/lib/format';

export default async function PharmacyHome() {
  const [session, t] = await Promise.all([
    requireRole('pharmacy'),
    getTranslations('PharmacyPage'),
  ]);
  const pharmacyId = session.user.pharmacyId as string | undefined;

  const [stats, recent] = await Promise.all([
    pharmacyId ? getPharmacyDashboardStats(pharmacyId) : null,
    pharmacyId ? listRecentOrdersForPharmacy(pharmacyId, 10) : [],
  ]);

  const tStatus = await getTranslations('OrderStatus');

  const pendingOrders = recent.filter((o) =>
    ['pending_address', 'address_collected'].includes(o.status),
  );
  const inTransitOrders = recent.filter((o) =>
    ['assigned', 'picked_up', 'in_transit'].includes(o.status),
  );

  const statusBadge: Record<string, string> = {
    pending_address: 'bg-blue-100 text-blue-700',
    address_collected: 'bg-teal-100 text-teal-700',
    assigned: 'bg-amber-100 text-amber-700',
    picked_up: 'bg-amber-100 text-amber-700',
    in_transit: 'bg-amber-100 text-amber-700',
    delivered: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-500',
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('heading')}</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/p/history"
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Riwayat Order
          </Link>
          <Link
            href="/p/orders/new"
            className="bg-brand-600 hover:bg-brand-700 rounded px-4 py-2 text-sm font-medium text-white"
          >
            + Order Baru
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Order Hari Ini" value={stats.todayOrders} icon="📦" color="blue" />
          <StatCard
            label="Terkirim"
            value={stats.deliveredToday}
            sub={
              stats.todayOrders > 0
                ? `${Math.round((stats.deliveredToday / stats.todayOrders) * 100)}% berhasil`
                : undefined
            }
            icon="✅"
            color="green"
          />
          <StatCard label="Dalam Perjalanan" value={stats.inTransitToday} icon="🚴" color="amber" />
          <StatCard
            label="Menunggu"
            value={stats.pendingToday}
            sub="Menunggu konfirmasi"
            icon="⏳"
            color="teal"
          />
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Pending + in-transit orders */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <span className="font-semibold text-slate-800">Order Aktif</span>
            {pendingOrders.length + inTransitOrders.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {pendingOrders.length + inTransitOrders.length} aktif
              </span>
            )}
          </div>

          {pendingOrders.length + inTransitOrders.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-400">
              Tidak ada order aktif.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {[...pendingOrders, ...inTransitOrders].map((o) => (
                <li key={o.id} className="px-5 py-4">
                  <div className="mb-1 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-600">
                        #{o.id.slice(0, 8)}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[o.status] ?? 'bg-slate-100 text-slate-500'}`}
                      >
                        {tStatus(o.status as Parameters<typeof tStatus>[0]) ?? o.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(o.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-800">{o.patientName}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{maskPhone(o.patientPhone)}</div>
                  {o.items.length > 0 && (
                    <div className="mt-1 text-xs text-slate-500">
                      💊 {o.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                    </div>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Link
                      href="/p/orders/new"
                      className="rounded border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right column: Quick actions + daily summary */}
        <div className="flex flex-col gap-4">
          {/* Quick actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="mb-4 font-semibold text-slate-800">Aksi Cepat</p>
            <div className="flex flex-col gap-2">
              <Link
                href="/p/orders/new"
                className="bg-brand-600 hover:bg-brand-700 w-full rounded px-4 py-2.5 text-center text-sm font-medium text-white"
              >
                + Buat Order Baru
              </Link>
              <Link
                href="/p/history"
                className="w-full rounded border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Lihat Riwayat
              </Link>
              <Link
                href="/p/settings"
                className="w-full rounded border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Pengaturan Apotek
              </Link>
            </div>
          </div>

          {/* Daily summary */}
          {stats && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="mb-4 font-semibold text-slate-800">Ringkasan Hari Ini</p>
              <dl className="divide-y divide-slate-100">
                <SummaryRow
                  label="Total Penjualan"
                  value={
                    stats.totalSalesTodayCents > 0
                      ? `Rp${(stats.totalSalesTodayCents / 100).toLocaleString('id-ID')}`
                      : '—'
                  }
                />
                <SummaryRow label="Order Berhasil" value={`${stats.deliveredToday}`} />
                <SummaryRow label="Sedang Berjalan" value={`${stats.inTransitToday}`} />
                <SummaryRow label="Menunggu" value={`${stats.pendingToday}`} />
              </dl>
            </div>
          )}
        </div>
      </div>
    </main>
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
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    teal: 'bg-teal-50 text-teal-700',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className={`rounded-lg p-2 text-xl ${colors[color]}`}>{icon}</span>
      </div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}
