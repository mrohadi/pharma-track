import { and, eq, isNull, lt, or, sql } from 'drizzle-orm';
import { db } from '../index';
import { addressRequests, auditLog, orders, pharmacies } from '../schema';

/**
 * Find all address requests that need a reminder WhatsApp message.
 *
 * Criteria:
 * - Not yet responded (respondedAt IS NULL)
 * - Not yet expired (expiresAt > now)
 * - Under the max reminder count
 * - Either:
 *     a) No reminders sent yet AND original sentAt was >= intervalHours ago, OR
 *     b) At least one reminder sent AND lastReminderSentAt was >= intervalHours ago
 */
export async function getPendingAddressReminders(opts: {
  intervalHours: number;
  maxReminders: number;
}) {
  const { intervalHours, maxReminders } = opts;
  const intervalMs = intervalHours * 60 * 60 * 1000;
  const cutoff = new Date(Date.now() - intervalMs);

  const rows = await db
    .select({
      requestId: addressRequests.id,
      orderId: addressRequests.orderId,
      token: addressRequests.token,
      reminderCount: addressRequests.reminderCount,
      patientName: orders.patientName,
      patientPhone: orders.patientPhone,
      pharmacyName: pharmacies.name,
    })
    .from(addressRequests)
    .innerJoin(orders, eq(addressRequests.orderId, orders.id))
    .innerJoin(pharmacies, eq(orders.pharmacyId, pharmacies.id))
    .where(
      and(
        isNull(addressRequests.respondedAt),
        // Not expired
        sql`${addressRequests.expiresAt} > now()`,
        // Under cap
        lt(addressRequests.reminderCount, maxReminders),
        // Interval elapsed since last contact
        or(
          // No reminder sent yet: check against original sentAt
          and(eq(addressRequests.reminderCount, 0), lt(addressRequests.sentAt, cutoff)),
          // Already have reminders: check against lastReminderSentAt
          and(
            sql`${addressRequests.reminderCount} > 0`,
            lt(addressRequests.lastReminderSentAt, cutoff),
          ),
        ),
      ),
    );

  return rows;
}

export type PendingAddressReminder = Awaited<ReturnType<typeof getPendingAddressReminders>>[number];

/**
 * Increment reminderCount and set lastReminderSentAt = now for a request.
 * Also appends an audit log entry.
 */
export async function markReminderSent(opts: { requestId: string; orderId: string }) {
  const { requestId, orderId } = opts;
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(addressRequests)
      .set({
        reminderCount: sql`${addressRequests.reminderCount} + 1`,
        lastReminderSentAt: now,
      })
      .where(eq(addressRequests.id, requestId));

    await tx.insert(auditLog).values({
      actorUserId: null,
      entityType: 'order',
      entityId: orderId,
      action: 'address_request.reminder_sent',
      diff: { requestId } as Record<string, unknown>,
    });
  });
}
