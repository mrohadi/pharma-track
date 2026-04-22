import { requireRole } from '@/lib/guards';
import { getDriverByUserId } from '@pharmatrack/db';
import { SignOutButton } from '@/components/sign-out-button';
import { BottomNav } from '../bottom-nav';

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  motorcycle: 'Sepeda Motor',
  car: 'Mobil',
  bicycle: 'Sepeda',
};

const VERIFICATION_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Menunggu Verifikasi', cls: 'bg-amber-100 text-amber-700' },
  active: { label: 'Terverifikasi ✓', cls: 'bg-green-100 text-green-700' },
  suspended: { label: 'Ditangguhkan', cls: 'bg-red-100 text-red-700' },
  rejected: { label: 'Ditolak', cls: 'bg-red-100 text-red-700' },
};

export default async function ProfilePage() {
  const session = await requireRole('driver');
  const driver = await getDriverByUserId(session.user.id);

  const badge = VERIFICATION_BADGE[driver?.verificationStatus ?? 'pending'];

  return (
    <div className="flex min-h-screen flex-col" style={{ paddingBottom: 80 }}>
      {/* Dark header */}
      <header className="bg-slate-800 px-4 pb-6 pt-12">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl font-extrabold text-white">
            {(session.user.name ?? session.user.email ?? 'D')[0].toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-tight text-white">
              {session.user.name ?? '—'}
            </div>
            <div className="text-xs text-slate-400">{session.user.email}</div>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}
            >
              {badge.label}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 pt-4">
        {/* Vehicle */}
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            Kendaraan
          </h2>
          <dl className="space-y-2 text-sm">
            <Row
              label="Tipe"
              value={
                driver?.vehicleType
                  ? (VEHICLE_TYPE_LABELS[driver.vehicleType] ?? driver.vehicleType)
                  : '—'
              }
            />
            <Row label="Model" value={driver?.vehicleModel ?? driver?.vehicle ?? '—'} />
            <Row label="Plat Nomor" value={driver?.licensePlate ?? '—'} />
            <Row label="SIM" value={driver?.simClass ? `Kelas ${driver.simClass}` : '—'} />
            {driver?.simNumber && <Row label="No. SIM" value={driver.simNumber} />}
            {driver?.simExpiresAt && (
              <Row
                label="SIM Exp."
                value={new Date(driver.simExpiresAt).toLocaleDateString('id-ID')}
              />
            )}
          </dl>
        </section>

        {/* Payout */}
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            Rekening Payout
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label="Bank" value={driver?.payoutBank ?? '—'} />
            <Row label="No. Rekening" value={driver?.payoutAccountNumber ?? '—'} />
            <Row label="Atas Nama" value={driver?.payoutAccountName ?? '—'} />
          </dl>
        </section>

        {/* KYC */}
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            Identitas
          </h2>
          <dl className="space-y-2 text-sm">
            <Row
              label="NIK"
              value={driver?.nik ? `${driver.nik.slice(0, 4)}••••••••${driver.nik.slice(-4)}` : '—'}
            />
            <Row label="Provinsi" value={driver?.province ?? '—'} />
          </dl>
        </section>

        {/* Sign out */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <SignOutButton />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-slate-400">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}
