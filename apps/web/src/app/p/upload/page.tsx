import Link from 'next/link';
import { UploadForm } from './upload-form';

export default function UploadPage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-4">
        <Link href="/p" className="text-brand-700 text-sm hover:underline">
          ← Back
        </Link>
      </div>
      <h1 className="mb-2 text-2xl font-bold">Upload orders (CSV)</h1>
      <p className="mb-6 text-sm text-slate-600">
        Upload a CSV of today&apos;s orders. Rows are validated before anything is saved — fix any
        errors and re-upload the whole file.{' '}
        <a href="/api/csv-template" className="text-brand-700 underline">
          Download template
        </a>
        .
      </p>
      <UploadForm />
    </main>
  );
}
