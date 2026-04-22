import { requireRole } from '@/lib/guards';
import { getPharmacyById, getPharmacySettings, getUserPreferences } from '@pharmatrack/db';
import { ProfileSection } from './profile-section.client';
import { LegalSection } from './legal-section.client';
import { AddressSection } from './address-section.client';
import { NotificationsSection } from './notifications-section.client';
import { SecuritySection } from './security-section.client';
import { SettingsForm } from './settings-form';

export default async function PharmacySettingsPage() {
  const session = await requireRole('pharmacy');
  const pharmacyId = session.user.pharmacyId as string | undefined;

  const [pharmacy, settings, prefs] = await Promise.all([
    pharmacyId ? getPharmacyById(pharmacyId) : null,
    pharmacyId ? getPharmacySettings(pharmacyId) : { podPhotoRequired: false },
    getUserPreferences(session.user.id),
  ]);

  return (
    <main className="mx-auto max-w-2xl space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola profil apotek dan preferensi akun</p>
      </div>

      {/* Pharmacy identity banner */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 text-3xl">
          🏥
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-slate-800">
            {pharmacy?.name ?? '—'}
          </div>
          <div className="truncate text-sm text-slate-500">{session.user.email}</div>
        </div>
        <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
          ✓ Terverifikasi
        </span>
      </div>

      <SectionHeader>Informasi Apotek</SectionHeader>
      <ProfileSection
        initial={{
          name: pharmacy?.name ?? '',
          picName: pharmacy?.picName ?? '',
          phone: pharmacy?.phone ?? '',
          npwp: pharmacy?.npwp ?? '',
        }}
      />

      <SectionHeader>Dokumen Legalitas</SectionHeader>
      <LegalSection
        initial={{
          siaNumber: pharmacy?.siaNumber ?? '',
          sipaNumber: pharmacy?.sipaNumber ?? '',
        }}
      />

      <SectionHeader>Alamat Apotek</SectionHeader>
      <AddressSection
        initial={{
          province: pharmacy?.province ?? '',
          city: pharmacy?.city ?? '',
          address: pharmacy?.address ?? '',
        }}
      />

      <SectionHeader>Notifikasi</SectionHeader>
      <NotificationsSection
        initial={{
          pushNotifications: prefs.pushNotifications ?? true,
        }}
      />

      <SectionHeader>Pengiriman</SectionHeader>
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <SettingsForm initial={settings} />
      </section>

      <SectionHeader>Keamanan Akun</SectionHeader>
      <SecuritySection />
    </main>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">{children}</h2>;
}
