import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getAdminAnalytics } from '@pharmatrack/db';
import { requireRole } from '@/lib/guards';
import { ORDER_STATUS_BADGE } from '@/lib/format';
import { BarChart } from '@/components/bar-chart';

type SearchParams = {
  from?: string;
  to?: string;
};

const PT = {
  primary: 'oklch(0.52 0.18 250)',
  primaryLight: 'oklch(0.94 0.04 250)',
  primaryText: 'oklch(0.36 0.14 250)',
  success: 'oklch(0.52 0.15 145)',
  successLight: 'oklch(0.94 0.05 145)',
  warning: 'oklch(0.68 0.14 75)',
  warningLight: 'oklch(0.96 0.05 75)',
  danger: 'oklch(0.55 0.2 25)',
  dangerLight: 'oklch(0.95 0.05 25)',
  teal: 'oklch(0.52 0.15 195)',
  tealLight: 'oklch(0.94 0.05 195)',
  bg: 'oklch(0.97 0.008 250)',
  card: '#ffffff',
  text: 'oklch(0.18 0.02 250)',
  muted: 'oklch(0.58 0.03 250)',
  border: 'oklch(0.92 0.012 250)',
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

const STATUS_BAR_COLOR: Record<string, string> = {
  delivered: PT.success,
  in_transit: PT.warning,
  pending_address: PT.primary,
  address_collected: PT.primary,
  assigned: PT.primary,
  picked_up: PT.primary,
  failed: PT.danger,
  cancelled: PT.muted,
};

function pct(part: number, total: number) {
  if (total === 0) return '—';
  return `${Math.round((part / total) * 100)}%`;
}

function pctNum(part: number, total: number) {
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
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: PT.text,
              letterSpacing: '-0.5px',
            }}
          >
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
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
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

  const successRate = pctNum(delivered, total);
  const failRate = pctNum(failed, total);
  const activeRate = pctNum(active, total);

  // Build bar chart data from byPharmacy (top 7 by total)
  const chartData = [...byPharmacy]
    .sort((a, b) => b.total - a.total)
    .slice(0, 7)
    .map((p) => ({
      label: p.pharmacyName.split(' ')[0] ?? p.pharmacyName,
      value: p.total,
    }));

  const hasDateFilter = !!(sp.from || sp.to);

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
          <h1 style={{ fontSize: 22, fontWeight: 700, color: PT.text, margin: 0 }}>Analitik</h1>
          <p style={{ fontSize: 13, color: PT.muted, marginTop: 4 }}>
            Ringkasan performa pengiriman
          </p>
        </div>

        {/* Date filter */}
        <form
          action="/a/analytics"
          method="get"
          style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}
        >
          <div>
            <label
              htmlFor="from"
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                color: PT.muted,
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {t('filterFrom')}
            </label>
            <input
              id="from"
              name="from"
              type="date"
              defaultValue={sp.from ?? ''}
              style={{
                borderRadius: 8,
                border: `1px solid ${PT.border}`,
                padding: '7px 10px',
                fontSize: 13,
                fontFamily: 'inherit',
                outline: 'none',
                color: PT.text,
              }}
            />
          </div>
          <div>
            <label
              htmlFor="to"
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                color: PT.muted,
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {t('filterTo')}
            </label>
            <input
              id="to"
              name="to"
              type="date"
              defaultValue={sp.to ?? ''}
              style={{
                borderRadius: 8,
                border: `1px solid ${PT.border}`,
                padding: '7px 10px',
                fontSize: 13,
                fontFamily: 'inherit',
                outline: 'none',
                color: PT.text,
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              borderRadius: 8,
              border: `1px solid ${PT.border}`,
              background: PT.card,
              padding: '7px 14px',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              color: PT.text,
              cursor: 'pointer',
            }}
          >
            {tCommon('apply')}
          </button>
          {hasDateFilter && (
            <Link
              href="/a/analytics"
              style={{
                borderRadius: 8,
                padding: '7px 12px',
                fontSize: 13,
                fontWeight: 500,
                color: PT.muted,
                textDecoration: 'none',
              }}
            >
              {tCommon('clear')}
            </Link>
          )}
        </form>
      </div>

      {/* KPI stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard
          label={t('cards.total')}
          value={total}
          icon="📦"
          iconBg={`color-mix(in oklch, ${PT.primary} 12%, transparent)`}
        />
        <StatCard
          label={t('cards.active')}
          value={active}
          sub={total > 0 ? `${activeRate}% dari total` : undefined}
          subColor={PT.primary}
          icon="🔄"
          iconBg={`color-mix(in oklch, ${PT.teal} 12%, transparent)`}
        />
        <StatCard
          label={t('cards.delivered')}
          value={delivered}
          sub={total > 0 ? t('cards.ofTotal', { pct: pct(delivered, total) }) : undefined}
          icon="✅"
          iconBg={`color-mix(in oklch, ${PT.success} 12%, transparent)`}
        />
        <StatCard
          label={t('cards.failed')}
          value={failed}
          sub={total > 0 ? t('cards.ofTotal', { pct: pct(failed, total) }) : undefined}
          subColor={PT.danger}
          icon="❌"
          iconBg={`color-mix(in oklch, ${PT.danger} 12%, transparent)`}
        />
      </div>

      {/* Chart row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 14,
          marginBottom: 24,
        }}
      >
        {/* Bar chart: orders per pharmacy */}
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
              <div style={{ fontWeight: 700, fontSize: 15, color: PT.text }}>Order per Apotek</div>
              <div style={{ fontSize: 12, color: PT.muted, marginTop: 2 }}>
                {total} total order
                {hasDateFilter ? ` · ${sp.from ?? ''}–${sp.to ?? ''}` : ''}
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
              Top 7
            </span>
          </div>
          {chartData.length > 0 ? (
            <BarChart data={chartData} height={100} color={PT.primary} />
          ) : (
            <div
              style={{
                height: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: PT.muted,
                fontSize: 13,
              }}
            >
              {t('noOrders')}
            </div>
          )}
        </div>

        {/* Delivery success rate */}
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
            Tingkat Keberhasilan
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Terkirim', value: successRate, color: PT.success },
              { label: 'Aktif', value: activeRate, color: PT.primary },
              { label: 'Gagal', value: failRate, color: PT.danger },
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
                  <span style={{ fontWeight: 700, color: PT.text }}>{s.value}%</span>
                </div>
                <div style={{ height: 7, background: PT.bg, borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${s.value}%`,
                      background: s.color,
                      borderRadius: 99,
                      transition: 'width 0.6s',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 16,
              padding: '10px 14px',
              background: PT.bg,
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 11, color: PT.muted, fontWeight: 500 }}>Tingkat pengiriman</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: PT.success, marginTop: 2 }}>
              {successRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: status breakdown + by pharmacy table */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
        }}
      >
        {/* Status breakdown */}
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
            {t('statusBreakdown')}
          </div>
          {sortedStatuses.length === 0 ? (
            <p style={{ fontSize: 13, color: PT.muted }}>{t('noOrders')}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sortedStatuses.map(({ status, count }) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    className={`inline-flex w-36 shrink-0 justify-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      ORDER_STATUS_BADGE[status] ?? 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tStatus(status as Parameters<typeof tStatus>[0]) ?? status}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 7,
                      background: PT.bg,
                      borderRadius: 99,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: total > 0 ? `${(count / total) * 100}%` : '0%',
                        background: STATUS_BAR_COLOR[status] ?? PT.muted,
                        borderRadius: 99,
                        transition: 'width 0.6s',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      width: 28,
                      textAlign: 'right',
                      fontSize: 13,
                      fontWeight: 700,
                      color: PT.text,
                      flexShrink: 0,
                    }}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Per pharmacy table */}
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
            <div style={{ fontWeight: 700, fontSize: 15, color: PT.text }}>{t('byPharmacy')}</div>
          </div>
          {byPharmacy.length === 0 ? (
            <p style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: PT.muted }}>
              {t('noOrders')}
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'oklch(0.96 0.008 250)' }}>
                    {[
                      { key: 'pharmacy', label: t('cols.pharmacy'), align: 'left' },
                      { key: 'total', label: t('cols.total'), align: 'right' },
                      { key: 'ok', label: t('cols.delivered'), align: 'right' },
                      { key: 'fail', label: t('cols.failed'), align: 'right' },
                      { key: 'rate', label: t('cols.rate'), align: 'right' },
                    ].map((h) => (
                      <th
                        key={h.key}
                        style={{
                          padding: '10px 16px',
                          textAlign: h.align as 'left' | 'right',
                          fontSize: 11,
                          fontWeight: 700,
                          color: PT.muted,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          whiteSpace: 'nowrap',
                          borderBottom: `1.5px solid ${PT.border}`,
                        }}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byPharmacy.map((p) => {
                    const terminal = p.delivered + p.failed;
                    const rate = pct(p.delivered, terminal);
                    return (
                      <tr key={p.pharmacyId} style={{ borderBottom: `1px solid ${PT.border}` }}>
                        <td
                          style={{
                            padding: '11px 16px',
                            fontWeight: 600,
                            color: PT.text,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {p.pharmacyName}
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            textAlign: 'right',
                            fontWeight: 700,
                            color: PT.text,
                          }}
                        >
                          {p.total}
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            textAlign: 'right',
                            fontWeight: 700,
                            color: PT.success,
                          }}
                        >
                          {p.delivered}
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            textAlign: 'right',
                            fontWeight: 700,
                            color: PT.danger,
                          }}
                        >
                          {p.failed}
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            textAlign: 'right',
                            fontSize: 12,
                            color: PT.muted,
                          }}
                        >
                          {rate}
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
    </div>
  );
}
