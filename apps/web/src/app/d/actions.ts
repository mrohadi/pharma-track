'use server';

import { revalidatePath } from 'next/cache';
import {
  confirmBatchPickup,
  getDriverByUserId,
  generateDeliveryOtp,
  verifyDeliveryOtp,
  failDelivery,
} from '@pharmatrack/db';
import { getWhatsAppClient, TEMPLATES } from '@pharmatrack/whatsapp';
import { getSession } from '@/lib/session';

const UUID_RE = /^[0-9a-f-]{36}$/i;
const PIN_RE = /^[0-9]{6}$/;

// ─── Helpers ────────────────────────────────────────────────────────────

async function requireDriver() {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'driver') return null;
  return session;
}

// ─── Pickup ─────────────────────────────────────────────────────────────

export type PickupActionResult = { ok: true } | { ok: false; reason: string };

export async function confirmPickupAction(formData: FormData): Promise<PickupActionResult> {
  const session = await requireDriver();
  if (!session) return { ok: false, reason: 'Not authorized' };

  const batchId = String(formData.get('batchId') ?? '');
  const pin = String(formData.get('pin') ?? '');

  if (!UUID_RE.test(batchId)) return { ok: false, reason: 'Invalid batch' };
  if (!PIN_RE.test(pin)) return { ok: false, reason: 'PIN must be 6 digits' };

  const driver = await getDriverByUserId(session.user.id);
  if (!driver) return { ok: false, reason: 'No driver profile' };

  const result = await confirmBatchPickup({ batchId, pin, actorUserId: session.user.id });

  if (!result.ok) {
    const messages: Record<string, string> = {
      batch_not_found: 'Batch not found',
      wrong_pin: 'Wrong PIN',
      already_picked_up: 'Already picked up',
      not_assigned: 'Batch not assigned yet',
    };
    return { ok: false, reason: messages[result.reason] ?? result.reason };
  }

  revalidatePath('/d');
  return { ok: true };
}

// ─── Start delivery (generate + send OTP) ───────────────────────────────

export type StartDeliveryResult = { ok: true; message: string } | { ok: false; reason: string };

/**
 * Driver taps "Start delivery" — generates a 6-digit OTP and sends it
 * to the patient via WhatsApp. The driver then asks the patient to
 * read it back.
 */
export async function startDeliveryAction(formData: FormData): Promise<StartDeliveryResult> {
  const session = await requireDriver();
  if (!session) return { ok: false, reason: 'Not authorized' };

  const orderId = String(formData.get('orderId') ?? '');
  if (!UUID_RE.test(orderId)) return { ok: false, reason: 'Invalid order' };

  const result = await generateDeliveryOtp({ orderId, actorUserId: session.user.id });
  if (!result.ok) return { ok: false, reason: result.reason };

  // Send OTP via WhatsApp
  const wa = getWhatsAppClient();
  const firstName = result.patientName.split(' ')[0] ?? result.patientName;

  const sendResult = await wa.sendTemplateMessage({
    to: result.patientPhone,
    templateName: TEMPLATES.DELIVERY_OTP,
    language: 'id',
    bodyParams: [firstName, result.otp],
  });

  if (!sendResult.success) {
    console.error(`[DeliveryOTP] WhatsApp send failed for order ${orderId}:`, sendResult.error);
    // OTP is still generated — driver can ask patient verbally as fallback
  }

  // In mock mode, log the OTP for dev testing
  if ((process.env.WHATSAPP_ADAPTER ?? 'mock') === 'mock') {
    console.log(`[DeliveryOTP] 🔑 OTP for order ${orderId}: ${result.otp}`);
  }

  revalidatePath('/d');
  return { ok: true, message: 'OTP sent to patient via WhatsApp' };
}

// ─── Verify delivery OTP ────────────────────────────────────────────────

export type VerifyOtpActionResult =
  | { ok: true }
  | { ok: false; reason: string; attemptsLeft?: number; lockedMinutes?: number };

export async function verifyDeliveryOtpAction(formData: FormData): Promise<VerifyOtpActionResult> {
  const session = await requireDriver();
  if (!session) return { ok: false, reason: 'Not authorized' };

  const orderId = String(formData.get('orderId') ?? '');
  const otp = String(formData.get('otp') ?? '');

  if (!UUID_RE.test(orderId)) return { ok: false, reason: 'Invalid order' };
  if (!PIN_RE.test(otp)) return { ok: false, reason: 'OTP must be 6 digits' };

  const result = await verifyDeliveryOtp({ orderId, otp, actorUserId: session.user.id });

  if (!result.ok) {
    if (result.reason === 'locked') {
      const mins = Math.ceil((result.lockedUntilMs ?? 0) / 60_000);
      return {
        ok: false,
        reason: `Too many attempts. Locked for ${mins} minutes.`,
        lockedMinutes: mins,
      };
    }
    if (result.reason === 'wrong_otp') {
      return {
        ok: false,
        reason: `Wrong OTP. ${result.attemptsLeft} attempt(s) left.`,
        attemptsLeft: result.attemptsLeft,
      };
    }
    return { ok: false, reason: result.reason };
  }

  revalidatePath('/d');
  return { ok: true };
}

// ─── Fail delivery ──────────────────────────────────────────────────────

export type FailDeliveryActionResult = { ok: true } | { ok: false; reason: string };

export async function failDeliveryAction(formData: FormData): Promise<FailDeliveryActionResult> {
  const session = await requireDriver();
  if (!session) return { ok: false, reason: 'Not authorized' };

  const orderId = String(formData.get('orderId') ?? '');
  const failureReason = String(formData.get('failureReason') ?? '');
  const failureNote = String(formData.get('failureNote') ?? '').trim() || undefined;

  if (!UUID_RE.test(orderId)) return { ok: false, reason: 'Invalid order' };

  const validReasons = [
    'no_answer',
    'wrong_address',
    'patient_refused',
    'patient_not_home',
    'other',
  ];
  if (!validReasons.includes(failureReason)) {
    return { ok: false, reason: 'Select a failure reason' };
  }

  const result = await failDelivery({
    orderId,
    failureReason,
    failureNote,
    actorUserId: session.user.id,
  });

  if (!result.ok) return { ok: false, reason: result.reason };

  revalidatePath('/d');
  return { ok: true };
}
