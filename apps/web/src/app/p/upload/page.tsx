import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { UploadForm } from './upload-form';

export default async function UploadPage() {
  const t = await getTranslations('PharmacyUpload');
  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-4">
        <Link href="/p" className="text-brand-700 text-sm hover:underline">
          {t('back')}
        </Link>
      </div>
      <h1 className="mb-2 text-2xl font-bold">{t('heading')}</h1>
      <p className="mb-6 text-sm text-slate-600">
        {t('description')}{' '}
        <a href="/api/csv-template" className="text-brand-700 underline">
          {t('downloadTemplate')}
        </a>
        .
      </p>
      <UploadForm />
    </main>
  );
}
