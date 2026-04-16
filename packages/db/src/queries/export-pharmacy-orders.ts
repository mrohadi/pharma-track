import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../index';
import { orders, drivers, users } from '../schema';
import type { OrderStatus } from '@pharmatrack/shared';

export type ExportPharmacyOrderFilters = {
  pharmacyId: string;
  status?: OrderStatus;
  from?: string;
  to?: string;
};

export type ExportPharmacyOrderRow = {
  id: string;
  patientName: string;
  patientPhone: string;
  medicineText: string;
  deliveryAddress: string | null;
  status: string;
  driverName: string | null;
  failureReason: string | null;
  podPhotoUrl: string | null;
  createdAt: Date;
  deliveredAt: Date | null;
};

const MAX_EXPORT_ROWS = 10_000;

/**
 * Export orders for a single pharmacy. No sensitive cross-pharmacy data.
 */
export async function exportOrdersForPharmacy(
  filters: ExportPharmacyOrderFilters,
): Promise<{ rows: ExportPharmacyOrderRow[]; total: number }> {
  const conditions = [eq(orders.pharmacyId, filters.pharmacyId)];
  if (filters.status) conditions.push(eq(orders.status, filters.status));
  if (filters.from) {
    conditions.push(gte(orders.createdAt, new Date(filters.from)));
  }
  if (filters.to) {
    const endDate = new Date(filters.to);
    endDate.setDate(endDate.getDate() + 1);
    conditions.push(lte(orders.createdAt, endDate));
  }
  const where = and(...conditions);

  const driverUser = alias(users, 'driver_user');

  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: orders.id,
        patientName: orders.patientName,
        patientPhone: orders.patientPhone,
        medicineText: orders.medicineText,
        deliveryAddress: orders.deliveryAddress,
        status: orders.status,
        driverName: driverUser.name,
        failureReason: orders.failureReason,
        podPhotoUrl: orders.podPhotoUrl,
        createdAt: orders.createdAt,
        deliveredAt: orders.deliveredAt,
      })
      .from(orders)
      .leftJoin(drivers, eq(orders.assignedDriverId, drivers.id))
      .leftJoin(driverUser, eq(drivers.userId, driverUser.id))
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(MAX_EXPORT_ROWS),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(where),
  ]);

  return {
    rows: rows as ExportPharmacyOrderRow[],
    total: totalRow[0]?.count ?? 0,
  };
}
