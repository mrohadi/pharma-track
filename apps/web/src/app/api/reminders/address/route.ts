import { NextRequest, NextResponse } from 'next/server';
import { getPendingAddressReminders, markReminderSent } from '@pharmatrack/db';
import { getWhatsAppClient, TEMPLATES } from '@pharmatrack/whatsapp';

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Env-configurable reminder settings.
 * REMINDER_INTERVAL_HOURS — hours between first/subsequent reminders (default 6)
 * REMINDER_MAX_COUNT      — max reminders per request before giving up (default 2)
 */
const INTERVAL_HOURS = Number(process.env.REMINDER_INTERVAL_HOURS ?? '6');
const MAX_REMINDERS = Number(process.env.REMINDER_MAX_COUNT ?? '2');

/**
 * GET /api/reminders/address
 *
 * Cron endpoint — re-sends WhatsApp address-collection messages for orders
 * where the patient has not responded after REMINDER_INTERVAL_HOURS hours.
 * Stops after REMINDER_MAX_COUNT total reminders.
 *
 * Authentication: Authorization: Bearer <CRON_SECRET>
 * If CRON_SECRET is not set, the endpoint is disabled (returns 503).
 */
export async function GET(req: NextRequest) {
  if (!CRON_SECRET) {
    return NextResponse.json({ error: 'Reminder endpoint not configured' }, { status: 503 });
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pending = await getPendingAddressReminders({
    intervalHours: INTERVAL_HOURS,
    maxReminders: MAX_REMINDERS,
  });

  if (pending.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const wa = getWhatsAppClient();
  let sent = 0;
  const errors: { orderId: string; error: string }[] = [];

  for (const reminder of pending) {
    const addressUrl = `${APP_URL}/address/${reminder.token}`;
    const firstName = reminder.patientName.split(' ')[0] ?? reminder.patientName;

    const result = await wa.sendTemplateMessage({
      to: reminder.patientPhone,
      templateName: TEMPLATES.ADDRESS_REMINDER,
      language: 'id',
      bodyParams: [firstName, reminder.pharmacyName],
      buttonUrlSuffix: reminder.token,
    });

    if (result.success) {
      await markReminderSent({
        requestId: reminder.requestId,
        orderId: reminder.orderId,
      });
      sent++;

      if ((process.env.WHATSAPP_ADAPTER ?? 'mock') === 'mock') {
        console.log(
          `[AddressReminder] 🔗 Reminder link for ${reminder.patientName}: ${addressUrl}`,
        );
      }
    } else {
      console.error(
        `[AddressReminder] WhatsApp send failed for order ${reminder.orderId}:`,
        result.error,
      );
      errors.push({ orderId: reminder.orderId, error: result.error ?? 'unknown' });
    }
  }

  return NextResponse.json({ sent, errors: errors.length ? errors : undefined });
}
