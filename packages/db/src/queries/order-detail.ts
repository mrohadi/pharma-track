import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../index';
import { orders, pharmacies, drivers, users, auditLog, orderItems } from '../schema';

export type OrderDetailRow = {
  id: string;
  status: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string | null;
  medicineText: string;
  deliveryAddress: string | null;
  priority: string;
  paymentMode: string;
  totalCents: number | null;
  driverFeeCents: number | null;
  notes: string | null;
  podPhotoUrl: string | null;
  failureReason: string | null;
  failureNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  pickedUpAt: Date | null;
  deliveredAt: Date | null;
  pharmacyId: string;
  pharmacyName: string;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  items: { id: string; name: string; quantity: number; unitPriceCents: number | null }[];
  auditEntries: {
    id: string;
    at: Date;
    action: string;
    actorEmail: string | null;
    diff: Record<string, unknown> | null;
  }[];
};

export async function getOrderDetail(orderId: string): Promise<OrderDetailRow | null> {
  const driverUser = alias(users, 'driver_user');

  const [row] = await db
    .select({
      id: orders.id,
      status: orders.status,
      patientName: orders.patientName,
      patientPhone: orders.patientPhone,
      patientEmail: orders.patientEmail,
      medicineText: orders.medicineText,
      deliveryAddress: orders.deliveryAddress,
      priority: orders.priority,
      paymentMode: orders.paymentMode,
      totalCents: orders.totalCents,
      driverFeeCents: orders.driverFeeCents,
      notes: orders.notes,
      podPhotoUrl: orders.podPhotoUrl,
      failureReason: orders.failureReason,
      failureNote: orders.failureNote,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      pickedUpAt: orders.pickedUpAt,
      deliveredAt: orders.deliveredAt,
      pharmacyId: orders.pharmacyId,
      pharmacyName: pharmacies.name,
      assignedDriverId: orders.assignedDriverId,
      assignedDriverName: driverUser.name,
    })
    .from(orders)
    .innerJoin(pharmacies, eq(orders.pharmacyId, pharmacies.id))
    .leftJoin(drivers, eq(orders.assignedDriverId, drivers.id))
    .leftJoin(driverUser, eq(drivers.userId, driverUser.id))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!row) return null;

  const [itemRows, auditRows] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, orderId)),
    db
      .select({
        id: auditLog.id,
        at: auditLog.at,
        action: auditLog.action,
        actorEmail: users.email,
        diff: auditLog.diff,
      })
      .from(auditLog)
      .leftJoin(users, eq(auditLog.actorUserId, users.id))
      .where(eq(auditLog.entityId, orderId))
      .orderBy(auditLog.at),
  ]);

  return {
    ...row,
    items: itemRows.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
    })),
    auditEntries: auditRows.map((a) => ({
      id: a.id,
      at: a.at,
      action: a.action,
      actorEmail: a.actorEmail,
      diff: a.diff ?? null,
    })),
  };
}

export async function cancelOrder(opts: {
  orderId: string;
  actorUserId: string;
  reason?: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const { orderId, actorUserId, reason } = opts;

  return db.transaction(async (tx) => {
    const [order] = await tx
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) return { ok: false, reason: 'order_not_found' };

    const TERMINAL = new Set(['delivered', 'failed', 'cancelled']);
    if (TERMINAL.has(order.status)) {
      return { ok: false, reason: `Order already ${order.status}` };
    }
    if (order.status === 'picked_up' || order.status === 'in_transit') {
      return { ok: false, reason: 'Cannot cancel order already picked up' };
    }

    await tx
      .update(orders)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    await tx.insert(auditLog).values({
      actorUserId,
      entityType: 'order',
      entityId: orderId,
      action: 'order.cancelled',
      diff: { reason: reason ?? null, fromStatus: order.status } as Record<string, unknown>,
    });

    return { ok: true };
  });
}
