import { and, eq, isNull, inArray } from 'drizzle-orm';
import { db } from '../index';
import { orders } from '../schema';

/**
 * Orders eligible for batching: address_collected or assigned, not yet
 * in a batch. Grouped by pharmacy so the admin can batch per-pharmacy.
 */
export async function listBatchableOrders(pharmacyId: string) {
  return db
    .select({
      id: orders.id,
      patientName: orders.patientName,
      status: orders.status,
    })
    .from(orders)
    .where(
      and(
        eq(orders.pharmacyId, pharmacyId),
        isNull(orders.batchId),
        inArray(orders.status, ['address_collected', 'assigned']),
      ),
    );
}
