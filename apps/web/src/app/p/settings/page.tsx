import { getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/guards';
import { getPharmacySettings } from '@pharmatrack/db';
import { SettingsForm } from './settings-form';

export default async function PharmacySettingsPage() {
  const [session, t] = await Promise.all([
    requireRole('pharmacy'),
    getTranslations('PharmacySettings'),
  ]);
  const pharmacyId = session.user.pharmacyId as string | undefined;

  const settings = pharmacyId ? await getPharmacySettings(pharmacyId) : { podPhotoRequired: false };

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-2xl font-bold">{t('heading')}</h1>

      <section className="rounded border border-slate-200 p-6">
        <h2 className="mb-4 text-base font-semibold">{t('deliveryOptions')}</h2>
        <SettingsForm initial={settings} />
      </section>
    </main>
  );
}
