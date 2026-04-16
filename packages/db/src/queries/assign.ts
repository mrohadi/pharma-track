import { eq } from 'drizzle-orm';
import { db } from '../index';
import { orders, drivers, auditLog } from '../schema';

export type AssignOrderResult =
  | { ok: true; from: string; to: string; driverId: string }
  | { ok: false; reason: 'order_not_found' | 'driver_not_found' | 'terminal_status' };

const TERMINAL = new Set(['delivered', 'failed', 'cancelled']);

/**
 * Assign an order to a driver. Transitions order.status → 'assigned' unless
 * it's already past that (picked_up / in_transit stays as-is — we only
 * change the driver). Terminal orders cannot be reassigned.
 *
 * Writes an audit entry capturing the previous driver (for reassignments)
 * and the status transition.
 */
export async function assignOrderToDriver(opts: {
  orderId: string;
  driverId: string;
  actorUserId: string;
}): Promise<AssignOrderResult> {
  const { orderId, driverId, actorUserId } = opts;

  return db.transaction(async (tx) => {
    const order = (
      await tx
        .select({
          id: orders.id,
          status: orders.status,
          assignedDriverId: orders.assignedDriverId,
        })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1)
    ).at(0);

    if (!order) return { ok: false, reason: 'order_not_found' as const };
    if (TERMINAL.has(order.status)) return { ok: false, reason: 'terminal_status' as const };

    const driver = (
      await tx.select({ id: drivers.id }).from(drivers).where(eq(drivers.id, driverId)).limit(1)
    ).at(0);
    if (!driver) return { ok: false, reason: 'driver_not_found' as const };

    // Keep status if already past 'assigned' (picked_up / in_transit);
    // otherwise move forward to 'assigned'.
    const nextStatus =
      order.status === 'picked_up' || order.status === 'in_transit' ? order.status : 'assigned';

    await tx
      .update(orders)
      .set({
        assignedDriverId: driverId,
        status: nextStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    await tx.insert(auditLog).values({
      actorUserId,
      entityType: 'order',
      entityId: orderId,
      action: order.assignedDriverId ? 'order.reassigned' : 'order.assigned',
      diff: {
        fromDriverId: order.assignedDriverId,
        toDriverId: driverId,
        fromStatus: order.status,
        toStatus: nextStatus,
      } as Record<string, unknown>,
    });

    return { ok: true as const, from: order.status, to: nextStatus, driverId };
  });
}
