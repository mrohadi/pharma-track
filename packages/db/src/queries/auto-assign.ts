import { and, eq, asc } from 'drizzle-orm';
import { db } from '../index';
import { drivers, orders, auditLog } from '../schema';

/**
 * Find the first available+active driver with the fewest current active orders.
 * Returns driver id or null if none available.
 */
export async function findAvailableDriver(): Promise<string | null> {
  const rows = await db
    .select({ id: drivers.id })
    .from(drivers)
    .where(and(eq(drivers.status, 'available'), eq(drivers.verificationStatus, 'active')))
    .orderBy(asc(drivers.updatedAt))
    .limit(1);

  return rows[0]?.id ?? null;
}

/**
 * Auto-assign an order to the first available driver.
 * No-ops silently if no driver available or AUTO_ASSIGN_DRIVER env not set.
 */
export async function autoAssignOrder(opts: {
  orderId: string;
  systemUserId?: string;
}): Promise<{ assigned: boolean; driverId?: string }> {
  const driverId = await findAvailableDriver();
  if (!driverId) return { assigned: false };

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ assignedDriverId: driverId, status: 'assigned', updatedAt: new Date() })
      .where(eq(orders.id, opts.orderId));

    await tx.insert(auditLog).values({
      actorUserId: opts.systemUserId ?? null,
      entityType: 'order',
      entityId: opts.orderId,
      action: 'order.auto_assigned',
      diff: { driverId, source: 'auto_assign' } as Record<string, unknown>,
    });
  });

  return { assigned: true, driverId };
}
