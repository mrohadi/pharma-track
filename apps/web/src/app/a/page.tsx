import Link from 'next/link';
import { listOrdersForAdmin, getDashboardStats } from '@pharmatrack/db';
import { requireRole } from '@/lib/guards';
import { ORDER_STATUS_BADGE } from '@/lib/format';
import { BarChart } from '@/components/bar-chart';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pct(part: number, total: number) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

export default async function AdminDashboard() {
  await requireRole('admin');

  const [stats, { rows: recentOrders }] = await Promise.all([
    getDashboardStats(),
    listOrdersForAdmin({ pageSize: 5 }),
  ]);

  const totalOrders = stats.statusBreakdown.reduce((s, r) => s + r.count, 0);
  const deliveredAll = stats.statusBreakdown.find((r) => r.status === 'delivered')?.count ?? 0;
  const inTransitAll = stats.statusBreakdown.find((r) => r.status === 'in_transit')?.count ?? 0;
  const pendingAll =
    stats.statusBreakdown
      .filter((r) => !['delivered', 'failed', 'cancelled'].includes(r.status))
      .reduce((s, r) => s + r.count, 0) - inTransitAll;

  const chartData = stats.weekDailyOrders.map((d) => ({
    label: DAYS[new Date(d.day + 'T00:00:00').getDay()]!,
    value: d.count,
  }));

  const weekTotal = stats.weekDailyOrders.reduce((s, d) => s + d.count, 0);

  const deliveredPct = pct(deliveredAll, totalOrders);
  const inTransitPct = pct(inTransitAll, totalOrders);
  const pendingPct = pct(pendingAll, totalOrders);

  return (
    <main className="mx-auto max-w-6xl p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Link
          href="/a/orders"
          className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          View all orders
        </Link>
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-start justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Orders Today
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-lg">
              📦
            </span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900">
            {stats.todayOrders}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-start justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Delivered Today
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-lg">
              ✅
            </span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900">
            {stats.deliveredToday}
          </div>
          {stats.todayOrders > 0 && (
            <div className="mt-1 text-xs font-semibold text-green-600">
              {pct(stats.deliveredToday, stats.todayOrders)}% success
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-start justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Active Drivers
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-lg">
              🚴
            </span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900">
            {stats.activeDrivers}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-start justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Active Pharmacies
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-lg">
              🏥
            </span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900">
            {stats.activePharmacies}
          </div>
        </div>
      </div>

      {/* Chart + status breakdown */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Bar chart — 2/3 width */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="font-semibold text-slate-900">Orders This Week</div>
              <div className="mt-0.5 text-xs text-slate-400">
                {weekTotal} total ·{' '}
                {stats.weekDailyOrders[0]?.day &&
                  new Date(stats.weekDailyOrders[0].day + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                –{' '}
                {stats.weekDailyOrders[6]?.day &&
                  new Date(stats.weekDailyOrders[6].day + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
              </div>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              This week
            </span>
          </div>
          <BarChart data={chartData} height={88} color="#4f7cec" />
        </div>

        {/* Delivery status breakdown — 1/3 width */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 font-semibold text-slate-900">Delivery Status</div>
          <div className="space-y-3">
            {[
              { label: 'Delivered', pct: deliveredPct, color: '#22c55e' },
              { label: 'In Transit', pct: inTransitPct, color: '#f59e0b' },
              { label: 'Pending', pct: pendingPct, color: '#4f7cec' },
            ].map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{s.label}</span>
                  <span className="font-bold text-slate-800">{s.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${s.pct}%`, background: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="font-semibold text-slate-900">Recent Orders</div>
          <Link
            href="/a/orders"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Patient</th>
                  <th className="px-4 py-2.5">Pharmacy</th>
                  <th className="px-4 py-2.5">Driver</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{o.patientName}</td>
                    <td className="px-4 py-3 text-slate-500">{o.pharmacyName}</td>
                    <td className="px-4 py-3 text-slate-500">{o.assignedDriverName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          ORDER_STATUS_BADGE[o.status] ?? 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
