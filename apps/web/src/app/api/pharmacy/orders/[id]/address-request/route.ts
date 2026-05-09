'use server';

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/guards';
import { getSession } from '@/lib/session';
import { createAddressRequest, getOrderForPharmacy } from '@pharmatrack/db';
import { getWhatsAppClient, TEMPLATES } from '@pharmatrack/whatsapp';

const UUID_RE = /^[0-9a-f-]{36}$/i;

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await requireRole('pharmacy');
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
  }

  const session = await getSession();
  const actorUserId = session?.user?.id ?? '';
  const pharmacyId = session?.user?.pharmacyId as string | undefined;
  if (!pharmacyId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const order = await getOrderForPharmacy(id, pharmacyId);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  if (order.status !== 'pending_address') {
    return NextResponse.json({ error: 'Order not in pending_address status' }, { status: 422 });
  }

  const result = await createAddressRequest({ orderId: id, actorUserId });
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 422 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://pharmatrack.app';
  const addressUrl = `${baseUrl}/address/${result.token}`;
  const firstName = result.patientName.split(' ')[0] ?? result.patientName;

  const wa = getWhatsAppClient();

  // Send template ({{1}} = firstName, {{2}} = pharmacyName)
  const templateResult = await wa.sendTemplateMessage({
    to: result.patientPhone,
    templateName: TEMPLATES.ADDRESS_COLLECTION,
    language: 'id',
    bodyParams: [firstName, result.pharmacyName],
  });

  if (templateResult.success) {
    // Follow up with the actual address link as a plain text message
    await wa.sendTextMessage({
      to: result.patientPhone,
      body: addressUrl,
    });
  } else {
    console.error('[AddressRequest] WhatsApp send failed:', templateResult.error);
    // Return ok — token saved, pharmacy can retry or patient can be contacted manually
    return NextResponse.json({ ok: true, warned: 'whatsapp_failed', token: result.token });
  }

  return NextResponse.json({ ok: true, token: result.token });
}
