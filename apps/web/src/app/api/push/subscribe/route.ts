import { NextRequest, NextResponse } from 'next/server';
import { getDriverByUserId, savePushSubscription, deletePushSubscription } from '@pharmatrack/db';
import { getSession } from '@/lib/session';

async function requireDriverSession() {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'driver') return null;
  return session;
}

/** POST /api/push/subscribe — save a Web Push subscription for the current driver. */
export async function POST(req: NextRequest) {
  const session = await requireDriverSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const driver = await getDriverByUserId(session.user.id);
  if (!driver) return NextResponse.json({ error: 'No driver profile' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const endpoint = body?.endpoint;
  const p256dh = body?.keys?.p256dh;
  const auth = body?.keys?.auth;

  if (typeof endpoint !== 'string' || typeof p256dh !== 'string' || typeof auth !== 'string') {
    return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
  }

  await savePushSubscription({ driverId: driver.id, endpoint, p256dh, auth });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/push/subscribe — remove a push subscription by endpoint. */
export async function DELETE(req: NextRequest) {
  const session = await requireDriverSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const endpoint = body?.endpoint;
  if (typeof endpoint !== 'string') {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
  }

  await deletePushSubscription(endpoint);
  return NextResponse.json({ ok: true });
}
