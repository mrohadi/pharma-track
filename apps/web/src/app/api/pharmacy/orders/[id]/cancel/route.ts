import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/guards';
import { getSession } from '@/lib/session';
import { cancelOrder, getOrderForPharmacy } from '@pharmatrack/db';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
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
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  let reason: string | undefined;
  try {
    const body = await req.json();
    reason = typeof body?.reason === 'string' ? body.reason : undefined;
  } catch {
    // body optional
  }

  const result = await cancelOrder({ orderId: id, actorUserId, reason });
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 422 });
  }

  return NextResponse.json({ ok: true });
}
