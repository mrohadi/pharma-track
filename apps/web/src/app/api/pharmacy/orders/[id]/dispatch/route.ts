import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/guards';
import { getSession } from '@/lib/session';
import { findAvailableDriver, assignOrderToDriver, getOrderForPharmacy } from '@pharmatrack/db';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
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

  const dispatchableStatuses = ['pending_address', 'address_collected'];
  if (!dispatchableStatuses.includes(order.status)) {
    return NextResponse.json(
      { error: 'Order cannot be dispatched in current status' },
      { status: 422 },
    );
  }

  const driverId = await findAvailableDriver();
  if (!driverId) {
    return NextResponse.json({ error: 'No available drivers at this time' }, { status: 422 });
  }

  const result = await assignOrderToDriver({ orderId: id, driverId, actorUserId });
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 422 });
  }

  return NextResponse.json({ ok: true, driverId });
}
