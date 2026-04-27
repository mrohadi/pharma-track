import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/guards';
import { getOrderDetail } from '@pharmatrack/db';
import { PodPhotoLink } from '@/components/pod-photo-link';
import { CancelOrderButton } from './cancel-order-button';

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending_address: { bg: '#fef3c7', color: '#92400e', label: 'Menunggu Alamat' },
  address_collected: { bg: '#e0f2fe', color: '#075985', label: 'Alamat Terkumpul' },
  assigned: { bg: '#ede9fe', color: '#5b21b6', label: 'Ditugaskan' },
  picked_up: { bg: '#fae8ff', color: '#86198f', label: 'Diambil' },
  in_transit: { bg: '#dbeafe', color: '#1e40af', label: 'Dalam Perjalanan' },
  delivered: { bg: '#dcfce7', color: '#166534', label: 'Terkirim' },
  failed: { bg: '#fee2e2', color: '#991b1b', label: 'Gagal' },
  cancelled: { bg: '#f1f5f9', color: '#475569', label: 'Dibatalkan' },
};

const ACTION_LABELS: Record<string, string> = {
  'order.created': 'Order dibuat',
  'order.created_via_csv': 'Order dibuat via CSV',
  'order.assigned': 'Driver ditugaskan',
  'order.reassigned': 'Driver diganti',
  'order.cancelled': 'Order dibatalkan',
  'order.delivered': 'Terkirim',
  'order.delivery_failed': 'Pengiriman gagal',
  'address_request.sent': 'Permintaan alamat dikirim',
  'address.submitted_by_patient': 'Alamat diisi pasien',
  'delivery_otp.generated': 'OTP pengiriman dibuat',
  'delivery_otp.failed': 'OTP pengiriman gagal',
};

