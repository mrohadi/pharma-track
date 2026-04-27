import { and, eq } from 'drizzle-orm';
import { createHash, randomInt } from 'crypto';
import { db } from '../index';
import { orders, otpAttempts, auditLog } from '../schema';

// ─── Config ─────────────────────────────────────────────────────────────

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

function generateOtp(): string {
  return String(randomInt(100_000, 999_999));
}

// ─── Generate OTP ───────────────────────────────────────────────────────

export type GenerateDeliveryOtpResult =
  | {
      ok: true;
      otp: string;
      patientName: string;
      patientPhone: string;
      patientEmail: string | null;
      orderId: string;
    }
  | { ok: false; reason: string };

/**
 * Generate a delivery OTP for an order. The driver triggers this when
 * they arrive at the patient's location. The OTP is sent to the patient
 * via WhatsApp; the driver asks the patient to read it back.
 *
 * - Order must be in 'picked_up' or 'in_transit' status.
 * - Overwrites any previous delivery OTP on the order.
 * - Resets the attempt counter (new OTP = fresh attempts).
 * - Transitions order to 'in_transit'.
 */
export async function generateDeliveryOtp(opts: {
  orderId: string;
  actorUserId: string;
}): Promise<GenerateDeliveryOtpResult> {
  const { orderId, actorUserId } = opts;
  const otp = generateOtp();
  const otpHash = hashOtp(otp);

  return db.transaction(async (tx) => {
    const order = (
      await tx
        .select({
          id: orders.id,
          status: orders.status,
          patientName: orders.patientName,
          patientPhone: orders.patientPhone,
          patientEmail: orders.patientEmail,
        })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1)
    ).at(0);

    if (!order) return { ok: false, reason: 'Order not found' };
    if (order.status !== 'picked_up' && order.status !== 'in_transit') {
      return { ok: false, reason: `Order is ${order.status} — must be picked_up or in_transit` };
    }

    const now = new Date();

    // Store the hashed OTP on the order
    await tx
      .update(orders)
      .set({
        deliveryOtpHash: otpHash,
        status: 'in_transit',
        updatedAt: now,
      })
      .where(eq(orders.id, orderId));

    // Reset attempt counter (upsert by orderId + type)
    const existing = (
      await tx
        .select({ id: otpAttempts.id })
        .from(otpAttempts)
        .where(and(eq(otpAttempts.orderId, orderId), eq(otpAttempts.type, 'delivery')))
        .limit(1)
    ).at(0);

    if (existing) {
      await tx
        .update(otpAttempts)
        .set({ attemptCount: 0, lockedUntil: null, updatedAt: now })
        .where(eq(otpAttempts.id, existing.id));
    } else {
      await tx.insert(otpAttempts).values({
        orderId,
        type: 'delivery',
        attemptCount: 0,
      });
    }

    await tx.insert(auditLog).values({
      actorUserId,
      entityType: 'order',
      entityId: orderId,
      action: 'delivery_otp.generated',
      diff: {} as Record<string, unknown>, // Never log the OTP
    });

    return {
      ok: true,
      otp,
      patientName: order.patientName,
      patientPhone: order.patientPhone,
      patientEmail: order.patientEmail,
      orderId,
    };
  });
}

// ─── Verify OTP ─────────────────────────────────────────────────────────

export type VerifyDeliveryOtpResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'order_not_found' | 'wrong_otp' | 'locked' | 'no_otp' | 'expired';
      attemptsLeft?: number;
      lockedUntilMs?: number;
    };

/**
 * Verify the delivery OTP entered by the driver.
 *
 * Rate-limiting: 3 wrong attempts → 15-min lockout.
 * On success: order → 'delivered', deliveredAt set, audit logged.
 */
