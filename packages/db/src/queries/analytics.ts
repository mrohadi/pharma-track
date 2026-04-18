import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../index';
import { orders, pharmacies } from '../schema';

export type AnalyticsFilters = {
  /** ISO date string — inclusive start. */
  from?: string;
  /** ISO date string — inclusive end (entire day). */
  to?: string;
};

export type StatusCount = {
  status: string;
  count: number;
};

export type PharmacyStat = {
  pharmacyId: string;
  pharmacyName: string;
  total: number;
  delivered: number;
  failed: number;
};

export type AdminAnalytics = {
  total: number;
  statusBreakdown: StatusCount[];
  byPharmacy: PharmacyStat[];
};

export async function getAdminAnalytics(
  filters: AnalyticsFilters = {},
): Promise<AdminAnalytics> {
  const conditions = [];
  if (filters.from) conditions.push(gte(orders.createdAt, new Date(filters.from)));
  if (filters.to) {
    const end = new Date(filters.to);
    end.setDate(end.getDate() + 1);
    conditions.push(lte(orders.createdAt, end));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [statusRows, pharmacyRows] = await Promise.all([
    db
      .select({
        status: orders.status,
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .where(where)
      .groupBy(orders.status),
    db
      .select({
        pharmacyId: pharmacies.id,
        pharmacyName: pharmacies.name,
        total: sql<number>`count(*)::int`,
        delivered: sql<number>`count(*) filter (where ${orders.status} = 'delivered')::int`,
        failed: sql<number>`count(*) filter (where ${orders.status} = 'failed')::int`,
      })
      .from(orders)
      .innerJoin(pharmacies, eq(orders.pharmacyId, pharmacies.id))
      .where(where)
      .groupBy(pharmacies.id, pharmacies.name)
      .orderBy(sql`count(*) desc`),
  ]);

  const total = statusRows.reduce((sum, r) => sum + r.count, 0);

  return {
    total,
    statusBreakdown: statusRows as StatusCount[],
    byPharmacy: pharmacyRows as PharmacyStat[],
  };
}
