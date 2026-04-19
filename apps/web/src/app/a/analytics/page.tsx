import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getAdminAnalytics } from '@pharmatrack/db';
import { requireRole } from '@/lib/guards';
import { ORDER_STATUS_BADGE } from '@/lib/format';

type SearchParams = {
  from?: string;
  to?: string;
};

const STATUS_ORDER = [
  'pending_address',
  'address_collected',
  'assigned',
  'picked_up',
  'in_transit',
  'delivered',
  'failed',
  'cancelled',
];

function pct(part: number, total: number) {
  if (total === 0) return '—';
  return `${Math.round((part / total) * 100)}%`;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireRole('admin');
  const sp = await searchParams;

  const filters: { from?: string; to?: string } = {};
  if (sp.from && /^\d{4}-\d{2}-\d{2}$/.test(sp.from)) filters.from = sp.from;
  if (sp.to && /^\d{4}-\d{2}-\d{2}$/.test(sp.to)) filters.to = sp.to;

  const [{ total, statusBreakdown, byPharmacy }, t, tStatus, tCommon] = await Promise.all([
    getAdminAnalytics(filters),
    getTranslations('AdminAnalytics'),
    getTranslations('OrderStatus'),
    getTranslations('Common'),
  ]);

  const statusMap = Object.fromEntries(statusBreakdown.map((r) => [r.status, r.count]));
  const delivered = statusMap['delivered'] ?? 0;
  const failed = statusMap['failed'] ?? 0;
  const active = total - delivered - failed - (statusMap['cancelled'] ?? 0);

  const sortedStatuses = STATUS_ORDER.map((s) => ({
    status: s,
    count: statusMap[s] ?? 0,
  })).filter((r) => r.count > 0);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/a" className="text-sm text-slate-500 hover:underline">
            {t('backToOrders')}
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{t('heading')}</h1>
        </div>

        <form className="flex items-end gap-2 text-sm" action="/a/analytics" method="get">
          <div>
            <label htmlFor="from" className="mb-1 block text-xs text-slate-500">
              {t('filterFrom')}
            </label>
            <input
              id="from"
              name="from"
              type="date"
              defaultValue={sp.from ?? ''}
              className="rounded border border-slate-300 p-1.5"
            />
          </div>
          <div>
            <label htmlFor="to" className="mb-1 block text-xs text-slate-500">
              {t('filterTo')}
            </label>
            <input
              id="to"
              name="to"
              type="date"
              defaultValue={sp.to ?? ''}
              className="rounded border border-slate-300 p-1.5"
            />
          </div>
          <button
            type="submit"
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50"
          >
            {tCommon('apply')}
          </button>
          {(sp.from || sp.to) && (
            <Link
              href="/a/analytics"
              className="rounded px-3 py-1.5 text-slate-500 hover:text-slate-700 hover:underline"
            >
              {tCommon('clear')}
            </Link>
          )}
        </form>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t('cards.total')}
          </div>
          <div className="mt-1 text-3xl font-bold text-slate-900">{total}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t('cards.active')}
          </div>
          <div className="mt-1 text-3xl font-bold text-blue-700">{active}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t('cards.delivered')}
          </div>
          <div className="mt-1 text-3xl font-bold text-green-700">{delivered}</div>
          <div className="text-xs text-slate-400">
            {t('cards.ofTotal', { pct: pct(delivered, total) })}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t('cards.failed')}
          </div>
          <div className="mt-1 text-3xl font-bold text-red-700">{failed}</div>
          <div className="text-xs text-slate-400">
            {t('cards.ofTotal', { pct: pct(failed, total) })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t('statusBreakdown')}
          </h2>
          {sortedStatuses.length === 0 ? (
            <p className="text-sm text-slate-500">{t('noOrders')}</p>
          ) : (
            <div className="space-y-2">
              {sortedStatuses.map(({ status, count }) => (
                <div key={status} className="flex items-center gap-3">
                  <span
                    className={`inline-flex w-36 shrink-0 justify-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      ORDER_STATUS_BADGE[status] ?? 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tStatus(status as Parameters<typeof tStatus>[0]) ?? status}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-400"
                      style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm tabular-nums text-slate-700">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t('byPharmacy')}
          </h2>
          {byPharmacy.length === 0 ? (
            <p className="text-sm text-slate-500">{t('noOrders')}</p>
          ) : (
            <div className="overflow-hidden rounded border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">{t('cols.pharmacy')}</th>
                    <th className="px-3 py-2 text-right">{t('cols.total')}</th>
                    <th className="px-3 py-2 text-right">{t('cols.delivered')}</th>
                    <th className="px-3 py-2 text-right">{t('cols.failed')}</th>
                    <th className="px-3 py-2 text-right">{t('cols.rate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {byPharmacy.map((p) => {
                    const terminal = p.delivered + p.failed;
                    return (
                      <tr key={p.pharmacyId}>
                        <td className="px-3 py-2 font-medium">{p.pharmacyName}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{p.total}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-green-700">
                          {p.delivered}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-red-700">
                          {p.failed}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                          {pct(p.delivered, terminal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
