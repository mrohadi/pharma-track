import { requireRole } from '@/lib/guards';
import { AdminNewOrderClient } from './admin-new-order.client';

export default async function AdminNewOrderPage() {
  await requireRole('admin');
  return <AdminNewOrderClient />;
}
