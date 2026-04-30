import type {
  WhatsAppAdapter,
  SendTemplateMessageOpts,
  SendTextMessageOpts,
  SendMessageResult,
} from './types';

type TwilioConfig = {
  /** Twilio Account SID (ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx). */
  accountSid: string;
  /** Twilio Auth Token. */
  authToken: string;
  /**
   * WhatsApp-enabled sender number in E.164 format, e.g. '+14155238886'.
   * The adapter prefixes it with 'whatsapp:' automatically.
   */
  from: string;
};

/**
 * Production adapter — calls Twilio Messages API for WhatsApp.
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM   e.g. +14155238886
 *
 * Template ContentSid mapping (optional but recommended):
 *   TWILIO_SID_<TEMPLATE_NAME_UPPERCASED>
 *   e.g. TWILIO_SID_DELIVERY_OTP_V1=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *
 * If the env mapping is absent, templateName is used as ContentSid directly.
 */
export class TwilioWhatsAppAdapter implements WhatsAppAdapter {
  private readonly config: TwilioConfig;
  private readonly baseUrl: string;

  constructor(config: TwilioConfig) {
    this.config = config;
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
  }

  async sendTemplateMessage(opts: SendTemplateMessageOpts): Promise<SendMessageResult> {
    // Resolve ContentSid: check env override, fall back to templateName as ContentSid
    const envKey = `TWILIO_SID_${opts.templateName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
    const contentSid = process.env[envKey] ?? opts.templateName;

    // ContentVariables: {"1": "param1", "2": "param2", ...}
    const allParams = [...(opts.bodyParams ?? []), ...(opts.headerParams ?? [])];
    const contentVariables =
      allParams.length > 0
        ? JSON.stringify(Object.fromEntries(allParams.map((v, i) => [String(i + 1), v])))
        : undefined;

    const params: Record<string, string> = {
      From: `whatsapp:${this.config.from}`,
      To: `whatsapp:${opts.to}`,
      ContentSid: contentSid,
    };
    if (contentVariables) params.ContentVariables = contentVariables;

    return this.post(params);
  }

  async sendTextMessage(opts: SendTextMessageOpts): Promise<SendMessageResult> {
    return this.post({
      From: `whatsapp:${this.config.from}`,
      To: `whatsapp:${opts.to}`,
      Body: opts.body,
    });
  }

  private async post(params: Record<string, string>): Promise<SendMessageResult> {
    try {
      const credentials = Buffer.from(
        `${this.config.accountSid}:${this.config.authToken}`,
      ).toString('base64');

      const res = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(params).toString(),
      });

      const data = (await res.json()) as {
        sid?: string;
        status?: string;
        error_message?: string;
        error_code?: number;
      };

      if (!res.ok) {
        console.error('[WhatsApp Twilio] send failed:', data.error_message, data.error_code);
        return {
          success: false,
          error: data.error_message ?? `HTTP ${res.status}`,
        };
      }

      return { success: true, messageId: data.sid };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[WhatsApp Twilio] network error:', msg);
      return { success: false, error: msg };
    }
  }
}
