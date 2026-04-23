import { eq } from 'drizzle-orm';
import { db } from '../index';
import { pharmacies, drivers, auditLog, users } from '../schema';

export type PharmacySignupData = {
  name: string;
  address: string;
  phone: string;
  province: string;
  city: string;
  picName: string;
  npwp: string;
  siaNumber?: string | null;
  sipaNumber?: string | null;
};

export type DriverSignupData = {
  nik: string;
  province: string;
  vehicleType: 'motorcycle' | 'car' | 'bicycle';
  vehicleModel: string;
  vehicle: string;
  licensePlate: string;
  simClass: 'A' | 'B1' | 'B2' | 'C';
  simNumber: string;
  simExpiresAt: string;
  payoutBank: string;
  payoutAccountNumber: string;
  payoutAccountName: string;
};

/**
 * Transactionally insert a pharmacy row, link it to the user, and write an audit entry.
 * Returns the new pharmacy id.
 */
export async function insertPharmacySignup(
  userId: string,
  data: PharmacySignupData,
): Promise<string> {
  return db.transaction(async (tx) => {
    const [pharmacy] = await tx
      .insert(pharmacies)
      .values({
        name: data.name,
        address: data.address,
        phone: data.phone,
        province: data.province,
        city: data.city,
        picName: data.picName,
        npwp: data.npwp,
        siaNumber: data.siaNumber ?? null,
        sipaNumber: data.sipaNumber ?? null,
        verificationStatus: 'pending',
      })
      .returning({ id: pharmacies.id });

    await tx
      .update(users)
      .set({ pharmacyId: pharmacy.id, updatedAt: new Date() })
      .where(eq(users.id, userId));

    await tx.insert(auditLog).values({
      actorUserId: userId,
      entityType: 'pharmacy',
      entityId: pharmacy.id,
      action: 'signup',
      diff: { verificationStatus: { after: 'pending' } },
    });

    return pharmacy.id;
  });
}

/**
 * Transactionally insert a driver row and write an audit entry.
 * Returns the new driver id.
 */
export async function insertDriverSignup(userId: string, data: DriverSignupData): Promise<string> {
  return db.transaction(async (tx) => {
    const [driver] = await tx
      .insert(drivers)
      .values({
        userId,
        nik: data.nik,
        province: data.province,
        vehicleType: data.vehicleType,
        vehicleModel: data.vehicleModel,
        vehicle: data.vehicle,
        licensePlate: data.licensePlate,
        simClass: data.simClass,
        simNumber: data.simNumber,
        simExpiresAt: data.simExpiresAt,
        payoutBank: data.payoutBank,
        payoutAccountNumber: data.payoutAccountNumber,
        payoutAccountName: data.payoutAccountName,
        verificationStatus: 'pending',
      })
      .returning({ id: drivers.id });

    await tx.insert(auditLog).values({
      actorUserId: userId,
      entityType: 'driver',
      entityId: driver.id,
      action: 'signup',
      diff: { verificationStatus: { after: 'pending' } },
    });

    return driver.id;
  });
}
