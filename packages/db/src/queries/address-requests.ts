import { eq } from 'drizzle-orm';
import { db } from '../index';
import { addressRequests, orders, pharmacies, auditLog } from '../schema';

/**
 * Create an address request record and return the token + order details
 * needed to send the WhatsApp message.
 */
export async function createAddressRequest(opts: {
  orderId: string;
  actorUserId: string;
  /** Link expiry in hours from now. Default 48h. */
  expiresInHours?: number;
}) {
  const { orderId, actorUserId, expiresInHours = 48 } = opts;
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  return db.transaction(async (tx) => {
    // Verify the order exists and is in pending_address status
    const order = (
      await tx
        .select({
          id: orders.id,
          status: orders.status,
          patientName: orders.patientName,
          patientPhone: orders.patientPhone,
          pharmacyId: orders.pharmacyId,
        })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1)
    ).at(0);

    if (!order) return { ok: false as const, reason: 'order_not_found' };
    if (order.status !== 'pending_address') {
      return { ok: false as const, reason: 'not_pending_address' };
    }

    // Get pharmacy name for the WhatsApp message
    const pharmacy = (
      await tx
        .select({ name: pharmacies.name })
        .from(pharmacies)
        .where(eq(pharmacies.id, order.pharmacyId))
        .limit(1)
    ).at(0);

    await tx.insert(addressRequests).values({
      orderId,
      channel: 'whatsapp',
      token,
      expiresAt,
    });

    await tx.insert(auditLog).values({
      actorUserId,
      entityType: 'order',
      entityId: orderId,
      action: 'address_request.sent',
      diff: { channel: 'whatsapp', token } as Record<string, unknown>,
    });

    return {
      ok: true as const,
      token,
      patientName: order.patientName,
      patientPhone: order.patientPhone,
      pharmacyName: pharmacy?.name ?? 'Your pharmacy',
      expiresAt,
    };
  });
}

/**
 * Look up an address request by token. Returns the request + associated
 * order data needed to render the public address form.
 */
export async function getAddressRequestByToken(token: string) {
  const rows = await db
    .select({
      requestId: addressRequests.id,
      orderId: addressRequests.orderId,
      respondedAt: addressRequests.respondedAt,
      expiresAt: addressRequests.expiresAt,
      patientName: orders.patientName,
      pharmacyName: pharmacies.name,
      orderStatus: orders.status,
    })
    .from(addressRequests)
    .innerJoin(orders, eq(addressRequests.orderId, orders.id))
    .innerJoin(pharmacies, eq(orders.pharmacyId, pharmacies.id))
    .where(eq(addressRequests.token, token))
    .limit(1);

  return rows.at(0) ?? null;
}

/**
 * Submit the patient's delivery address. Updates the order + marks the
 * address request as responded.
 */
export async function submitAddress(opts: { token: string; address: string }) {
  const { token, address } = opts;

  return db.transaction(async (tx) => {
    const request = (
      await tx
        .select({
          id: addressRequests.id,
          orderId: addressRequests.orderId,
          respondedAt: addressRequests.respondedAt,
          expiresAt: addressRequests.expiresAt,
        })
        .from(addressRequests)
        .where(eq(addressRequests.token, token))
        .limit(1)
    ).at(0);

    if (!request) return { ok: false as const, reason: 'not_found' };
    if (request.respondedAt) return { ok: false as const, reason: 'already_submitted' };
    if (new Date() > request.expiresAt) return { ok: false as const, reason: 'expired' };

    const now = new Date();

    await tx
      .update(orders)
      .set({
        deliveryAddress: address,
        addressCollectedAt: now,
        status: 'address_collected',
        updatedAt: now,
      })
      .where(eq(orders.id, request.orderId));

    await tx
      .update(addressRequests)
      .set({ respondedAt: now })
      .where(eq(addressRequests.id, request.id));

    await tx.insert(auditLog).values({
      actorUserId: null,
      entityType: 'order',
      entityId: request.orderId,
      action: 'address.submitted_by_patient',
      diff: { channel: 'whatsapp', token } as Record<string, unknown>,
    });

    return { ok: true as const, orderId: request.orderId };
  });
}
