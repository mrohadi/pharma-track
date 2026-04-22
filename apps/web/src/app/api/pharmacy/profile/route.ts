import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updatePharmacyProfile, requestLegalDocUpdate } from '@/lib/services/pharmacy';
import { getSession } from '@/lib/session';

const ProfileSchema = z.object({
  name: z.string().min(1).optional(),
  picName: z.string().optional(),
  phone: z.string().optional(),
  npwp: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
});

const LegalSchema = z.object({
  siaNumber: z.string().optional(),
  sipaNumber: z.string().optional(),
});

/**
 * PATCH /api/pharmacy/profile
 *
 * Body A — profile fields (name, picName, phone, npwp, province, city, address)
 * Body B — legal docs (siaNumber, sipaNumber) → audit-only, awaiting_admin_review
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

  if ('siaNumber' in body || 'sipaNumber' in body) {
    const parsed = LegalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }
    await requestLegalDocUpdate(pharmacyId, session.user.id, parsed.data);
    return NextResponse.json({ ok: true, status: 'awaiting_admin_review' });
  }

  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  await updatePharmacyProfile(pharmacyId, session.user.id, parsed.data);
  return NextResponse.json({ ok: true });
}
