import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../index';
import { orders, pharmacies } from '../schema';
import type { OrderStatus } from '@pharmatrack/shared';

export type AdminOrderFilters = {
  status?: OrderStatus;
  pharmacyId?: string;
  /** 1-based page number. */
  page?: number;
  pageSize?: number;
};

export type AdminOrderRow = {
  id: string;
  patientName: string;
  patientPhone: string;
  medicineText: string;
  status: OrderStatus;
  pharmacyId: string;
  pharmacyName: string;
  createdAt: Date;
};

export type AdminOrdersResult = {
  rows: AdminOrderRow[];
  total: number;
  page: number;
  pageSize: number;
};

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

/**
 * Cross-pharmacy order list for admin. Paginated, optionally filtered by
 * status and/or pharmacy.
 */
export async function listOrdersForAdmin(
  filters: AdminOrderFilters = {},
): Promise<AdminOrdersResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE));

  const conditions = [];
  if (filters.status) conditions.push(eq(orders.status, filters.status));
  if (filters.pharmacyId) conditions.push(eq(orders.pharmacyId, filters.pharmacyId));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: orders.id,
        patientName: orders.patientName,
        patientPhone: orders.patientPhone,
        medicineText: orders.medicineText,
        status: orders.status,
        pharmacyId: orders.pharmacyId,
        pharmacyName: pharmacies.name,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .innerJoin(pharmacies, eq(orders.pharmacyId, pharmacies.id))
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(where),
  ]);

  return {
    rows: rows as AdminOrderRow[],
    total: totalRow[0]?.count ?? 0,
    page,
    pageSize,
  };
}

export async function listPharmaciesForFilter() {
  return db
    .select({ id: pharmacies.id, name: pharmacies.name })
    .from(pharmacies)
    .orderBy(pharmacies.name);
}
