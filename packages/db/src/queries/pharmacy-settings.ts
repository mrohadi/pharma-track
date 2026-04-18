import { eq } from 'drizzle-orm';
import { PharmacySettings } from '@pharmatrack/shared';
import { db } from '../index';
import { pharmacies, auditLog } from '../schema';

export async function getPharmacySettings(pharmacyId: string): Promise<PharmacySettings> {
  const [row] = await db
    .select({ settings: pharmacies.settings })
    .from(pharmacies)
    .where(eq(pharmacies.id, pharmacyId))
    .limit(1);

  if (!row) throw new Error(`Pharmacy ${pharmacyId} not found`);

  return PharmacySettings.parse(row.settings ?? {});
}

export async function updatePharmacySettings(
  pharmacyId: string,
  actorUserId: string,
  next: PharmacySettings,
): Promise<void> {
  const prev = await getPharmacySettings(pharmacyId);

  await db.transaction(async (tx) => {
    await tx
      .update(pharmacies)
      .set({ settings: next, updatedAt: new Date() })
      .where(eq(pharmacies.id, pharmacyId));

    await tx.insert(auditLog).values({
      actorUserId,
      entityType: 'pharmacy',
      entityId: pharmacyId,
      action: 'update_settings',
      diff: { before: prev, after: next },
    });
  });
}
