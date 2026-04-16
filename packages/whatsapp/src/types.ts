/**
 * WhatsApp adapter interface.
 *
 * Two implementations:
 * - MockWhatsAppAdapter: logs to console, records in a local array (dev/test)
 * - MetaWhatsAppAdapter: calls Meta Cloud API (production)
 *
 * Swap via WHATSAPP_ADAPTER env var ('mock' | 'meta').
 */

export type SendTemplateMessageOpts = {
  /** Recipient phone in E.164 format (e.g. +6281234567890). */
  to: string;
  /** Meta-approved template name, e.g. 'address_collection_v1'. */
  templateName: string;
  /** Language code, e.g. 'id' (Indonesian) or 'en'. */
  language: string;
  /** Positional parameters to fill template body variables. */
  bodyParams?: string[];
  /** Positional parameters to fill template header variables. */
  headerParams?: string[];
  /** Button URL suffix (for dynamic-URL buttons). */
  buttonUrlSuffix?: string;
};

export type SendTextMessageOpts = {
  /** Recipient phone in E.164 format. */
  to: string;
  /** Plain-text body. */
  body: string;
};

export type SendMessageResult = {
  success: boolean;
  /** Meta message ID (wamid) on success, or undefined for mock. */
  messageId?: string;
  /** Error message on failure. */
  error?: string;
};

export interface WhatsAppAdapter {
  /** Send a pre-approved template message (e.g. address collection). */
  sendTemplateMessage(opts: SendTemplateMessageOpts): Promise<SendMessageResult>;
  /** Send a free-form text message (only within a 24h conversation window). */
  sendTextMessage(opts: SendTextMessageOpts): Promise<SendMessageResult>;
}
