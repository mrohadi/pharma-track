import type {
  WhatsAppAdapter,
  SendTemplateMessageOpts,
  SendTextMessageOpts,
  SendMessageResult,
} from './types';

export type MockMessage = {
  id: string;
  timestamp: Date;
  type: 'template' | 'text';
  to: string;
  templateName?: string;
  body?: string;
  params?: string[];
};

/**
 * Dev/test adapter — logs to console and stores messages in-memory.
 *
 * In dev mode the address-collection link is logged to stdout so you can
 * click it directly without needing a real WhatsApp message.
 */
export class MockWhatsAppAdapter implements WhatsAppAdapter {
  readonly sent: MockMessage[] = [];

  async sendTemplateMessage(opts: SendTemplateMessageOpts): Promise<SendMessageResult> {
    const id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const msg: MockMessage = {
      id,
      timestamp: new Date(),
      type: 'template',
      to: opts.to,
      templateName: opts.templateName,
      params: opts.bodyParams,
    };
    this.sent.push(msg);

    const urlSuffix = opts.buttonUrlSuffix ? ` → button URL suffix: ${opts.buttonUrlSuffix}` : '';
    console.log(
      `[WhatsApp MOCK] 📱 Template "${opts.templateName}" → ${opts.to}` +
        `${opts.bodyParams?.length ? ` params=${JSON.stringify(opts.bodyParams)}` : ''}` +
        urlSuffix,
    );

    return { success: true, messageId: id };
  }

  async sendTextMessage(opts: SendTextMessageOpts): Promise<SendMessageResult> {
    const id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const msg: MockMessage = {
      id,
      timestamp: new Date(),
      type: 'text',
      to: opts.to,
      body: opts.body,
    };
    this.sent.push(msg);

    console.log(`[WhatsApp MOCK] 💬 Text → ${opts.to}: ${opts.body}`);

    return { success: true, messageId: id };
  }
}
