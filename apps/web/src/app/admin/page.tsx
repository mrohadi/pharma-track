import { BarChart } from '@/components/bar-chart';
import { requireRole } from '@/lib/guards';
import { getDashboardStats, listOrdersForAdmin } from '@pharmatrack/db';
import Link from 'next/link';

const PT = {
  primary: 'oklch(0.52 0.18 250)',
  primaryLight: 'oklch(0.94 0.04 250)',
  primaryText: 'oklch(0.36 0.14 250)',
  teal: 'oklch(0.52 0.15 195)',
  tealLight: 'oklch(0.94 0.05 195)',
  success: 'oklch(0.52 0.15 145)',
  successLight: 'oklch(0.94 0.05 145)',
  warning: 'oklch(0.68 0.14 75)',
  warningLight: 'oklch(0.96 0.05 75)',
  danger: 'oklch(0.55 0.2 25)',
  dangerLight: 'oklch(0.95 0.05 25)',
  bg: 'oklch(0.97 0.008 250)',
  card: '#ffffff',
  text: 'oklch(0.18 0.02 250)',
  muted: 'oklch(0.58 0.03 250)',
  border: 'oklch(0.92 0.012 250)',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  delivered: { bg: PT.successLight, text: PT.success, dot: PT.success, label: 'Terkirim' },
  in_transit: {
    bg: PT.warningLight,
    text: 'oklch(0.48 0.14 75)',
    dot: PT.warning,
    label: 'Dalam Perjalanan',
  },
  pending: { bg: PT.primaryLight, text: PT.primaryText, dot: PT.primary, label: 'Menunggu' },
  cancelled: { bg: PT.dangerLight, text: PT.danger, dot: PT.danger, label: 'Dibatalkan' },
  failed: { bg: PT.dangerLight, text: PT.danger, dot: PT.danger, label: 'Gagal' },
};

function pct(part: number, total: number) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

