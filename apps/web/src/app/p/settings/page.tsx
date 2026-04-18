import { requireRole } from '@/lib/guards';
import { getPharmacySettings } from '@pharmatrack/db';
import { SettingsForm } from './settings-form';

export default async function PharmacySettingsPage() {
  const session = await requireRole('pharmacy');
  const pharmacyId = session.user.pharmacyId as string | undefined;

  const settings = pharmacyId ? await getPharmacySettings(pharmacyId) : { podPhotoRequired: false };

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <section className="rounded border border-slate-200 p-6">
        <h2 className="mb-4 text-base font-semibold">Delivery options</h2>
        <SettingsForm initial={settings} />
      </section>
    </main>
  );
}
