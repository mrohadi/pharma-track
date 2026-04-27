import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/guards';
import { approveLegalDocUpdate, rejectLegalDocUpdate } from '@pharmatrack/db';
import { getSession } from '@/lib/session';

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/pharmacies/[id]/legal
 * Body: { action: 'approve', auditId, siaNumber?, sipaNumber? }
 *    or { action: 'reject',  auditId, reason }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireRole('admin');
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: pharmacyId } = await params;
  const session = await getSession();
  const actorUserId = session?.user?.id ?? '';

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { action, auditId, siaNumber, sipaNumber, reason } = body as {
    action?: string;
    auditId?: string;
    siaNumber?: string;
    sipaNumber?: string;
    reason?: string;
  };

  if (!auditId) return NextResponse.json({ error: 'auditId required' }, { status: 422 });

  if (action === 'approve') {
    await approveLegalDocUpdate({ pharmacyId, auditId, actorUserId, siaNumber, sipaNumber });
    return NextResponse.json({ ok: true });
  }

  if (action === 'reject') {
    if (!reason?.trim()) return NextResponse.json({ error: 'reason required' }, { status: 422 });
    await rejectLegalDocUpdate({ pharmacyId, auditId, actorUserId, reason: reason.trim() });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 422 });
}
