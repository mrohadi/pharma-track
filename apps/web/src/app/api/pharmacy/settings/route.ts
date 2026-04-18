import { NextRequest, NextResponse } from 'next/server';
import { PharmacySettings } from '@pharmatrack/shared';
import { getPharmacySettings, updatePharmacySettings } from '@pharmatrack/db';
import { getSession } from '@/lib/session';

/**
 * GET /api/pharmacy/settings
 * Returns the current settings for the authenticated pharmacy user.
 */
export async function GET() {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'pharmacy') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pharmacyId = session.user.pharmacyId as string | undefined;
  if (!pharmacyId) {
    return NextResponse.json({ error: 'No pharmacy linked to account' }, { status: 400 });
  }

  const settings = await getPharmacySettings(pharmacyId);
  return NextResponse.json(settings);
}

/**
 * PATCH /api/pharmacy/settings
 * Updates settings for the authenticated pharmacy user.
 * Body: Partial<PharmacySettings>
 */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'pharmacy') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pharmacyId = session.user.pharmacyId as string | undefined;
  if (!pharmacyId) {
    return NextResponse.json({ error: 'No pharmacy linked to account' }, { status: 400 });
  }

  const body = await req.json();
  const parsed = PharmacySettings.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  await updatePharmacySettings(pharmacyId, session.user.id, parsed.data);

  return NextResponse.json({ ok: true });
}
