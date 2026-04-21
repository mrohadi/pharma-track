import Link from 'next/link';
import { requireRole } from '@/lib/guards';
import { OrderWizard } from './wizard.client';

export default async function NewOrderPage() {
  await requireRole('pharmacy');

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-4">
        <Link href="/p" className="text-brand-700 text-sm hover:underline">
          ← Kembali ke Dashboard
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-bold">Order Baru</h1>
      <OrderWizard />
    </main>
  );
}
