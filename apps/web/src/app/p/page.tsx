import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listRecentOrdersForPharmacy } from '@pharmatrack/db';
import { requireRole } from '@/lib/guards';
import { maskPhone } from '@/lib/format';
import { PodPhotoLink } from '@/components/pod-photo-link';
import { PharmacyExportButton } from './export-button';

export default async function PharmacyHome() {
  const [session, t] = await Promise.all([
    requireRole('pharmacy'),
    getTranslations('PharmacyPage'),
  ]);
  const pharmacyId = session.user.pharmacyId as string | undefined;

  const recent = pharmacyId ? await listRecentOrdersForPharmacy(pharmacyId) : [];
  const tStatus = await getTranslations('OrderStatus');

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('heading')}</h1>
        <div className="flex items-center gap-2">
          <PharmacyExportButton />
          <Link
            href="/p/upload"
            className="bg-brand-600 hover:bg-brand-700 rounded px-4 py-2 text-sm font-medium text-white"
          >
            {t('uploadCsv')}
          </Link>
        </div>
      </div>

      <h2 className="mb-2 text-lg font-semibold">{t('recentOrders')}</h2>
      {recent.length === 0 ? (
        <p className="text-sm text-slate-600">
          {t('noOrders')}{' '}
          <Link href="/p/upload" className="text-brand-700 underline">
            {t('uploadToStart')}
          </Link>{' '}
          {t('toGetStarted')}
        </p>
      ) : (
        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">{t('cols.patient')}</th>
                <th className="px-3 py-2">{t('cols.phone')}</th>
                <th className="px-3 py-2">{t('cols.status')}</th>
                <th className="px-3 py-2">{t('cols.pod')}</th>
                <th className="px-3 py-2">{t('cols.created')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((o) => (
                <tr key={o.id}>
                  <td className="px-3 py-2">{o.patientName}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">
                    {maskPhone(o.patientPhone)}
                  </td>
                  <td className="px-3 py-2">
                    {tStatus(o.status as Parameters<typeof tStatus>[0]) ?? o.status}
                  </td>
                  <td className="px-3 py-2">
                    {o.podPhotoUrl ? <PodPhotoLink photoKey={o.podPhotoUrl} /> : null}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
