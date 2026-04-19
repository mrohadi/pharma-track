import { eq } from 'drizzle-orm';
import { db } from '../index';
import { pharmacies } from '../schema';
import type { PharmacyVerificationStatus } from '../schema/pharmacies';

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

export async function setPharmacyVerification(
  id: string,
  status: PharmacyVerificationStatus,
): Promise<void> {
  await db
    .update(pharmacies)
    .set({ verificationStatus: status, updatedAt: new Date() })
    .where(eq(pharmacies.id, id));
}
