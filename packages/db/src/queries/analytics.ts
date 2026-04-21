import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../index';
import { orders, pharmacies, drivers } from '../schema';

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

export async function getAdminAnalytics(filters: AnalyticsFilters = {}): Promise<AdminAnalytics> {
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

export type DashboardStats = {
  todayOrders: number;
  deliveredToday: number;
  activeDrivers: number;
  activePharmacies: number;
  weekDailyOrders: { day: string; count: number }[];
  statusBreakdown: StatusCount[];
};

/**
 * Stats for the admin dashboard: today's counts, active users, 7-day bar chart.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86_400_000);

  // 7-day window ending today
  const weekStart = new Date(todayStart.getTime() - 6 * 86_400_000);

  const [todayRows, weekRows, statusRows, activeDriverCount, activePharmacyCount] =
    await Promise.all([
      // today totals
      db
        .select({
          total: sql<number>`count(*)::int`,
          delivered: sql<number>`count(*) filter (where ${orders.status} = 'delivered')::int`,
        })
        .from(orders)
        .where(and(gte(orders.createdAt, todayStart), lte(orders.createdAt, todayEnd))),

      // daily counts for the last 7 days
      db
        .select({
          day: sql<string>`date_trunc('day', ${orders.createdAt})::date::text`,
          count: sql<number>`count(*)::int`,
        })
        .from(orders)
        .where(gte(orders.createdAt, weekStart))
        .groupBy(sql`date_trunc('day', ${orders.createdAt})`)
        .orderBy(sql`date_trunc('day', ${orders.createdAt})`),

      // overall status breakdown (all time)
      db
        .select({
          status: orders.status,
          count: sql<number>`count(*)::int`,
        })
        .from(orders)
        .groupBy(orders.status),

      // active drivers (verificationStatus = active)
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(drivers)
        .where(eq(drivers.verificationStatus, 'active')),

      // active pharmacies
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(pharmacies)
        .where(eq(pharmacies.verificationStatus, 'active')),
    ]);

  // Build full 7-day array, filling gaps with 0
  const dayMap = Object.fromEntries(weekRows.map((r) => [r.day, r.count]));
  const weekDailyOrders: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart.getTime() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    weekDailyOrders.push({ day: key, count: dayMap[key] ?? 0 });
  }

  return {
    todayOrders: todayRows[0]?.total ?? 0,
    deliveredToday: todayRows[0]?.delivered ?? 0,
    activeDrivers: activeDriverCount[0]?.count ?? 0,
    activePharmacies: activePharmacyCount[0]?.count ?? 0,
    weekDailyOrders,
    statusBreakdown: statusRows as StatusCount[],
  };
}
