import { createOrderWithItems, createAddressRequest } from '@pharmatrack/db';
import { getWhatsAppClient, TEMPLATES } from '@pharmatrack/whatsapp';
import type { OrderWizardInput } from '@pharmatrack/shared';

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';

/**
 * Create an order from the pharmacy manual-entry wizard.
 *
 * - Writes the order + line-items + audit log in one transaction (via createOrderWithItems).
 * - If no delivery address was provided, triggers the WhatsApp address-collection flow.
 */
export async function createOrderFromWizard(
  pharmacyId: string,
  actorUserId: string,
  input: OrderWizardInput,
): Promise<{ orderId: string }> {
  const medicineText = input.items.map((i) => `${i.name} x${i.quantity}`).join(', ');

  const { orderId } = await createOrderWithItems({
    pharmacyId,
    actorUserId,
    patientName: input.patientName,
    patientPhone: input.patientPhone,
    medicineText,
    deliveryAddress: input.deliveryAddress || undefined,
    items: input.items,
    priority: input.priority,
    paymentMode: input.paymentMode,
    notes: input.notes || undefined,
  });

  // If no address was given, kick off the WhatsApp address-collection flow.
  if (!input.deliveryAddress) {
    const result = await createAddressRequest({ orderId, actorUserId });

    if (result.ok) {
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
        console.error(
          `[createOrderFromWizard] WhatsApp send failed for order ${orderId}:`,
          sendResult.error,
        );
      }

      if ((process.env.WHATSAPP_ADAPTER ?? 'mock') === 'mock') {
        console.log(`[createOrderFromWizard] 🔗 Patient address form: ${addressUrl}`);
      }
    } else {
      console.error(
        `[createOrderFromWizard] createAddressRequest failed for order ${orderId}:`,
        result.reason,
      );
    }
  }

  return { orderId };
}
