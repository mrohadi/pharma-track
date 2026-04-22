import { requireRole } from '@/lib/guards';

const PT = {
  primary: 'oklch(0.52 0.18 250)',
  primaryLight: 'oklch(0.94 0.04 250)',
  primaryText: 'oklch(0.36 0.14 250)',
  text: 'oklch(0.18 0.02 250)',
  muted: 'oklch(0.58 0.03 250)',
  border: 'oklch(0.92 0.012 250)',
  bg: 'oklch(0.97 0.008 250)',
  card: '#ffffff',
  danger: 'oklch(0.55 0.2 25)',
  dangerLight: 'oklch(0.95 0.05 25)',
  success: 'oklch(0.52 0.15 145)',
  successLight: 'oklch(0.94 0.05 145)',
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
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
        <div style={{ fontWeight: 700, fontSize: 14, color: PT.text }}>{title}</div>
        {description && (
          <div style={{ fontSize: 12.5, color: PT.muted, marginTop: 3 }}>{description}</div>
        )}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 0',
        borderBottom: `1px solid ${PT.border}`,
      }}
    >
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: PT.text }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: PT.muted, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: 'green' | 'blue' | 'amber' }) {
  const colors = {
    green: { bg: PT.successLight, text: PT.success },
    blue: { bg: PT.primaryLight, text: PT.primaryText },
    amber: { bg: 'oklch(0.96 0.05 75)', text: 'oklch(0.48 0.14 75)' },
  };
  const c = colors[color];
  return (
    <span
      style={{
        padding: '3px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: c.bg,
        color: c.text,
      }}
    >
      {label}
    </span>
  );
}

export default async function AdminSettingsPage() {
  await requireRole('admin');

  return (
    <div className="p-4 sm:p-6 lg:p-7">
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: PT.text, margin: 0 }}>Pengaturan</h1>
        <p style={{ fontSize: 13, color: PT.muted, marginTop: 4 }}>
          Konfigurasi sistem PharmaTrack
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* System info */}
          <Section title="Informasi Sistem" description="Status dan versi platform">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { label: 'Nama Sistem', sub: 'Identitas platform', value: 'PharmaTrack' },
                { label: 'Versi', sub: 'Versi aplikasi saat ini', value: 'v1.0.0' },
                { label: 'Lingkungan', sub: 'Environment deployment', value: process.env.NODE_ENV ?? 'production' },
              ].map((item) => (
                <Row key={item.label} label={item.label} sub={item.sub}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: PT.text, fontFamily: 'monospace' }}>
                    {item.value}
                  </span>
                </Row>
              ))}
              <Row label="Status Sistem" sub="Kondisi layanan saat ini">
                <Badge label="Operasional" color="green" />
              </Row>
            </div>
          </Section>

          {/* Order settings */}
          <Section title="Pengaturan Order" description="Aturan pembuatan dan pemrosesan order">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Row label="Auto-assign Driver" sub="Otomatis tugaskan driver tersedia">
                <Badge label="Nonaktif" color="amber" />
              </Row>
              <Row label="Batas Order Harian" sub="Per apotek per hari">
                <span style={{ fontSize: 13, fontWeight: 600, color: PT.text }}>Tidak terbatas</span>
              </Row>
              <Row label="Mode Pembayaran" sub="COD dan Prepaid">
                <Badge label="Keduanya Aktif" color="green" />
              </Row>
              <Row label="Priority Express" sub="Layanan pengiriman cepat">
                <Badge label="Aktif" color="green" />
              </Row>
            </div>
          </Section>

          {/* Notifications */}
          <Section title="Notifikasi" description="Konfigurasi notifikasi sistem">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Row label="WhatsApp Notifikasi" sub="Update status ke pasien via WhatsApp">
                <Badge label="Aktif" color="green" />
              </Row>
              <Row label="Email Admin" sub="Laporan harian ke admin">
                <Badge label="Nonaktif" color="amber" />
              </Row>
              <Row label="Alert Driver Offline" sub="Peringatan jika driver tidak aktif">
                <Badge label="Aktif" color="green" />
              </Row>
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Verification */}
          <Section title="Verifikasi Pengguna" description="Alur persetujuan akun baru">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Row label="Apotek Baru" sub="Wajib review admin">
                <Badge label="Manual" color="blue" />
              </Row>
              <Row label="Driver Baru" sub="Wajib review dokumen">
                <Badge label="Manual" color="blue" />
              </Row>
              <Row label="Dokumen SIA/SIPA" sub="Verifikasi izin apotek">
                <Badge label="Wajib" color="blue" />
              </Row>
            </div>
          </Section>

          {/* Danger zone */}
          <div
            style={{
              background: PT.card,
              borderRadius: 14,
              border: `1px solid ${PT.danger}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${PT.dangerLight}`,
                background: PT.dangerLight,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: PT.danger }}>Zona Berbahaya</div>
              <div style={{ fontSize: 12.5, color: PT.danger, marginTop: 3, opacity: 0.75 }}>
                Tindakan ini tidak dapat dibatalkan
              </div>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: PT.text, marginBottom: 4 }}>
                  Reset Data Order
                </div>
                <div style={{ fontSize: 12, color: PT.muted, marginBottom: 10 }}>
                  Hapus semua data order. Tidak dapat dikembalikan.
                </div>
                <button
                  type="button"
                  disabled
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    border: `1px solid ${PT.danger}`,
                    background: '#fff',
                    color: PT.danger,
                    padding: '8px 0',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'not-allowed',
                    fontFamily: 'inherit',
                    opacity: 0.5,
                  }}
                >
                  Hubungi Support
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div
            style={{
              background: PT.primaryLight,
              borderRadius: 14,
              padding: 20,
              border: `1px solid oklch(0.88 0.06 250)`,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, color: PT.primaryText, marginBottom: 8 }}>
              PharmaTrack
            </div>
            <div style={{ fontSize: 12.5, color: PT.primaryText, lineHeight: 1.6, opacity: 0.8 }}>
              Platform manajemen pengiriman obat untuk apotek dan pasien di Asia Tenggara.
            </div>
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: `1px solid oklch(0.88 0.06 250)`,
                fontSize: 11.5,
                color: PT.primaryText,
                opacity: 0.6,
              }}
            >
              v1.0.0 · Built with Next.js + Drizzle
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
