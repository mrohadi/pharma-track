import type {
  WhatsAppAdapter,
  SendTemplateMessageOpts,
  SendTextMessageOpts,
  SendMessageResult,
} from './types';

type MetaConfig = {
  /** Meta WhatsApp Cloud API access token. */
  accessToken: string;
  /** Phone number ID from the Meta Business dashboard. */
  phoneNumberId: string;
  /** API version, e.g. 'v21.0'. */
  apiVersion?: string;
};

/**
 * Production adapter — calls Meta WhatsApp Cloud API.
 *
 * Requires:
 * - WHATSAPP_ACCESS_TOKEN
 * - WHATSAPP_PHONE_NUMBER_ID
 *
 * Template messages must be pre-approved in Meta Business Manager.
 * Free-form text messages only work within 24h of a user-initiated
 * conversation.
 */
export class MetaWhatsAppAdapter implements WhatsAppAdapter {
  private readonly baseUrl: string;
  private readonly accessToken: string;

  constructor(config: MetaConfig) {
    const version = config.apiVersion ?? 'v21.0';
    this.baseUrl = `https://graph.facebook.com/${version}/${config.phoneNumberId}`;
    this.accessToken = config.accessToken;
  }

  async sendTemplateMessage(opts: SendTemplateMessageOpts): Promise<SendMessageResult> {
    const components: Record<string, unknown>[] = [];

    if (opts.headerParams?.length) {
      components.push({
        type: 'header',
        parameters: opts.headerParams.map((text) => ({ type: 'text', text })),
      });
    }

    if (opts.bodyParams?.length) {
      components.push({
        type: 'body',
        parameters: opts.bodyParams.map((text) => ({ type: 'text', text })),
      });
    }

    if (opts.buttonUrlSuffix) {
      components.push({
        type: 'button',
        sub_type: 'url',
        index: 0,
        parameters: [{ type: 'text', text: opts.buttonUrlSuffix }],
      });
    }

    const payload = {
      messaging_product: 'whatsapp',
      to: opts.to.replace('+', ''), // Meta expects country code without +
      type: 'template',
      template: {
        name: opts.templateName,
        language: { code: opts.language },
        ...(components.length > 0 ? { components } : {}),
      },
    };

    return this.post('/messages', payload);
  }

  async sendTextMessage(opts: SendTextMessageOpts): Promise<SendMessageResult> {
    const payload = {
      messaging_product: 'whatsapp',
      to: opts.to.replace('+', ''),
      type: 'text',
      text: { body: opts.body },
    };
    return this.post('/messages', payload);
  }

  private async post(path: string, body: unknown): Promise<SendMessageResult> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as {
        messages?: { id: string }[];
        error?: { message: string; code: number };
      };

      if (!res.ok || data.error) {
        console.error('[WhatsApp META] send failed:', data.error);
        return { success: false, error: data.error?.message ?? `HTTP ${res.status}` };
      }

      const messageId = data.messages?.[0]?.id;
      return { success: true, messageId };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[WhatsApp META] network error:', msg);
      return { success: false, error: msg };
    }
  }
}
