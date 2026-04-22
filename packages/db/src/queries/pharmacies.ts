import { eq } from 'drizzle-orm';
import { db } from '../index';
import { pharmacies, auditLog } from '../schema';
import type { PharmacyVerificationStatus } from '../schema/pharmacies';

export type PharmacyProfilePatch = {
  name?: string;
  picName?: string;
  phone?: string;
  npwp?: string;
  province?: string;
  city?: string;
  address?: string;
};

export type LegalDocPatch = {
  siaNumber?: string;
  sipaNumber?: string;
};

export async function getPharmacyById(id: string) {
  const [row] = await db.select().from(pharmacies).where(eq(pharmacies.id, id)).limit(1);
  return row ?? null;
}

export async function listPendingPharmacies() {
  return db
    .select()
    .from(pharmacies)
    .where(eq(pharmacies.verificationStatus, 'pending'))
    .orderBy(pharmacies.createdAt);
}

export async function listAllPharmacies() {
  return db.select().from(pharmacies).orderBy(pharmacies.createdAt);
}

export async function setPharmacyVerification(
  id: string,
  status: PharmacyVerificationStatus,
): Promise<void> {
  await db
    .update(pharmacies)
    .set({ verificationStatus: status, updatedAt: new Date() })
    .where(eq(pharmacies.id, id));
}

/**
 * Update mutable profile fields (name, PIC, phone, NPWP, address).
 * Does NOT touch SIA/SIPA — use requestLegalDocUpdate for that.
 */
export async function updatePharmacyProfile(
  id: string,
  actorUserId: string,
  patch: PharmacyProfilePatch,
): Promise<void> {
  const prev = await getPharmacyById(id);
  if (!prev) throw new Error(`Pharmacy ${id} not found`);

  await db.transaction(async (tx) => {
    await tx
      .update(pharmacies)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(pharmacies.id, id));

    await tx.insert(auditLog).values({
      actorUserId,
      entityType: 'pharmacy',
      entityId: id,
      action: 'pharmacy.profile_updated',
      diff: { before: patch, after: patch } as Record<string, unknown>,
    });
  });
}

/**
 * Request SIA/SIPA update. Writes an audit entry with status
 * `awaiting_admin_review` without mutating the live fields.
 * Admin must approve (branch 8) to apply to pharmacies table.
 */
export async function requestLegalDocUpdate(
  id: string,
  actorUserId: string,
  patch: LegalDocPatch,
): Promise<void> {
  await db.insert(auditLog).values({
    actorUserId,
    entityType: 'pharmacy',
    entityId: id,
    action: 'pharmacy.legal_doc_update_requested',
    diff: {
      status: 'awaiting_admin_review',
      requested: patch,
    } as Record<string, unknown>,
  });
}
