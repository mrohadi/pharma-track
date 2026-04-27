import { and, eq, inArray, desc, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../index';
import { batches, orders, pharmacies, drivers, users, auditLog } from '../schema';
import { createHash, randomInt } from 'crypto';

// ─── Helpers ────────────────────────────────────────────────────────────

/** Hash a 6-digit PIN with SHA-256. Good enough for a PoC. */
function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

function generatePin(): string {
  return String(randomInt(100_000, 999_999));
}

// ─── Batch creation ─────────────────────────────────────────────────────

export type CreateBatchResult =
  | { ok: true; batchId: string; pin: string; orderCount: number }
  | { ok: false; reason: string };

/**
 * Create a batch from a set of orders + assign them to a driver.
 *
 * Rules:
 * - All orders must belong to the same pharmacy.
 * - Orders must be in 'address_collected' or 'assigned' status.
 * - A 6-digit pickup PIN is generated, hashed, and stored on the batch.
 * - The plaintext PIN is returned once (to show the pharmacy / admin).
 */
export async function createBatch(opts: {
  orderIds: string[];
  driverId: string;
  pharmacyId: string;
  actorUserId: string;
}): Promise<CreateBatchResult> {
  const { orderIds, driverId, pharmacyId, actorUserId } = opts;

  if (orderIds.length === 0) return { ok: false, reason: 'No orders selected' };

  const pin = generatePin();
  const pinHash = hashPin(pin);

  return db.transaction(async (tx) => {
    // Verify all orders exist, belong to pharmacy, and are in valid status
    const validOrders = await tx
      .select({ id: orders.id, status: orders.status, pharmacyId: orders.pharmacyId })
      .from(orders)
      .where(and(inArray(orders.id, orderIds), eq(orders.pharmacyId, pharmacyId)));

    if (validOrders.length !== orderIds.length) {
      return { ok: false, reason: 'Some orders not found or belong to a different pharmacy' };
    }

    const invalidStatus = validOrders.find(
      (o) => o.status !== 'address_collected' && o.status !== 'assigned',
    );
    if (invalidStatus) {
      return {
        ok: false,
        reason: `Order has status "${invalidStatus.status}" — only address_collected or assigned orders can be batched`,
      };
    }

    // Create the batch
    const [batch] = await tx
      .insert(batches)
      .values({
        pharmacyId,
        driverId,
        status: 'assigned',
        pickupPinHash: pinHash,
      })
      .returning({ id: batches.id });

    // Assign orders to batch + driver
    await tx
      .update(orders)
      .set({
        batchId: batch.id,
        assignedDriverId: driverId,
        status: 'assigned',
        updatedAt: new Date(),
      })
      .where(inArray(orders.id, orderIds));

    // Audit entries
    await tx.insert(auditLog).values(
      orderIds.map((oid) => ({
        actorUserId,
        entityType: 'order',
        entityId: oid,
        action: 'order.batched',
        diff: { batchId: batch.id, driverId } as Record<string, unknown>,
      })),
    );

    await tx.insert(auditLog).values({
      actorUserId,
      entityType: 'batch',
      entityId: batch.id,
      action: 'batch.created',
      diff: { driverId, orderCount: orderIds.length } as Record<string, unknown>,
    });

    return { ok: true, batchId: batch.id, pin, orderCount: orderIds.length };
  });
}

// ─── Pickup confirmation ────────────────────────────────────────────────

export type ConfirmPickupResult =
  | { ok: true; batchId: string }
  | { ok: false; reason: 'batch_not_found' | 'wrong_pin' | 'already_picked_up' | 'not_assigned' };

/**
 * Driver enters the 6-digit pickup PIN. If it matches the hash, the
 * batch moves to 'picked_up' and all its orders move to 'picked_up'.
 */
export async function confirmBatchPickup(opts: {
  batchId: string;
  pin: string;
  actorUserId: string;
}): Promise<ConfirmPickupResult> {
  const { batchId, pin, actorUserId } = opts;

  return db.transaction(async (tx) => {
    const batch = (
      await tx
        .select({
          id: batches.id,
          status: batches.status,
          pickupPinHash: batches.pickupPinHash,
          driverId: batches.driverId,
        })
        .from(batches)
        .where(eq(batches.id, batchId))
        .limit(1)
    ).at(0);

    if (!batch) return { ok: false, reason: 'batch_not_found' };
    if (batch.status === 'picked_up' || batch.status === 'completed') {
      return { ok: false, reason: 'already_picked_up' };
    }
    if (batch.status !== 'assigned') return { ok: false, reason: 'not_assigned' };

    const inputHash = hashPin(pin);
    if (inputHash !== batch.pickupPinHash) {
      return { ok: false, reason: 'wrong_pin' };
    }

    const now = new Date();

    await tx
      .update(batches)
      .set({ status: 'picked_up', pickupConfirmedAt: now, updatedAt: now })
      .where(eq(batches.id, batchId));

    await tx
      .update(orders)
      .set({ status: 'picked_up', pickedUpAt: now, updatedAt: now })
      .where(eq(orders.batchId, batchId));

    await tx.insert(auditLog).values({
      actorUserId,
      entityType: 'batch',
      entityId: batchId,
      action: 'batch.pickup_confirmed',
      diff: { driverId: batch.driverId } as Record<string, unknown>,
    });

    return { ok: true, batchId };
  });
}

// ─── Batch list queries ─────────────────────────────────────────────────

export type BatchRow = {
  id: string;
  pharmacyName: string;
  driverName: string | null;
  status: string;
  orderCount: number;
  pickupConfirmedAt: Date | null;
  createdAt: Date;
};

/** Admin: list batches across all pharmacies. */
export async function listBatchesForAdmin(): Promise<BatchRow[]> {
  const driverUser = alias(users, 'driver_user');

  const rows = await db
    .select({
      id: batches.id,
      pharmacyName: pharmacies.name,
      driverName: driverUser.name,
      status: batches.status,
      orderCount: sql<number>`(select count(*)::int from orders where orders.batch_id = ${batches.id})`,
      pickupConfirmedAt: batches.pickupConfirmedAt,
      createdAt: batches.createdAt,
    })
    .from(batches)
    .innerJoin(pharmacies, eq(batches.pharmacyId, pharmacies.id))
    .leftJoin(drivers, eq(batches.driverId, drivers.id))
    .leftJoin(driverUser, eq(drivers.userId, driverUser.id))
    .orderBy(desc(batches.createdAt));

  return rows;
}

/** Driver: list batches assigned to them. */
export async function listBatchesForDriver(driverId: string) {
  const rows = await db
    .select({
      id: batches.id,
      pharmacyName: pharmacies.name,
      status: batches.status,
      orderCount: sql<number>`(select count(*)::int from orders where orders.batch_id = ${batches.id})`,
      pickupConfirmedAt: batches.pickupConfirmedAt,
      createdAt: batches.createdAt,
    })
    .from(batches)
    .innerJoin(pharmacies, eq(batches.pharmacyId, pharmacies.id))
    .where(eq(batches.driverId, driverId))
    .orderBy(desc(batches.createdAt));

  return rows;
}

// ─── Regenerate pickup PIN ───────────────────────────────────────────────

export type RegeneratePinResult = { ok: true; pin: string } | { ok: false; reason: string };

/**
 * Generate a new pickup PIN for an assigned batch.
 * Only works when batch status is 'assigned' (not yet picked up).
 */
export async function regenerateBatchPin(opts: {
  batchId: string;
  actorUserId: string;
}): Promise<RegeneratePinResult> {
  const { batchId, actorUserId } = opts;

  const batch = (
    await db
      .select({ id: batches.id, status: batches.status })
      .from(batches)
      .where(eq(batches.id, batchId))
      .limit(1)
  ).at(0);

  if (!batch) return { ok: false, reason: 'Batch not found' };
  if (batch.status !== 'assigned') {
    return {
      ok: false,
      reason: `Batch ${batch.status} — only assigned batches can regenerate PIN`,
    };
  }

  const pin = generatePin();
  const pinHash = hashPin(pin);

  await db
    .update(batches)
    .set({ pickupPinHash: pinHash, updatedAt: new Date() })
    .where(eq(batches.id, batchId));

  await db.insert(auditLog).values({
    actorUserId,
    entityType: 'batch',
    entityId: batchId,
    action: 'batch.pin_regenerated',
    diff: {} as Record<string, unknown>,
  });

  return { ok: true, pin };
}
