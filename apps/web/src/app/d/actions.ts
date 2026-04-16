'use server';

import { revalidatePath } from 'next/cache';
import { confirmBatchPickup, getDriverByUserId } from '@pharmatrack/db';
import { getSession } from '@/lib/session';

const UUID_RE = /^[0-9a-f-]{36}$/i;
const PIN_RE = /^[0-9]{6}$/;

export type PickupActionResult = { ok: true } | { ok: false; reason: string };

export async function confirmPickupAction(formData: FormData): Promise<PickupActionResult> {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'driver') {
    return { ok: false, reason: 'Not authorized' };
  }

  const batchId = String(formData.get('batchId') ?? '');
  const pin = String(formData.get('pin') ?? '');

  if (!UUID_RE.test(batchId)) return { ok: false, reason: 'Invalid batch' };
  if (!PIN_RE.test(pin)) return { ok: false, reason: 'PIN must be 6 digits' };

  const driver = await getDriverByUserId(session.user.id);
  if (!driver) return { ok: false, reason: 'No driver profile' };

  const result = await confirmBatchPickup({
    batchId,
    pin,
    actorUserId: session.user.id,
  });

  if (!result.ok) {
    switch (result.reason) {
      case 'batch_not_found':
        return { ok: false, reason: 'Batch not found' };
      case 'wrong_pin':
        return { ok: false, reason: 'Wrong PIN' };
      case 'already_picked_up':
        return { ok: false, reason: 'Already picked up' };
      case 'not_assigned':
        return { ok: false, reason: 'Batch not assigned yet' };
    }
  }

  revalidatePath('/d');
  return { ok: true };
}
