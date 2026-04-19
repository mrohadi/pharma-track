import { asc, desc, eq } from 'drizzle-orm';
import { db } from '../index';
import { drivers, users, orders, pharmacies } from '../schema';
import type { OrderStatus } from '@pharmatrack/shared';
import type { DriverVerificationStatus } from '../schema/drivers';

export type DriverRow = {
  id: string;
  name: string | null;
  email: string;
  vehicle: string | null;
  licensePlate: string | null;
  status: 'offline' | 'available' | 'on_delivery';
  verificationStatus: DriverVerificationStatus;
};

/** List drivers joined with their user record — name + email for display. */
export async function listDrivers(): Promise<DriverRow[]> {
  const rows = await db
    .select({
      id: drivers.id,
      name: users.name,
      email: users.email,
      vehicle: drivers.vehicle,
      licensePlate: drivers.licensePlate,
      status: drivers.status,
      verificationStatus: drivers.verificationStatus,
    })
    .from(drivers)
    .innerJoin(users, eq(drivers.userId, users.id))
    .orderBy(asc(users.name));
  return rows;
}

export async function setDriverVerification(
  id: string,
  status: DriverVerificationStatus,
): Promise<void> {
  await db
    .update(drivers)
    .set({ verificationStatus: status, updatedAt: new Date() })
    .where(eq(drivers.id, id));
}

/** Look up the driver row for a given user id (driver's own user account). */
export async function getDriverByUserId(userId: string) {
  const row = (await db.select().from(drivers).where(eq(drivers.userId, userId)).limit(1)).at(0);
  return row ?? null;
}

export type AssignedOrderRow = {
  id: string;
  patientName: string;
  patientPhone: string;
  medicineText: string;
  deliveryAddress: string | null;
  status: OrderStatus;
  pharmacyId: string;
  podPhotoRequired: boolean;
  createdAt: Date;
};

/**
 * Orders the driver should see on their dashboard — anything assigned to
 * them that isn't already terminal (delivered / failed / cancelled).
 */
export async function listDriverQueue(driverId: string): Promise<AssignedOrderRow[]> {
  const rows = await db
    .select({
      id: orders.id,
      patientName: orders.patientName,
      patientPhone: orders.patientPhone,
      medicineText: orders.medicineText,
      deliveryAddress: orders.deliveryAddress,
      status: orders.status,
      pharmacyId: orders.pharmacyId,
      pharmacySettings: pharmacies.settings,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(pharmacies, eq(orders.pharmacyId, pharmacies.id))
    .where(eq(orders.assignedDriverId, driverId))
    .orderBy(desc(orders.createdAt));
  return rows
    .filter((r) => !(r.status === 'delivered' || r.status === 'failed' || r.status === 'cancelled'))
    .map((r) => ({
      id: r.id,
      patientName: r.patientName,
      patientPhone: r.patientPhone,
      medicineText: r.medicineText,
      deliveryAddress: r.deliveryAddress,
      status: r.status as OrderStatus,
      pharmacyId: r.pharmacyId,
      podPhotoRequired:
        (r.pharmacySettings as Record<string, unknown> | null)?.podPhotoRequired === true,
      createdAt: r.createdAt,
    }));
}