export async function verifyDeliveryOtp(opts: {
  orderId: string;
  otp: string;
  actorUserId: string;
  podPhotoUrl?: string;
}): Promise<VerifyDeliveryOtpResult> {
  const { orderId, otp, actorUserId, podPhotoUrl } = opts;

  return db.transaction(async (tx) => {
    const order = (
      await tx
        .select({
          id: orders.id,
          status: orders.status,
          deliveryOtpHash: orders.deliveryOtpHash,
        })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1)
    ).at(0);

    if (!order) return { ok: false, reason: 'order_not_found' };
    if (!order.deliveryOtpHash) return { ok: false, reason: 'no_otp' };

    // Check lockout
    const attempt = (
      await tx
        .select()
        .from(otpAttempts)
        .where(and(eq(otpAttempts.orderId, orderId), eq(otpAttempts.type, 'delivery')))
        .limit(1)
    ).at(0);

    const now = new Date();

    if (attempt?.lockedUntil && now < attempt.lockedUntil) {
      return {
        ok: false,
        reason: 'locked',
        lockedUntilMs: attempt.lockedUntil.getTime() - now.getTime(),
      };
    }

    const inputHash = hashOtp(otp);
    if (inputHash !== order.deliveryOtpHash) {
      // Wrong OTP — increment attempt counter
      const newCount = (attempt?.attemptCount ?? 0) + 1;
      const shouldLock = newCount >= MAX_ATTEMPTS;
      const lockedUntil = shouldLock ? new Date(now.getTime() + LOCKOUT_MS) : null;

      if (attempt) {
        await tx
          .update(otpAttempts)
          .set({ attemptCount: newCount, lockedUntil, updatedAt: now })
          .where(eq(otpAttempts.id, attempt.id));
      } else {
        await tx.insert(otpAttempts).values({
          orderId,
          type: 'delivery',
          attemptCount: newCount,
          lockedUntil,
        });
      }

      await tx.insert(auditLog).values({
        actorUserId,
        entityType: 'order',
        entityId: orderId,
        action: 'delivery_otp.failed',
        diff: { attemptCount: newCount, locked: shouldLock } as Record<string, unknown>,
      });

      return {
        ok: false,
        reason: shouldLock ? 'locked' : 'wrong_otp',
        attemptsLeft: shouldLock ? 0 : MAX_ATTEMPTS - newCount,
        ...(shouldLock ? { lockedUntilMs: LOCKOUT_MS } : {}),
      };
    }

    // Correct OTP — deliver the order
    await tx
      .update(orders)
      .set({
        status: 'delivered',
        deliveredAt: now,
        deliveryOtpHash: null, // Clear after use
        podPhotoUrl: podPhotoUrl ?? null,
        updatedAt: now,
      })
      .where(eq(orders.id, orderId));

    await tx.insert(auditLog).values({
      actorUserId,
      entityType: 'order',
      entityId: orderId,
      action: 'order.delivered',
      diff: {
        ...(podPhotoUrl ? { podPhotoUrl } : {}),
      } as Record<string, unknown>,
    });

    return { ok: true };
  });
}

// ─── Fail delivery ──────────────────────────────────────────────────────

export type FailDeliveryResult = { ok: true } | { ok: false; reason: string };

/**
 * Mark an order as failed delivery with a reason.
 * Order must be in picked_up or in_transit.
 */
export async function failDelivery(opts: {
  orderId: string;
  failureReason: string;
  failureNote?: string;
  actorUserId: string;
}): Promise<FailDeliveryResult> {
  const { orderId, failureReason, failureNote, actorUserId } = opts;

  return db.transaction(async (tx) => {
    const order = (
      await tx
        .select({ id: orders.id, status: orders.status })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1)
    ).at(0);

    if (!order) return { ok: false, reason: 'Order not found' };
    if (order.status !== 'picked_up' && order.status !== 'in_transit') {
      return { ok: false, reason: `Order is ${order.status} — must be picked_up or in_transit` };
    }

    const now = new Date();

    await tx
      .update(orders)
      .set({
        status: 'failed',
        failureReason: failureReason as
          | 'no_answer'
          | 'wrong_address'
          | 'patient_refused'
          | 'patient_not_home'
          | 'other',
        failureNote: failureNote ?? null,
        deliveryOtpHash: null,
        updatedAt: now,
      })
      .where(eq(orders.id, orderId));

    await tx.insert(auditLog).values({
      actorUserId,
      entityType: 'order',
      entityId: orderId,
      action: 'order.delivery_failed',
      diff: { failureReason, failureNote } as Record<string, unknown>,
    });

    return { ok: true };
  });
}
