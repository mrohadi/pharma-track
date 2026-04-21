import { eq } from 'drizzle-orm';
import { db } from '../index';
import { pharmacies, drivers, auditLog } from '../schema';
import type { PharmacyVerificationStatus } from '../schema/pharmacies';
import type { DriverVerificationStatus } from '../schema/drivers';

export async function setPharmacyVerificationAudit(
  id: string,
  status: PharmacyVerificationStatus,
  action: string,
  actorUserId: string | null,
  extra?: Record<string, unknown>,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(pharmacies)
      .set({ verificationStatus: status, updatedAt: new Date() })
      .where(eq(pharmacies.id, id));
    await tx.insert(auditLog).values({
      actorUserId,
      entityType: 'pharmacy',
      entityId: id,
      action,
      diff: { verificationStatus: { after: status }, ...extra },
    });
  });
}

export async function setDriverVerificationAudit(
  id: string,
  status: DriverVerificationStatus,
  action: string,
  actorUserId: string | null,
  extra?: Record<string, unknown>,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(drivers)
      .set({ verificationStatus: status, updatedAt: new Date() })
      .where(eq(drivers.id, id));
    await tx.insert(auditLog).values({
      actorUserId,
      entityType: 'driver',
      entityId: id,
      action,
      diff: { verificationStatus: { after: status }, ...extra },
    });
  });
}
