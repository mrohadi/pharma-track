export type {
  WhatsAppAdapter,
  SendTemplateMessageOpts,
  SendTextMessageOpts,
  SendMessageResult,
} from './types';
export { MockWhatsAppAdapter } from './mock-adapter';
export { MetaWhatsAppAdapter } from './meta-adapter';
export { TEMPLATES, type TemplateName } from './templates';

import type { WhatsAppAdapter } from './types';
import { MockWhatsAppAdapter } from './mock-adapter';
import { MetaWhatsAppAdapter } from './meta-adapter';

/**
 * Singleton factory — returns the adapter matching WHATSAPP_ADAPTER env.
 *
 * Defaults to 'mock' when env is not set (local dev).
 * Set WHATSAPP_ADAPTER=meta + WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID
 * for production.
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
  } else {
    _instance = new MockWhatsAppAdapter();
  }

  console.log(`[WhatsApp] Using ${adapter} adapter`);
  return _instance;
}
