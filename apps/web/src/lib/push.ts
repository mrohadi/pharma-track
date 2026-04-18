import webpush from 'web-push';
import { getDriverPushSubscriptions, deletePushSubscription } from '@pharmatrack/db';

let vapidConfigured = false;

function ensureVapidConfigured() {
  if (vapidConfigured) return;
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) return;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

export type PushPayload = {
  title: string;
  body: string;
};

/**
 * Send a push notification to all active subscriptions for a driver.
 * Stale subscriptions (410 Gone) are automatically removed.
 * Errors are logged and swallowed — push is best-effort.
 */
export async function sendPushToDriver(driverId: string, payload: PushPayload): Promise<void> {
  ensureVapidConfigured();
  if (!vapidConfigured) {
    console.warn('[Push] VAPID keys not configured — skipping notification');
    return;
  }

  const subscriptions = await getDriverPushSubscriptions(driverId);
  if (subscriptions.length === 0) return;

  const body = JSON.stringify(payload);

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          // Subscription expired — clean it up
          await deletePushSubscription(sub.endpoint).catch(() => {});
        } else {
          console.error('[Push] Failed to send notification:', err);
        }
      }
    }),
  );
}
