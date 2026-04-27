import Link from 'next/link';
import { RegeneratePinButton } from './regenerate-pin-button';
import {
  listBatchesForAdmin,
  listBatchableOrders,
  listDrivers,
  listPharmaciesForFilter,
} from '@pharmatrack/db';
import { requireRole } from '@/lib/guards';
import { CreateBatchForm } from './create-batch-form';

const PT = {
  primary: 'oklch(0.52 0.18 250)',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  bg: '#f8fafc',
  card: '#ffffff',
};

const BATCH_STATUS: Record<string, { bg: string; color: string; label: string }> = {
  draft: { bg: '#f1f5f9', color: '#475569', label: 'Draft' },
  assigned: { bg: '#eef2ff', color: '#4338ca', label: 'Ditugaskan' },
  picked_up: { bg: '#f5f3ff', color: '#6d28d9', label: 'Sudah diambil' },
  completed: { bg: '#f0fdf4', color: '#15803d', label: 'Selesai' },
  cancelled: { bg: '#fef2f2', color: '#b91c1c', label: 'Dibatalkan' },
};

export default async function BatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ pharmacyId?: string }>;
}) {
  await requireRole('admin');
  const sp = await searchParams;

  const [allBatches, allDrivers, allPharmacies] = await Promise.all([
    listBatchesForAdmin(),
    listDrivers(),
    listPharmaciesForFilter(),
  ]);

  const selectedPharmacyId = sp.pharmacyId ?? allPharmacies[0]?.id;
  const batchableOrders = selectedPharmacyId ? await listBatchableOrders(selectedPharmacyId) : [];

  return (
    <div className="p-4 sm:p-6 lg:p-7">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: PT.text, margin: 0 }}>Batches</h1>
          <p style={{ fontSize: 13, color: PT.muted, marginTop: 4 }}>
            Kelompokkan order dan tugaskan ke driver
          </p>
        </div>
        <Link
          href="/admin/orders"
          style={{
            borderRadius: 8,
            border: `1px solid ${PT.border}`,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            color: PT.muted,
            textDecoration: 'none',
          }}
        >
          ← Orders
        </Link>
      </div>

      {/* Create batch card */}
      <div
        style={{
          background: PT.card,
          borderRadius: 14,
          border: `1px solid ${PT.border}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: 20,
          marginBottom: 24,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, color: PT.text, marginBottom: 16 }}>
          Buat Batch Baru
        </div>

        {/* Pharmacy filter */}
        <form
          action="/admin/batches"
          method="get"
          style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-end' }}
        >
          <div>
            <label
              htmlFor="pharmacyId"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: PT.muted,
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Apotek
            </label>
            <select
              id="pharmacyId"
              name="pharmacyId"
              defaultValue={selectedPharmacyId ?? ''}
              style={{
                borderRadius: 8,
                border: `1px solid ${PT.border}`,
                padding: '8px 12px',
                fontSize: 13,
                color: PT.text,
                background: PT.card,
                fontFamily: 'inherit',
              }}
            >
              {allPharmacies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            style={{
              borderRadius: 8,
              border: `1px solid ${PT.border}`,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              color: PT.muted,
              background: PT.card,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Muat Order
          </button>
        </form>

        {selectedPharmacyId && (
          <CreateBatchForm
            orders={batchableOrders}
            drivers={allDrivers}
            pharmacyId={selectedPharmacyId}
          />
        )}
      </div>

      {/* Batch list */}
      <div
        style={{
          background: PT.card,
          borderRadius: 14,
          border: `1px solid ${PT.border}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${PT.border}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: PT.text }}>
            Semua Batch ({allBatches.length})
          </div>
        </div>

        {allBatches.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: PT.muted, fontSize: 13 }}>
            Belum ada batch.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: PT.bg }}>
                  {['Apotek', 'Driver', 'Order', 'Status', 'PIN', 'Pickup', 'Dibuat'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontSize: 11,
                        fontWeight: 600,
                        color: PT.muted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${PT.border}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allBatches.map((b, i) => {
                  const badge = BATCH_STATUS[b.status] ?? BATCH_STATUS.draft;
                  return (
                    <tr
                      key={b.id}
                      style={{
                        borderBottom: i < allBatches.length - 1 ? `1px solid ${PT.border}` : 'none',
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: PT.text }}>
                        {b.pharmacyName}
                      </td>
                      <td style={{ padding: '12px 16px', color: PT.muted }}>
                        {b.driverName ?? '—'}
                      </td>
                      <td style={{ padding: '12px 16px', color: PT.text, fontWeight: 600 }}>
                        {b.orderCount}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            background: badge.bg,
                            color: badge.color,
                            borderRadius: 999,
                            padding: '2px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {b.status === 'assigned' ? (
                          <RegeneratePinButton batchId={b.id} />
                        ) : (
                          <span style={{ fontSize: 12, color: PT.muted }}>—</span>
                        )}
                      </td>
                      <td
                        style={{ padding: '12px 16px', color: PT.muted, whiteSpace: 'nowrap' }}
                        suppressHydrationWarning
                      >
                        {b.pickupConfirmedAt
                          ? new Date(b.pickupConfirmedAt).toLocaleString('id-ID')
                          : '—'}
                      </td>
                      <td
                        style={{ padding: '12px 16px', color: PT.muted, whiteSpace: 'nowrap' }}
                        suppressHydrationWarning
                      >
                        {new Date(b.createdAt).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
