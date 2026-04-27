import { asc, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../index';
import { orders, orderItems, orderRatings, auditLog, drivers, users } from '../schema';
import type { OrderItem } from '../schema/order-items';
import type { OrderPriority, OrderPaymentMode } from '../schema/orders';

/**
 * Query helpers live here (not in the web app) so we don't duplicate the
 * `drizzle-orm` peer between packages — mismatched peer resolution produces
 * brand-stripped SQL types and breaks `tsc`.
 */

export async function listRecentOrdersForPharmacy(pharmacyId: string, limit = 25) {
  const orderRows = await db
    .select({
      id: orders.id,
      patientName: orders.patientName,
      patientPhone: orders.patientPhone,
      deliveryAddress: orders.deliveryAddress,
      status: orders.status,
      totalCents: orders.totalCents,
      podPhotoUrl: orders.podPhotoUrl,
      createdAt: orders.createdAt,
      driverName: users.name,
    })
    .from(orders)
    .leftJoin(drivers, eq(orders.assignedDriverId, drivers.id))
    .leftJoin(users, eq(drivers.userId, users.id))
    .where(eq(orders.pharmacyId, pharmacyId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);

  if (orderRows.length === 0) return [];

  const orderIds = orderRows.map((r) => r.id);
  const itemRows = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .orderBy(asc(orderItems.position));

  const itemsByOrderId = new Map<string, OrderItem[]>();
  for (const item of itemRows) {
    const list = itemsByOrderId.get(item.orderId) ?? [];
    list.push(item);
    itemsByOrderId.set(item.orderId, list);
  }

  return orderRows.map((r) => ({
    ...r,
    items: itemsByOrderId.get(r.id) ?? [],
  }));
}

export type RecentOrderRow = Awaited<ReturnType<typeof listRecentOrdersForPharmacy>>[number];

/**
 * Fetch a single order with ownership check.
 * Returns null if not found or does not belong to pharmacyId.
 */
export async function getOrderForPharmacy(orderId: string, pharmacyId: string) {
  const [order] = await db
    .select({
      id: orders.id,
      pharmacyId: orders.pharmacyId,
      status: orders.status,
      patientName: orders.patientName,
      patientPhone: orders.patientPhone,
      patientEmail: orders.patientEmail,
      medicineText: orders.medicineText,
      deliveryAddress: orders.deliveryAddress,
      notes: orders.notes,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.pharmacyId !== pharmacyId) return null;
  return order;
}

export async function updateOrderFields(
  orderId: string,
  actorUserId: string,
  patch: Partial<{
    patientName: string;
    patientPhone: string;
    patientEmail: string | null;
    medicineText: string;
    deliveryAddress: string | null;
    notes: string | null;
  }>,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
    await tx.insert(auditLog).values({
      actorUserId,
      entityType: 'order',
      entityId: orderId,
      action: 'order.edited',
      diff: patch as Record<string, unknown>,
    });
  });
}

export async function createOrderWithItems(opts: {
  pharmacyId: string;
  actorUserId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  medicineText: string;
  deliveryAddress?: string;
  items: {
    name: string;
    quantity: number;
    unitPriceCents?: number;
    position?: number;
  }[];
  priority?: OrderPriority;
  paymentMode?: OrderPaymentMode;
  totalCents?: number;
  driverFeeCents?: number;
  notes?: string;
}): Promise<{ orderId: string }> {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        pharmacyId: opts.pharmacyId,
        patientName: opts.patientName,
        patientPhone: opts.patientPhone,
        patientEmail: opts.patientEmail ?? null,
        medicineText: opts.medicineText,
        deliveryAddress: opts.deliveryAddress ?? null,
        status: 'pending_address',
        priority: opts.priority ?? 'normal',
        paymentMode: opts.paymentMode ?? 'cod',
        totalCents: opts.totalCents ?? null,
        driverFeeCents: opts.driverFeeCents ?? null,
        notes: opts.notes ?? null,
      })
      .returning({ id: orders.id });

    await tx.insert(orderItems).values(
      opts.items.map((item, i) => ({
        orderId: order.id,
        name: item.name,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents ?? null,
        position: item.position ?? i,
      })),
    );

    await tx.insert(auditLog).values({
      actorUserId: opts.actorUserId,
      entityType: 'order',
      entityId: order.id,
      action: 'order.created',
      diff: { source: 'api', pharmacyId: opts.pharmacyId } as Record<string, unknown>,
    });

    return { orderId: order.id };
  });
}

export async function rateOrder(
  orderId: string,
  opts: { rating: number; comment?: string },
): Promise<void> {
  await db
    .insert(orderRatings)
    .values({ orderId, rating: opts.rating, comment: opts.comment ?? null })
    .onConflictDoUpdate({
      target: orderRatings.orderId,
      set: { rating: opts.rating, comment: opts.comment ?? null },
    });
}
