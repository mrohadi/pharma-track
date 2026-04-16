import { desc, eq } from 'drizzle-orm';
import { db } from '../index';
import { orders } from '../schema';

/**
 * Query helpers live here (not in the web app) so we don't duplicate the
 * `drizzle-orm` peer between packages — mismatched peer resolution produces
 * brand-stripped SQL types and breaks `tsc`.
 */

export async function listRecentOrdersForPharmacy(pharmacyId: string, limit = 25) {
  return db
    .select({
      id: orders.id,
      patientName: orders.patientName,
      patientPhone: orders.patientPhone,
      status: orders.status,
      podPhotoUrl: orders.podPhotoUrl,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.pharmacyId, pharmacyId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export type RecentOrderRow = Awaited<ReturnType<typeof listRecentOrdersForPharmacy>>[number];
