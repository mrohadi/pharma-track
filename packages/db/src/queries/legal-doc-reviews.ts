import { and, desc, eq } from 'drizzle-orm';
import { db } from '../index';
import { auditLog, pharmacies, users } from '../schema';

export type PendingLegalDocRow = {
  auditId: string;
  pharmacyId: string;
  pharmacyName: string;
  requestedAt: Date;
  actorEmail: string | null;
  requested: { siaNumber?: string; sipaNumber?: string };
};

/**
 * List all unresolved pharmacy legal doc update requests.
 * A request is unresolved when action = 'pharmacy.legal_doc_update_requested'
 * and no subsequent 'pharmacy.legal_doc_approved' or 'pharmacy.legal_doc_rejected'
 * entry exists for the same entityId.
 */
export async function listPendingLegalDocReviews(): Promise<PendingLegalDocRow[]> {
  // Get all requests
  const requests = await db
    .select({
      auditId: auditLog.id,
      pharmacyId: auditLog.entityId,
      pharmacyName: pharmacies.name,
      requestedAt: auditLog.at,
      actorEmail: users.email,
      diff: auditLog.diff,
    })
    .from(auditLog)
    .innerJoin(pharmacies, eq(auditLog.entityId, pharmacies.id))
    .leftJoin(users, eq(auditLog.actorUserId, users.id))
    .where(eq(auditLog.action, 'pharmacy.legal_doc_update_requested'))
    .orderBy(desc(auditLog.at));

  // Simple approach: for each request check if a resolution exists after it
  const resolutionActions = new Set(['pharmacy.legal_doc_approved', 'pharmacy.legal_doc_rejected']);

  const resolutions = await db
    .select({ entityId: auditLog.entityId, action: auditLog.action, at: auditLog.at })
    .from(auditLog)
    .where(eq(auditLog.entityType, 'pharmacy'));

  const resolvedMap = new Map<string, Date>();
  for (const r of resolutions) {
    if (resolutionActions.has(r.action)) {
      const existing = resolvedMap.get(r.entityId);
      if (!existing || r.at > existing) resolvedMap.set(r.entityId, r.at);
    }
  }

  return requests
    .filter((r) => {
      const resolvedAt = resolvedMap.get(r.pharmacyId);
      return !resolvedAt || resolvedAt < r.requestedAt;
    })
    .map((r) => ({
      auditId: r.auditId,
      pharmacyId: r.pharmacyId,
      pharmacyName: r.pharmacyName,
      requestedAt: r.requestedAt,
      actorEmail: r.actorEmail,
      requested: ((r.diff as Record<string, unknown>)?.requested ?? {}) as {
        siaNumber?: string;
        sipaNumber?: string;
      },
    }));
}

export async function approveLegalDocUpdate(opts: {
  pharmacyId: string;
  auditId: string;
  actorUserId: string;
  siaNumber?: string;
  sipaNumber?: string;
}): Promise<void> {
  const { pharmacyId, auditId, actorUserId, siaNumber, sipaNumber } = opts;

  await db.transaction(async (tx) => {
    // Apply the doc update to pharmacies table
    const patch: Record<string, string | Date> = { updatedAt: new Date() };
    if (siaNumber) patch.siaNumber = siaNumber;
    if (sipaNumber) patch.sipaNumber = sipaNumber;

    await tx.update(pharmacies).set(patch).where(eq(pharmacies.id, pharmacyId));

    await tx.insert(auditLog).values({
      actorUserId,
      entityType: 'pharmacy',
      entityId: pharmacyId,
      action: 'pharmacy.legal_doc_approved',
      diff: { requestAuditId: auditId, applied: { siaNumber, sipaNumber } } as Record<
        string,
        unknown
      >,
    });
  });
}

export async function rejectLegalDocUpdate(opts: {
  pharmacyId: string;
  auditId: string;
  actorUserId: string;
  reason: string;
}): Promise<void> {
  const { pharmacyId, auditId, actorUserId, reason } = opts;

  await db.insert(auditLog).values({
    actorUserId,
    entityType: 'pharmacy',
    entityId: pharmacyId,
    action: 'pharmacy.legal_doc_rejected',
    diff: { requestAuditId: auditId, reason } as Record<string, unknown>,
  });
}
