import Link from 'next/link';
import { listOrdersForAdmin, listPharmaciesForFilter, listDrivers } from '@pharmatrack/db';
import { OrderStatus } from '@pharmatrack/shared';
import { requireRole } from '@/lib/guards';
import { ORDER_STATUS_LABELS, ORDER_STATUS_BADGE, maskPhone } from '@/lib/format';
import { AssignCell } from './assign-cell';
import { sendAddressRequestAction } from './send-address-request';

const TERMINAL_STATUSES = new Set(['delivered', 'failed', 'cancelled']);

type SearchParams = {
  status?: string;
  pharmacyId?: string;
  page?: string;
};

function parseFilters(sp: SearchParams) {
  const statusParsed = OrderStatus.safeParse(sp.status);
  const status = statusParsed.success ? statusParsed.data : undefined;

  // Only pass through obviously-UUID-shaped pharmacy ids; anything else is ignored.
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

  const [{ rows, total, pageSize }, allPharmacies, allDrivers] = await Promise.all([
    listOrdersForAdmin({ status, pharmacyId, page }),
    listPharmaciesForFilter(),
    listDrivers(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const baseParams = { status: sp.status, pharmacyId: sp.pharmacyId };

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Orders</h1>

      <form className="mb-4 flex flex-wrap items-end gap-3 text-sm" action="/a" method="get">
        <div>
          <label htmlFor="status" className="mb-1 block text-xs text-slate-500">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={sp.status ?? ''}
            className="rounded border border-slate-300 p-1.5"
          >
            <option value="">All</option>
            {OrderStatus.options.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pharmacyId" className="mb-1 block text-xs text-slate-500">
            Pharmacy
          </label>
          <select
            id="pharmacyId"
            name="pharmacyId"
            defaultValue={sp.pharmacyId ?? ''}
            className="rounded border border-slate-300 p-1.5"
          >
            <option value="">All</option>
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
          Apply
        </button>
        {(sp.status || sp.pharmacyId) && (
          <Link
            href="/a"
            className="rounded px-3 py-1.5 text-slate-500 hover:text-slate-700 hover:underline"
          >
            Clear
          </Link>
        )}
        <div className="ml-auto text-xs text-slate-500">
          {total} order{total === 1 ? '' : 's'}
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-600">No orders match.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Patient</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Pharmacy</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Driver</th>
                <th className="px-3 py-2">Actions</th>
                <th className="px-3 py-2">Created</th>
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
                      {ORDER_STATUS_LABELS[o.status] ?? o.status}
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
                          Request address
                        </button>
                      </form>
                    )}
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
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildQuery(baseParams, { page: String(page - 1) })}
                className="rounded border border-slate-300 bg-white px-3 py-1 hover:bg-slate-50"
              >
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildQuery(baseParams, { page: String(page + 1) })}
                className="rounded border border-slate-300 bg-white px-3 py-1 hover:bg-slate-50"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
