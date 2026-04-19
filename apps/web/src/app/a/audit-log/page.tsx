import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listAuditLog, listAuditLogEntityTypes } from '@pharmatrack/db';
import { requireRole } from '@/lib/guards';

type SearchParams = {
  entityType?: string;
  from?: string;
  to?: string;
  page?: string;
};

function parseFilters(sp: SearchParams) {
  const entityType = sp.entityType?.trim() || undefined;
  const from = sp.from && /^\d{4}-\d{2}-\d{2}$/.test(sp.from) ? sp.from : undefined;
  const to = sp.to && /^\d{4}-\d{2}-\d{2}$/.test(sp.to) ? sp.to : undefined;
  const pageNum = Number.parseInt(sp.page ?? '1', 10);
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;
  return { entityType, from, to, page };
}

function buildQuery(override: Record<string, string | undefined>, base: SearchParams) {
  const merged = { entityType: base.entityType, from: base.from, to: base.to, ...override };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const s = params.toString();
  return s ? `/a/audit-log?${s}` : '/a/audit-log';
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireRole('admin');
  const sp = await searchParams;
  const { entityType, from, to, page } = parseFilters(sp);

  const [{ rows, total, pageSize }, entityTypes, t, tCommon] = await Promise.all([
    listAuditLog({ entityType, from, to, page }),
    listAuditLogEntityTypes(),
    getTranslations('AuditLog'),
    getTranslations('Common'),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasFilters = entityType || from || to;

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/a" className="text-sm text-slate-500 hover:underline">
            {t('backToOrders')}
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{t('heading')}</h1>
          <p className="text-sm text-slate-500">{t('entries', { count: total })}</p>
        </div>

        <form className="flex flex-wrap items-end gap-2 text-sm" action="/a/audit-log" method="get">
          <div>
            <label htmlFor="entityType" className="mb-1 block text-xs text-slate-500">
              {t('filterEntityType')}
            </label>
            <select
              id="entityType"
              name="entityType"
              defaultValue={entityType ?? ''}
              className="rounded border border-slate-300 p-1.5 text-sm"
            >
              <option value="">{tCommon('all')}</option>
              {entityTypes.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="from" className="mb-1 block text-xs text-slate-500">
              {t('filterFrom')}
            </label>
            <input
              id="from"
              name="from"
              type="date"
              defaultValue={from ?? ''}
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
              defaultValue={to ?? ''}
              className="rounded border border-slate-300 p-1.5"
            />
          </div>
          <button
            type="submit"
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50"
          >
            {tCommon('apply')}
          </button>
          {hasFilters && (
            <Link
              href="/a/audit-log"
              className="rounded px-3 py-1.5 text-slate-500 hover:text-slate-700 hover:underline"
            >
              {tCommon('clear')}
            </Link>
          )}
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">{t('noEntries')}</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">{t('cols.time')}</th>
                  <th className="px-3 py-2">{t('cols.actor')}</th>
                  <th className="px-3 py-2">{t('cols.entity')}</th>
                  <th className="px-3 py-2">{t('cols.action')}</th>
                  <th className="px-3 py-2">{t('cols.diff')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((entry) => (
                  <tr key={entry.id} className="align-top">
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-500">
                      {new Date(entry.at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {entry.actorEmail ?? <span className="text-slate-400">{tCommon('system')}</span>}
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-medium text-slate-800">{entry.entityType}</span>
                      <span className="ml-1 font-mono text-xs text-slate-400">
                        {entry.entityId.slice(0, 8)}…
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
                        {entry.action}
                      </span>
                    </td>
                    <td className="max-w-xs px-3 py-2">
                      {entry.diff ? (
                        <details className="cursor-pointer">
                          <summary className="text-xs text-slate-400 hover:text-slate-600">
                            {tCommon('viewDiff')}
                          </summary>
                          <pre className="mt-1 max-h-48 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-700">
                            {JSON.stringify(entry.diff, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              {page > 1 && (
                <Link
                  href={buildQuery({ page: String(page - 1) }, sp)}
                  className="rounded border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
                >
                  {tCommon('prev')}
                </Link>
              )}
              <span className="text-slate-500">
                {tCommon('page', { page, total: totalPages })}
              </span>
              {page < totalPages && (
                <Link
                  href={buildQuery({ page: String(page + 1) }, sp)}
                  className="rounded border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
                >
                  {tCommon('next')}
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
