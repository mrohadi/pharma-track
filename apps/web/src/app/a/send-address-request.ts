'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAddressRequest } from '@pharmatrack/db';
import { getWhatsAppClient, TEMPLATES } from '@pharmatrack/whatsapp';
import { getSession } from '@/lib/session';

const UUID_RE = /^[0-9a-f-]{36}$/i;
const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';

/**
 * Admin triggers an address-collection WhatsApp message for an order.
 * Creates an address_request row with a unique token, then sends the
 * message via whichever adapter is active (mock or Meta).
 */
export async function sendAddressRequestAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  const orderId = String(formData.get('orderId') ?? '');
  if (!UUID_RE.test(orderId)) {
    redirect('/a?error=invalid_order_id');
  }

  const result = await createAddressRequest({
    orderId,
    actorUserId: session.user.id,
  });

  if (!result.ok) {
    redirect(`/a?error=${result.reason}`);
  }

  // Send the WhatsApp message
  const wa = getWhatsAppClient();
  const addressUrl = `${APP_URL}/address/${result.token}`;
  const firstName = result.patientName.split(' ')[0] ?? result.patientName;

  const sendResult = await wa.sendTemplateMessage({
    to: result.patientPhone,
    templateName: TEMPLATES.ADDRESS_COLLECTION,
    language: 'id',
    bodyParams: [firstName, result.pharmacyName],
    buttonUrlSuffix: result.token,
  });

  if (!sendResult.success) {
    console.error(`[AddressRequest] WhatsApp send failed for order ${orderId}:`, sendResult.error);
    // We don't redirect with error — the address_request is still created
    // and the admin can retry or the patient can be contacted manually.
  }

  // In mock mode, log the URL so devs can click it directly
  if ((process.env.WHATSAPP_ADAPTER ?? 'mock') === 'mock') {
    console.log(`[AddressRequest] 🔗 Patient address form: ${addressUrl}`);
  }

  revalidatePath('/a');
  redirect('/a');
}
