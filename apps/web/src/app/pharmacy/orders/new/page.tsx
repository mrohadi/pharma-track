import { requireRole } from '@/lib/guards';
import { NewOrderClient } from './new-order.client';

export default async function NewOrderPage() {
  await requireRole('pharmacy');
  return <NewOrderClient />;
}
