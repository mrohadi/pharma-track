import { eq } from 'drizzle-orm';
import { db } from '../index';
import { pushSubscriptions } from '../schema';

export type PushSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

/** Save (upsert) a Web Push subscription for a driver. */
export async function savePushSubscription(opts: {
  driverId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}): Promise<void> {
  await db
    .insert(pushSubscriptions)
    .values(opts)
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { p256dh: opts.p256dh, auth: opts.auth },
    });
}

/** Remove a push subscription by its endpoint (called on unsubscribe). */
export async function deletePushSubscription(endpoint: string): Promise<void> {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

/** Get all active push subscriptions for a driver. */
export async function getDriverPushSubscriptions(driverId: string): Promise<PushSubscriptionRow[]> {
  return db
    .select({
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth,
    })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.driverId, driverId));
}
