import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/guards';
import { cancelOrder } from '@pharmatrack/db';
import { getSession } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await requireRole('admin');
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
  }

  const session = await getSession();
  const actorUserId = session?.user?.id ?? '';

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
