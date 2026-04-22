import Link from 'next/link';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { listOrdersForAdmin, listDrivers } from '@pharmatrack/db';
import { OrderStatus } from '@pharmatrack/shared';
import { requireRole } from '@/lib/guards';
import { ORDER_STATUS_BADGE } from '@/lib/format';
import { AssignCell } from '../assign-cell';
import { sendAddressRequestAction } from '../send-address-request';
import { PodPhotoLink } from '@/components/pod-photo-link';
import { OrdersFilters } from './orders-filters.client';

const TERMINAL_STATUSES = new Set(['delivered', 'failed', 'cancelled']);

type SearchParams = {
  status?: string;
  pharmacyId?: string;
  page?: string;
  q?: string;
};

function parseFilters(sp: SearchParams) {
  const statusParsed = OrderStatus.safeParse(sp.status);
  const status = statusParsed.success ? statusParsed.data : undefined;

  const pharmacyId =
    sp.pharmacyId && /^[0-9a-f-]{36}$/i.test(sp.pharmacyId) ? sp.pharmacyId : undefined;

  const pageNum = Number.parseInt(sp.page ?? '1', 10);
  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  const q = sp.q?.trim() ?? '';

  return { status, pharmacyId, page, q };
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
  return s ? `/a/orders?${s}` : '/a/orders';
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'baru saja';
  if (diffMins < 60) return `${diffMins}m lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}j lalu`;
  return `${Math.floor(diffHours / 24)}h lalu`;
}

const STATUS_DOT: Record<string, string> = {
  pending_address: 'bg-amber-400',
  address_collected: 'bg-sky-400',
  assigned: 'bg-indigo-400',
  picked_up: 'bg-violet-400',
  in_transit: 'bg-blue-400',
  delivered: 'bg-green-400',
  failed: 'bg-red-400',
  cancelled: 'bg-slate-400',
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireRole('admin');
  const sp = await searchParams;
  const { status, pharmacyId, page, q } = parseFilters(sp);

  const [{ rows: allRows, total, pageSize }, allDrivers, tStatus, tCommon] = await Promise.all([
    listOrdersForAdmin({ status, pharmacyId, page }),
    listDrivers(),
    getTranslations('OrderStatus'),
    getTranslations('Common'),
  ]);

  // Client-side search filter on the current page
  const rows = q
    ? allRows.filter(
        (o) =>
          o.id.toLowerCase().includes(q.toLowerCase()) ||
          o.patientName.toLowerCase().includes(q.toLowerCase()) ||
          o.pharmacyName.toLowerCase().includes(q.toLowerCase()),
      )
    : allRows;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const baseParams = { status: sp.status, pharmacyId: sp.pharmacyId, q: sp.q };

  return (
    <div style={{ padding: 28 }}>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Order</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Kelola dan pantau semua order pengiriman
          </p>
        </div>
        <Link
          href="/a/orders/new"
          style={{
            background: 'oklch(0.52 0.18 250)',
            color: '#fff',
            borderRadius: 8,
            padding: '9px 18px',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          + Order Baru
        </Link>
      </div>

      {/* Filters: tabs + search + export */}
      <Suspense fallback={null}>
        <OrdersFilters />
      </Suspense>

      {/* Table */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Order ID', 'Pasien', 'Apotek', 'Driver', 'Status', 'Waktu', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 14 }}
                  >
                    Tidak ada order yang sesuai filter.
                  </td>
                </tr>
              ) : (
                rows.map((o) => {
                  const badgeClass = ORDER_STATUS_BADGE[o.status] ?? 'bg-slate-100 text-slate-700';
                  const dotClass = STATUS_DOT[o.status] ?? 'bg-slate-400';
                  const statusLabel =
                    tStatus(o.status as Parameters<typeof tStatus>[0]) ?? o.status;
                  const isTerminal = TERMINAL_STATUSES.has(o.status);

                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* Order ID */}
                      <td
                        style={{
                          padding: '12px 16px',
                          fontWeight: 600,
                          color: '#0f172a',
                          fontFamily: 'monospace',
                          fontSize: 12,
                        }}
                      >
                        #{o.id.slice(0, 8).toUpperCase()}
                      </td>

                      {/* Pasien */}
                      <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 500 }}>
                        {o.patientName}
                      </td>

                      {/* Apotek */}
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{o.pharmacyName}</td>

                      {/* Driver */}
                      <td style={{ padding: '12px 16px' }}>
                        <AssignCell
                          orderId={o.id}
                          drivers={allDrivers}
                          currentDriverId={o.assignedDriverId}
                          currentDriverName={o.assignedDriverName}
                          disabled={isTerminal}
                        />
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
                        >
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotClass}`} />
                          {statusLabel}
                        </span>
                      </td>

                      {/* Waktu */}
                      <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 12 }}>
                        {formatRelativeTime(new Date(o.createdAt))}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {o.podPhotoUrl && <PodPhotoLink photoKey={o.podPhotoUrl} />}
                          {o.status === 'pending_address' && (
                            <form action={sendAddressRequestAction}>
                              <input type="hidden" name="orderId" value={o.id} />
                              <button
                                type="submit"
                                style={{
                                  borderRadius: 6,
                                  background: 'oklch(0.52 0.16 185)',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '4px 10px',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                }}
                              >
                                Minta Alamat
                              </button>
                            </form>
                          )}
                          <button
                            type="button"
                            style={{
                              borderRadius: 6,
                              background: '#fff',
                              color: '#475569',
                              border: '1px solid #e2e8f0',
                              padding: '4px 10px',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 16,
        }}
      >
        <span style={{ fontSize: 13, color: '#64748b' }}>
          Menampilkan {rows.length} dari {total} order
        </span>
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 6 }}>
            {page > 1 && (
              <Link
                href={buildQuery(baseParams, { page: String(page - 1) })}
                style={pageBtnStyle(false)}
              >
                {tCommon('prev')}
              </Link>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <Link
                  key={p}
                  href={buildQuery(baseParams, { page: String(p) })}
                  style={pageBtnStyle(p === page)}
                >
                  {p}
                </Link>
              );
            })}
            {totalPages > 5 && (
              <>
                <span style={pageBtnStyle(false)}>…</span>
                <Link
                  href={buildQuery(baseParams, { page: String(totalPages) })}
                  style={pageBtnStyle(totalPages === page)}
                >
                  {totalPages}
                </Link>
              </>
            )}
            {page < totalPages && (
              <Link
                href={buildQuery(baseParams, { page: String(page + 1) })}
                style={pageBtnStyle(false)}
              >
                {tCommon('next')}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function pageBtnStyle(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    height: 32,
    borderRadius: 8,
    border: `1px solid ${active ? 'oklch(0.52 0.18 250)' : '#e2e8f0'}`,
    background: active ? 'oklch(0.95 0.04 250)' : '#fff',
    color: active ? 'oklch(0.42 0.18 250)' : '#64748b',
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
    padding: '0 8px',
    cursor: 'pointer',
  };
}
