import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../index';
import { orders, pharmacies, drivers, users } from '../schema';
import type { OrderStatus } from '@pharmatrack/shared';

export type ExportOrderFilters = {
  status?: OrderStatus;
  pharmacyId?: string;
  /** ISO date string — inclusive start. */
  from?: string;
  /** ISO date string — inclusive end (entire day). */
  to?: string;
};

export type ExportOrderRow = {
  id: string;
  patientName: string;
  patientPhone: string;
  medicineText: string;
  deliveryAddress: string | null;
  status: string;
  pharmacyName: string;
  driverName: string | null;
  failureReason: string | null;
  failureNote: string | null;
  podPhotoUrl: string | null;
  createdAt: Date;
  pickedUpAt: Date | null;
  deliveredAt: Date | null;
};

const MAX_EXPORT_ROWS = 10_000;

/**
 * Fetch orders for CSV export. Similar to listOrdersForAdmin but:
 * - No pagination — returns up to MAX_EXPORT_ROWS.
 * - Includes additional fields (address, timestamps, failure info).
 * - Supports date range filtering.
 */
export async function exportOrdersForAdmin(
  filters: ExportOrderFilters = {},
): Promise<{ rows: ExportOrderRow[]; total: number }> {
  const conditions = [];
  if (filters.status) conditions.push(eq(orders.status, filters.status));
  if (filters.pharmacyId) conditions.push(eq(orders.pharmacyId, filters.pharmacyId));
  if (filters.from) {
    conditions.push(gte(orders.createdAt, new Date(filters.from)));
  }
  if (filters.to) {
    // End of day: add 1 day to make the range inclusive
    const endDate = new Date(filters.to);
    endDate.setDate(endDate.getDate() + 1);
    conditions.push(lte(orders.createdAt, endDate));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

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
        pharmacyName: pharmacies.name,
        driverName: driverUser.name,
        failureReason: orders.failureReason,
        failureNote: orders.failureNote,
        podPhotoUrl: orders.podPhotoUrl,
        createdAt: orders.createdAt,
        pickedUpAt: orders.pickedUpAt,
        deliveredAt: orders.deliveredAt,
      })
      .from(orders)
      .innerJoin(pharmacies, eq(orders.pharmacyId, pharmacies.id))
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
    rows: rows as ExportOrderRow[],
    total: totalRow[0]?.count ?? 0,
  };
}
