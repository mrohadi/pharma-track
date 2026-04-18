import { and, desc, gte, lte, eq, count, sql } from 'drizzle-orm';
import { db } from '../index';
import { auditLog, users } from '../schema';

export type AuditLogFilters = {
  entityType?: string;
  from?: string;
  to?: string;
  page?: number;
};

const PAGE_SIZE = 50;

export type AuditLogRow = {
  id: string;
  at: Date;
  actorEmail: string | null;
  entityType: string;
  entityId: string;
  action: string;
  diff: Record<string, unknown> | null;
};

export type AuditLogResult = {
  rows: AuditLogRow[];
  total: number;
  pageSize: number;
};

export async function listAuditLog(filters: AuditLogFilters = {}): Promise<AuditLogResult> {
  const conditions = [];

  if (filters.entityType) {
    conditions.push(eq(auditLog.entityType, filters.entityType));
  }
  if (filters.from) {
    conditions.push(gte(auditLog.at, new Date(filters.from)));
  }
  if (filters.to) {
    const end = new Date(filters.to);
    end.setDate(end.getDate() + 1);
    conditions.push(lte(auditLog.at, end));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: auditLog.id,
        at: auditLog.at,
        actorEmail: users.email,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        action: auditLog.action,
        diff: auditLog.diff,
      })
      .from(auditLog)
      .leftJoin(users, eq(auditLog.actorUserId, users.id))
      .where(where)
      .orderBy(desc(auditLog.at))
      .limit(PAGE_SIZE)
      .offset(offset),

    db.select({ total: count() }).from(auditLog).where(where),
  ]);

  return {
    rows: rows as AuditLogRow[],
    total: Number(total),
    pageSize: PAGE_SIZE,
  };
}

/** Returns distinct entityType values present in the log — used to populate the filter dropdown. */
export async function listAuditLogEntityTypes(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ entityType: auditLog.entityType })
    .from(auditLog)
    .orderBy(auditLog.entityType);
  return rows.map((r) => r.entityType);
}