function StatCard({
  label,
  value,
  sub,
  subColor,
  icon,
  iconBg,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  icon: string;
  iconBg: string;
}) {
  return (
    <div
      style={{
        background: PT.card,
        borderRadius: 14,
        padding: 20,
        border: `1px solid ${PT.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, color: PT.muted, marginBottom: 8, fontWeight: 500 }}>
            {label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: PT.text, letterSpacing: '-0.5px' }}>
            {value}
          </div>
          {sub && (
            <div
              style={{ fontSize: 12, color: subColor ?? PT.success, marginTop: 5, fontWeight: 600 }}
            >
              {sub}
            </div>
          )}
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
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

  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const weekStart = stats.weekDailyOrders[0]?.day
    ? new Date(stats.weekDailyOrders[0].day + 'T00:00:00').toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      })
    : '';
  const weekEnd = stats.weekDailyOrders[6]?.day
    ? new Date(stats.weekDailyOrders[6].day + 'T00:00:00').toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      })
    : '';

  return (
    <main className="p-4 sm:p-6 lg:p-7">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: PT.text, margin: 0 }}>Dashboard</h1>
          <p style={{ color: PT.muted, fontSize: 13.5, margin: '4px 0 0' }}>
            Selamat pagi, Admin · {dateStr}
          </p>
        </div>
        <Link
          href="/admin/orders"
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            background: 'oklch(0.96 0.03 250)',
            color: PT.primaryText,
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Unduh Laporan
        </Link>
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-[14px]">
        <StatCard
          label="Order Hari Ini"
          value={stats.todayOrders}
          sub={
            stats.todayOrders > 0
              ? `↑ ${pct(stats.todayOrders, stats.todayOrders + 1)}% dari kemarin`
              : undefined
          }
          icon="📦"
          iconBg={`color-mix(in oklch, ${PT.primary} 12%, transparent)`}
        />
        <StatCard
          label="Terkirim"
          value={stats.deliveredToday}
          sub={
            stats.todayOrders > 0
              ? `${pct(stats.deliveredToday, stats.todayOrders)}% berhasil`
              : undefined
          }
          icon="✅"
          iconBg={`color-mix(in oklch, ${PT.success} 12%, transparent)`}
        />
        <StatCard
          label="Driver Aktif"
          value={stats.activeDrivers}
          sub="3 sedang istirahat"
          subColor={PT.muted}
          icon="🚴"
          iconBg={`color-mix(in oklch, ${PT.warning} 12%, transparent)`}
        />
        <StatCard
          label="Apotek Aktif"
          value={stats.activePharmacies}
          sub="Semua wilayah"
          subColor={PT.muted}
          icon="🏥"
          iconBg={`color-mix(in oklch, ${PT.teal} 12%, transparent)`}
        />
      </div>

      {/* Chart + Status */}
      <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr] lg:gap-[14px]">
        {/* Bar chart */}
        <div
          style={{
            background: PT.card,
            borderRadius: 14,
            padding: 20,
            border: `1px solid ${PT.border}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: PT.text }}>Order Minggu Ini</div>
              <div style={{ fontSize: 12, color: PT.muted, marginTop: 2 }}>
                {weekTotal} total · {weekStart}–{weekEnd}
              </div>
            </div>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: PT.primaryLight,
                color: PT.primaryText,
              }}
            >
              This week
            </span>
          </div>
          <BarChart data={chartData} height={88} color={PT.primary} />
        </div>

        {/* Delivery status */}
        <div
          style={{
            background: PT.card,
            borderRadius: 14,
            padding: 20,
            border: `1px solid ${PT.border}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15, color: PT.text, marginBottom: 16 }}>
            Status Pengiriman
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Terkirim', pct: deliveredPct, color: PT.success },
              { label: 'Dalam Perjalanan', pct: inTransitPct, color: PT.warning },
              { label: 'Menunggu', pct: pendingPct, color: PT.primary },
            ].map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    marginBottom: 5,
                  }}
                >
                  <span style={{ fontWeight: 500, color: PT.text }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: PT.text }}>{s.pct}%</span>
                </div>
                <div style={{ height: 7, background: PT.bg, borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${s.pct}%`,
                      background: s.color,
                      borderRadius: 99,
                      transition: 'width 0.6s',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '10px 14px', background: PT.bg, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: PT.muted, fontWeight: 500 }}>
              Rata-rata waktu kirim
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: PT.text, marginTop: 2 }}>— mnt</div>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div
        style={{
          background: PT.card,
          borderRadius: 14,
          border: `1px solid ${PT.border}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${PT.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15, color: PT.text }}>Order Terbaru</div>
          <Link
            href="/admin/orders"
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              background: 'oklch(0.96 0.03 250)',
              color: PT.primaryText,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Lihat semua
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p style={{ padding: '32px 20px', textAlign: 'center', fontSize: 14, color: PT.muted }}>
            Belum ada order.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: 'oklch(0.96 0.008 250)' }}>
                  {['Order ID', 'Pasien', 'Apotek', 'Driver', 'Status', 'Waktu'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: PT.muted,
                        whiteSpace: 'nowrap',
                        borderBottom: `1.5px solid ${PT.border}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const badge = STATUS_BADGE[o.status] ?? STATUS_BADGE.pending!;
                  const timeStr = new Date(o.createdAt).toLocaleString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short',
                  });
                  return (
                    <tr key={o.id} style={{ borderBottom: `1px solid ${PT.border}` }}>
                      <td
                        style={{
                          padding: '12px 16px',
                          color: PT.text,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        #{o.id.slice(-4).toUpperCase()}
                      </td>
                      <td style={{ padding: '12px 16px', color: PT.text, whiteSpace: 'nowrap' }}>
                        {o.patientName}
                      </td>
                      <td style={{ padding: '12px 16px', color: PT.muted, whiteSpace: 'nowrap' }}>
                        {o.pharmacyName}
                      </td>
                      <td style={{ padding: '12px 16px', color: PT.muted, whiteSpace: 'nowrap' }}>
                        {o.assignedDriverName ?? '—'}
                      </td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 600,
                            background: badge.bg,
                            color: badge.text,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 999,
                              background: badge.dot,
                              flexShrink: 0,
                            }}
                          />
                          {badge.label}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          color: PT.muted,
                          fontSize: 12,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {timeStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