function fmt(d: Date | null | string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole('admin');
  const { id } = await params;

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const order = await getOrderDetail(id);
  if (!order) notFound();

  const badge = STATUS_BADGE[order.status] ?? {
    bg: '#f1f5f9',
    color: '#475569',
    label: order.status,
  };
  const TERMINAL = new Set(['delivered', 'failed', 'cancelled']);
  const canCancel =
    !TERMINAL.has(order.status) && order.status !== 'picked_up' && order.status !== 'in_transit';

  return (
    <div className="max-w-5xl p-4 sm:p-6 lg:p-7">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/orders"
            style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}
          >
            ← Kembali ke Order
          </Link>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '6px 0 4px' }}>
            #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <span
            style={{
              padding: '3px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              background: badge.bg,
              color: badge.color,
            }}
          >
            {badge.label}
          </span>
        </div>
        {canCancel && <CancelOrderButton orderId={order.id} />}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Patient info */}
          <section
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              padding: 20,
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
              Informasi Pasien
            </h2>
            <dl
              style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 8, fontSize: 13 }}
            >
              <dt style={{ color: '#64748b' }}>Nama</dt>
              <dd style={{ fontWeight: 600, color: '#0f172a', margin: 0 }}>{order.patientName}</dd>
              <dt style={{ color: '#64748b' }}>Telepon</dt>
              <dd style={{ margin: 0, color: '#0f172a' }}>{order.patientPhone}</dd>
              <dt style={{ color: '#64748b' }}>Email</dt>
              <dd style={{ margin: 0, color: '#0f172a' }}>{order.patientEmail ?? '—'}</dd>
              <dt style={{ color: '#64748b' }}>Alamat</dt>
              <dd style={{ margin: 0, color: '#0f172a' }}>{order.deliveryAddress ?? '—'}</dd>
            </dl>
          </section>

          {/* Order info */}
          <section
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              padding: 20,
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
              Detail Order
            </h2>
            <dl
              style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 8, fontSize: 13 }}
            >
              <dt style={{ color: '#64748b' }}>Apotek</dt>
              <dd style={{ fontWeight: 600, margin: 0, color: '#0f172a' }}>{order.pharmacyName}</dd>
              <dt style={{ color: '#64748b' }}>Driver</dt>
              <dd style={{ margin: 0, color: '#0f172a' }}>{order.assignedDriverName ?? '—'}</dd>
              <dt style={{ color: '#64748b' }}>Prioritas</dt>
              <dd style={{ margin: 0, color: '#0f172a', textTransform: 'capitalize' }}>
                {order.priority}
              </dd>
              <dt style={{ color: '#64748b' }}>Pembayaran</dt>
              <dd style={{ margin: 0, color: '#0f172a', textTransform: 'uppercase' }}>
                {order.paymentMode}
              </dd>
              {order.totalCents !== null && (
                <>
                  <dt style={{ color: '#64748b' }}>Total</dt>
                  <dd style={{ margin: 0, color: '#0f172a' }}>
                    Rp {(order.totalCents / 100).toLocaleString('id-ID')}
                  </dd>
                </>
              )}
              {order.driverFeeCents !== null && (
                <>
                  <dt style={{ color: '#64748b' }}>Fee Driver</dt>
                  <dd style={{ margin: 0, color: '#0f172a' }}>
                    Rp {(order.driverFeeCents / 100).toLocaleString('id-ID')}
                  </dd>
                </>
              )}
              {order.notes && (
                <>
                  <dt style={{ color: '#64748b' }}>Catatan</dt>
                  <dd style={{ margin: 0, color: '#0f172a' }}>{order.notes}</dd>
                </>
              )}
              {order.failureReason && (
                <>
                  <dt style={{ color: '#64748b' }}>Alasan Gagal</dt>
                  <dd style={{ margin: 0, color: '#dc2626', fontWeight: 600 }}>
                    {order.failureReason}
                  </dd>
                </>
              )}
              {order.failureNote && (
                <>
                  <dt style={{ color: '#64748b' }}>Catatan Gagal</dt>
                  <dd style={{ margin: 0, color: '#0f172a' }}>{order.failureNote}</dd>
                </>
              )}
            </dl>
          </section>

          {/* Medicine / items */}
          <section
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              padding: 20,
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
              Obat
            </h2>
            {order.items.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <th
                      style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        color: '#64748b',
                        fontWeight: 600,
                      }}
                    >
                      Nama
                    </th>
                    <th
                      style={{
                        padding: '8px 12px',
                        textAlign: 'right',
                        color: '#64748b',
                        fontWeight: 600,
                      }}
                    >
                      Qty
                    </th>
                    <th
                      style={{
                        padding: '8px 12px',
                        textAlign: 'right',
                        color: '#64748b',
                        fontWeight: 600,
                      }}
                    >
                      Harga
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '8px 12px', color: '#0f172a' }}>{item.name}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#475569' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#475569' }}>
                        {item.unitPriceCents !== null
                          ? `Rp ${(item.unitPriceCents / 100).toLocaleString('id-ID')}`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ fontSize: 13, color: '#64748b' }}>{order.medicineText}</p>
            )}
          </section>

          {/* Audit timeline */}
          <section
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              padding: 20,
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
              Riwayat
            </h2>
            {order.auditEntries.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Belum ada aktivitas.</p>
            ) : (
              <ol
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                }}
              >
                {order.auditEntries.map((entry, i) => (
                  <li key={entry.id} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                    {/* vertical line */}
                    {i < order.auditEntries.length - 1 && (
                      <span
                        style={{
                          position: 'absolute',
                          left: 7,
                          top: 22,
                          bottom: 0,
                          width: 2,
                          background: '#e2e8f0',
                        }}
                      />
                    )}
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        background: '#e2e8f0',
                        border: '2px solid #94a3b8',
                        flexShrink: 0,
                        marginTop: 3,
                        zIndex: 1,
                      }}
                    />
                    <div style={{ paddingBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        {ACTION_LABELS[entry.action] ?? entry.action}
                      </div>
                      <div
                        style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}
                        suppressHydrationWarning
                      >
                        {fmt(entry.at)} {entry.actorEmail ? `· ${entry.actorEmail}` : '· sistem'}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Timestamps */}
          <section
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              padding: 20,
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
              Waktu
            </h2>
            <dl style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              {[
                { label: 'Dibuat', value: fmt(order.createdAt) },
                { label: 'Diperbarui', value: fmt(order.updatedAt) },
                { label: 'Diambil', value: fmt(order.pickedUpAt) },
                { label: 'Terkirim', value: fmt(order.deliveredAt) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}
                >
                  <dt style={{ color: '#64748b', flexShrink: 0 }}>{label}</dt>
                  <dd
                    style={{
                      margin: 0,
                      color: '#0f172a',
                      fontWeight: value === '—' ? 400 : 600,
                      textAlign: 'right',
                    }}
                    suppressHydrationWarning
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* POD photo */}
          {order.podPhotoUrl && (
            <section
              style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 20,
              }}
            >
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                Foto POD
              </h2>
              <PodPhotoLink photoKey={order.podPhotoUrl} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
