import { requireRole } from '@/lib/guards';
import { getDriverByUserId } from '@pharmatrack/db';
import { SignOutButton } from '@/components/sign-out-button';
import { BottomNav } from '../bottom-nav';
import { ProfileForm } from './profile-form.client';

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
        {driver ? (
          <ProfileForm driver={driver} />
        ) : (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Profil driver tidak ditemukan. Hubungi admin.
          </p>
        )}

        {/* Sign out */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <SignOutButton />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
