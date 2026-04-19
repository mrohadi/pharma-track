import { getTranslations } from 'next-intl/server';
import { getAddressRequestByToken } from '@pharmatrack/db';
import { AddressForm } from './address-form';

/**
 * Public page — no auth required. The token in the URL is the only
 * credential. This is the link sent to patients via WhatsApp.
 */
export default async function AddressPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [request, t] = await Promise.all([
    getAddressRequestByToken(token),
    getTranslations('AddressPage'),
  ]);

  if (!request) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <h1 className="mb-2 text-xl font-bold text-red-600">{t('invalidLink')}</h1>
        <p className="text-sm text-slate-600">{t('invalidLinkDesc')}</p>
      </main>
    );
  }

  if (new Date() > request.expiresAt) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <h1 className="mb-2 text-xl font-bold text-amber-600">{t('linkExpired')}</h1>
        <p className="text-sm text-slate-600">{t('linkExpiredDesc')}</p>
      </main>
    );
  }

  if (request.respondedAt) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <h1 className="mb-2 text-xl font-bold text-green-600">{t('alreadySubmitted')}</h1>
        <p className="text-sm text-slate-600">{t('alreadySubmittedDesc')}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-1 text-xl font-bold">{t('heading')}</h1>
      <p className="mb-4 text-sm text-slate-600">
        {t('greeting', { name: request.patientName, pharmacy: request.pharmacyName })}
      </p>
      <AddressForm token={token} />
    </main>
  );
}
