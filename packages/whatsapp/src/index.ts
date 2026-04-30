export type {
  WhatsAppAdapter,
  SendTemplateMessageOpts,
  SendTextMessageOpts,
  SendMessageResult,
} from './types';
export { MockWhatsAppAdapter } from './mock-adapter';
export { MetaWhatsAppAdapter } from './meta-adapter';
export { TwilioWhatsAppAdapter } from './twilio-adapter';
export { TEMPLATES, type TemplateName } from './templates';

import type { WhatsAppAdapter } from './types';
import { MockWhatsAppAdapter } from './mock-adapter';
import { MetaWhatsAppAdapter } from './meta-adapter';
import { TwilioWhatsAppAdapter } from './twilio-adapter';

/**
 * Singleton factory — returns the adapter matching WHATSAPP_ADAPTER env.
 *
 * Defaults to 'mock' when env is not set (local dev).
 *
 * Meta:   WHATSAPP_ADAPTER=meta   + WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID
 * Twilio: WHATSAPP_ADAPTER=twilio + TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_WHATSAPP_FROM
 */
let _instance: WhatsAppAdapter | null = null;

export function getWhatsAppClient(): WhatsAppAdapter {
  if (_instance) return _instance;

  const adapter = process.env.WHATSAPP_ADAPTER ?? 'mock';

  if (adapter === 'meta') {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!accessToken || !phoneNumberId) {
      throw new Error(
        'WHATSAPP_ADAPTER=meta requires WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID',
      );
    }
    _instance = new MetaWhatsAppAdapter({ accessToken, phoneNumberId });
  } else if (adapter === 'twilio') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    if (!accountSid || !authToken || !from) {
      throw new Error(
        'WHATSAPP_ADAPTER=twilio requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM',
      );
    }
    _instance = new TwilioWhatsAppAdapter({ accountSid, authToken, from });
  } else {
    _instance = new MockWhatsAppAdapter();
  }

  console.log(`[WhatsApp] Using ${adapter} adapter`);
  return _instance;
}
