'use server';

import { revalidatePath } from 'next/cache';
import { createBatch, regenerateBatchPin } from '@pharmatrack/db';
import { getSession } from '@/lib/session';
import { sendPushToDriver } from '@/lib/push';

const UUID_RE = /^[0-9a-f-]{36}$/i;

export type CreateBatchActionResult =
  | { ok: true; batchId: string; pin: string; orderCount: number }
  | { ok: false; reason: string };

/**
 * Admin creates a batch from selected order IDs + a driver.
 * Returns the plaintext pickup PIN to display once.
 */
export async function createBatchAction(formData: FormData): Promise<CreateBatchActionResult> {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'admin') {
    return { ok: false, reason: 'Not authorized' };
  }

  const driverId = String(formData.get('driverId') ?? '');
  const pharmacyId = String(formData.get('pharmacyId') ?? '');
  const orderIdsRaw = String(formData.get('orderIds') ?? '');

  if (!UUID_RE.test(driverId)) return { ok: false, reason: 'Select a driver' };
  if (!UUID_RE.test(pharmacyId)) return { ok: false, reason: 'Invalid pharmacy' };

  const orderIds = orderIdsRaw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => UUID_RE.test(s));

  if (orderIds.length === 0) return { ok: false, reason: 'Select at least one order' };

  const result = await createBatch({
    orderIds,
    driverId,
    pharmacyId,
    actorUserId: session.user.id,
  });

  if (!result.ok) return { ok: false, reason: result.reason };

  // Fire-and-forget push notification to the assigned driver
  sendPushToDriver(driverId, {
    title: 'New batch assigned',
    body: `A batch of ${result.orderCount} order${result.orderCount === 1 ? '' : 's'} is ready for pickup.`,
  }).catch(console.error);

  revalidatePath('/admin');
  revalidatePath('/admin/batches');
  revalidatePath('/driver');

  return { ok: true, batchId: result.batchId, pin: result.pin, orderCount: result.orderCount };
}

export type RegeneratePinActionResult = { ok: true; pin: string } | { ok: false; reason: string };

export async function regeneratePinAction(batchId: string): Promise<RegeneratePinActionResult> {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'admin') {
    return { ok: false, reason: 'Not authorized' };
  }
  if (!UUID_RE.test(batchId)) return { ok: false, reason: 'Invalid batch ID' };

  const result = await regenerateBatchPin({ batchId, actorUserId: session.user.id });
  if (!result.ok) return { ok: false, reason: result.reason };

  revalidatePath('/admin/batches');
  return { ok: true, pin: result.pin };
}
