import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getDriverByUserId, updateDriverLocation } from '@pharmatrack/db';

/**
 * POST /api/driver/location
 * Body: { lat: number, lng: number }
 * Driver-only. Updates lastLat/lastLng/lastLocationAt.
 * Called from the PWA driver map page every 30 seconds.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'driver') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { lat, lng } = body as { lat?: unknown; lng?: unknown };

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return NextResponse.json({ error: 'lat and lng must be numbers' }, { status: 422 });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'lat/lng out of range' }, { status: 422 });
  }

  const driver = await getDriverByUserId(session.user.id);
  if (!driver) {
    return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 });
  }

  await updateDriverLocation(driver.id, lat, lng);

  return NextResponse.json({ ok: true });
}
