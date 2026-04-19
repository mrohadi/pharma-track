import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listOrdersForAdmin, listPharmaciesForFilter, listDrivers } from '@pharmatrack/db';
import { OrderStatus } from '@pharmatrack/shared';
import { requireRole } from '@/lib/guards';
import { ORDER_STATUS_BADGE, maskPhone } from '@/lib/format';
import { AssignCell } from './assign-cell';
import { sendAddressRequestAction } from './send-address-request';
import { PodPhotoLink } from '@/components/pod-photo-link';
import { ExportButton } from './export-button';

const TERMINAL_STATUSES = new Set(['delivered', 'failed', 'cancelled']);

type SearchParams = {
  status?: string;
  pharmacyId?: string;
  page?: string;
  from?: string;
  to?: string;
};

function parseFilters(sp: SearchParams) {
  const statusParsed = OrderStatus.safeParse(sp.status);
  const status = statusParsed.success ? statusParsed.data : undefined;

  const pharmacyId =
    sp.pharmacyId && /^[0-9a-f-]{36}$/i.test(sp.pharmacyId) ? sp.pharmacyId : undefined;

  const pageNum = Number.parseInt(sp.page ?? '1', 10);
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  return { status, pharmacyId, page };
}

function buildQuery(
  base: Record<string, string | undefined>,
  override: Record<string, string | undefined>,
) {
  const merged = { ...base, ...override };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const s = params.toString();
  return s ? `/a?${s}` : '/a';
}

export default async function AdminHome({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireRole('admin');
  const sp = await searchParams;
  const { status, pharmacyId, page } = parseFilters(sp);

  const [{ rows, total, pageSize }, allPharmacies, allDrivers, t, tStatus, tCommon] =
    await Promise.all([
      listOrdersForAdmin({ status, pharmacyId, page }),
      listPharmaciesForFilter(),
      listDrivers(),
      getTranslations('AdminPage'),
      getTranslations('OrderStatus'),
      getTranslations('Common'),
    ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const baseParams = { status: sp.status, pharmacyId: sp.pharmacyId };

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('heading')}</h1>
        <div className="flex items-center gap-2">
          <ExportButton status={sp.status} pharmacyId={sp.pharmacyId} />
          <Link
            href="/a/analytics"
            className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t('analytics')}
          </Link>
          <Link
            href="/a/batches"
            className="bg-brand-600 hover:bg-brand-700 rounded px-4 py-2 text-sm font-medium text-white"
          >
            {t('manageBatches')}
          </Link>
        </div>
      </div>

      <form className="mb-4 flex flex-wrap items-end gap-3 text-sm" action="/a" method="get">
        <div>
          <label htmlFor="status" className="mb-1 block text-xs text-slate-500">
            {t('filterStatus')}
          </label>
          <select
            id="status"
            name="status"
            defaultValue={sp.status ?? ''}
            className="rounded border border-slate-300 p-1.5"
          >
            <option value="">{tCommon('all')}</option>
            {OrderStatus.options.map((s: string) => (
              <option key={s} value={s}>
                {tStatus(s as Parameters<typeof tStatus>[0]) ?? s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pharmacyId" className="mb-1 block text-xs text-slate-500">
            {t('filterPharmacy')}
          </label>
          <select
            id="pharmacyId"
            name="pharmacyId"
            defaultValue={sp.pharmacyId ?? ''}
            className="rounded border border-slate-300 p-1.5"
          >
            <option value="">{tCommon('all')}</option>
            {allPharmacies.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50"
        >
          {tCommon('apply')}
        </button>
        {(sp.status || sp.pharmacyId) && (
          <Link
            href="/a"
            className="rounded px-3 py-1.5 text-slate-500 hover:text-slate-700 hover:underline"
          >
            {tCommon('clear')}
          </Link>
        )}
        <div className="ml-auto text-xs text-slate-500">
          {t('orderCount', { count: total })}
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-600">{t('noOrders')}</p>
      ) : (
        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">{t('cols.patient')}</th>
                <th className="px-3 py-2">{t('cols.phone')}</th>
                <th className="px-3 py-2">{t('cols.pharmacy')}</th>
                <th className="px-3 py-2">{t('cols.status')}</th>
                <th className="px-3 py-2">{t('cols.driver')}</th>
                <th className="px-3 py-2">{t('cols.actions')}</th>
                <th className="px-3 py-2">{t('cols.pod')}</th>
                <th className="px-3 py-2">{t('cols.created')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((o) => (
                <tr key={o.id}>
                  <td className="px-3 py-2">{o.patientName}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">
                    {maskPhone(o.patientPhone)}
                  </td>
                  <td className="px-3 py-2">{o.pharmacyName}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        ORDER_STATUS_BADGE[o.status] ?? 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tStatus(o.status as Parameters<typeof tStatus>[0]) ?? o.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <AssignCell
                      orderId={o.id}
                      drivers={allDrivers}
                      currentDriverId={o.assignedDriverId}
                      currentDriverName={o.assignedDriverName}
                      disabled={TERMINAL_STATUSES.has(o.status)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    {o.status === 'pending_address' && (
                      <form action={sendAddressRequestAction}>
                        <input type="hidden" name="orderId" value={o.id} />
                        <button
                          type="submit"
                          className="rounded bg-teal-600 px-2 py-1 text-xs font-medium text-white hover:bg-teal-700"
                        >
                          {t('requestAddress')}
                        </button>
                      </form>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {o.podPhotoUrl ? <PodPhotoLink photoKey={o.podPhotoUrl} /> : null}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-slate-500">
            {tCommon('page', { page, total: totalPages })}
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildQuery(baseParams, { page: String(page - 1) })}
                className="rounded border border-slate-300 bg-white px-3 py-1 hover:bg-slate-50"
              >
                {tCommon('prev')}
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildQuery(baseParams, { page: String(page + 1) })}
                className="rounded border border-slate-300 bg-white px-3 py-1 hover:bg-slate-50"
              >
                {tCommon('next')}
              </Link>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
