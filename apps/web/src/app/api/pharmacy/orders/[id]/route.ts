import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/guards';
import { getSession } from '@/lib/session';
import { getOrderForPharmacy, updateOrderFields } from '@pharmatrack/db';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireRole('pharmacy');
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const session = await getSession();
  const pharmacyId = session?.user?.pharmacyId as string | undefined;

  if (!pharmacyId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const order = await getOrderForPharmacy(id, pharmacyId);
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireRole('pharmacy');
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
  }

  const session = await getSession();
  const actorUserId = session?.user?.id ?? '';
  const pharmacyId = session?.user?.pharmacyId as string | undefined;

  if (!pharmacyId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const order = await getOrderForPharmacy(id, pharmacyId);
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const TERMINAL = new Set(['delivered', 'failed', 'cancelled']);
  if (TERMINAL.has(order.status)) {
    return NextResponse.json({ error: 'Cannot edit a terminal order' }, { status: 422 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const patch: Partial<{
    patientName: string;
    patientPhone: string;
    patientEmail: string | null;
    medicineText: string;
    deliveryAddress: string | null;
    notes: string | null;
  }> = {};

  if (typeof body.patientName === 'string' && body.patientName.trim())
    patch.patientName = body.patientName.trim();
  if (typeof body.patientPhone === 'string' && body.patientPhone.trim())
    patch.patientPhone = body.patientPhone.trim();
  if ('patientEmail' in body)
    patch.patientEmail =
      typeof body.patientEmail === 'string' ? body.patientEmail.trim() || null : null;
  if (typeof body.medicineText === 'string' && body.medicineText.trim())
    patch.medicineText = body.medicineText.trim();
  if ('deliveryAddress' in body)
    patch.deliveryAddress =
      typeof body.deliveryAddress === 'string' ? body.deliveryAddress.trim() || null : null;
  if ('notes' in body)
    patch.notes = typeof body.notes === 'string' ? body.notes.trim() || null : null;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  await updateOrderFields(id, actorUserId, patch);

  return NextResponse.json({ ok: true });
}
