import { requireRole } from '@/lib/guards';
import { listAllPharmacies, listAllDrivers } from '@pharmatrack/db';
import { UsersTabs } from './tabs.client';

const STAT_COLORS = {
  teal: { icon: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
  green: { icon: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  amber: { icon: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  red: { icon: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: keyof typeof STAT_COLORS;
}) {
  const c = STAT_COLORS[color];
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: c.bg,
          border: `1px solid ${c.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </div>
        <div
          style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginTop: 2 }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default async function AdminUsersPage() {
  await requireRole('admin');

  const [pharmacies, drivers] = await Promise.all([listAllPharmacies(), listAllDrivers()]);

  const totalPharmacies = pharmacies.length;
  const activeDrivers = drivers.filter((d) => d.verificationStatus === 'active').length;
  const pendingApprovals =
    pharmacies.filter((p) => p.verificationStatus === 'pending').length +
    drivers.filter((d) => d.verificationStatus === 'pending').length;
  const suspendedUsers =
    pharmacies.filter((p) => p.verificationStatus === 'suspended').length +
    drivers.filter((d) => d.verificationStatus === 'suspended').length;

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
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Manajemen Pengguna
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Kelola apotek dan driver terdaftar
          </p>
        </div>
        <button
          type="button"
          style={{
            background: 'oklch(0.52 0.18 250)',
            color: '#fff',
            borderRadius: 8,
            padding: '9px 18px',
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          + Undang Pengguna
        </button>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard label="Total Apotek" value={totalPharmacies} icon="🏥" color="teal" />
        <StatCard label="Driver Aktif" value={activeDrivers} icon="🚴" color="green" />
        <StatCard label="Menunggu Persetujuan" value={pendingApprovals} icon="⏳" color="amber" />
        <StatCard label="Pengguna Disuspend" value={suspendedUsers} icon="🚫" color="red" />
      </div>

      {/* Tabs + tables */}
      <UsersTabs pharmacies={pharmacies} drivers={drivers} />
    </div>
  );
}
