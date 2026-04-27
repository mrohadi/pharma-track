import { asc, desc, eq, and, gte, sum } from 'drizzle-orm';
import { db } from '../index';
import { drivers, users, orders, pharmacies } from '../schema';
import type { OrderStatus } from '@pharmatrack/shared';
import type {
  DriverVerificationStatus,
  DriverVehicleType,
  DriverSimClass,
} from '../schema/drivers';

export type UpdateDriverProfileInput = {
  vehicleType?: DriverVehicleType;
  vehicleModel?: string;
  vehicle?: string;
  licensePlate?: string;
  simClass?: DriverSimClass;
  simNumber?: string;
  simExpiresAt?: string;
  payoutBank?: string;
  payoutAccountNumber?: string;
  payoutAccountName?: string;
};

export async function updateDriverProfile(
  userId: string,
  input: UpdateDriverProfileInput,
): Promise<void> {
  await db
    .update(drivers)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(drivers.userId, userId));
}

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

export async function listAllDrivers(): Promise<DriverRow[]> {
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

/** Set driver online/offline status. */
export async function setDriverOnline(userId: string, online: boolean): Promise<void> {
  await db
    .update(drivers)
    .set({ status: online ? 'available' : 'offline', updatedAt: new Date() })
    .where(eq(drivers.userId, userId));
}

/** Sum driver_fee_cents for orders delivered today. */
export async function getTodayEarnings(driverId: string): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [row] = await db
    .select({ total: sum(orders.driverFeeCents) })
    .from(orders)
    .where(
      and(
        eq(orders.assignedDriverId, driverId),
        eq(orders.status, 'delivered'),
        gte(orders.deliveredAt, todayStart),
      ),
    );
  return Number(row?.total ?? 0);
}

export type CompletedOrderRow = {
  id: string;
  patientName: string;
  deliveryAddress: string | null;
  medicineText: string;
  driverFeeCents: number | null;
  deliveredAt: Date | null;
};

/** Completed deliveries for a driver, newest first. */
export async function listCompletedOrders(
  driverId: string,
  limit = 50,
): Promise<CompletedOrderRow[]> {
  const rows = await db
    .select({
      id: orders.id,
      patientName: orders.patientName,
      deliveryAddress: orders.deliveryAddress,
      medicineText: orders.medicineText,
      driverFeeCents: orders.driverFeeCents,
      deliveredAt: orders.deliveredAt,
    })
    .from(orders)
    .where(and(eq(orders.assignedDriverId, driverId), eq(orders.status, 'delivered')))
    .orderBy(desc(orders.deliveredAt))
    .limit(limit);
  return rows;
}

/** Update driver GPS location. */
export async function updateDriverLocation(
  driverId: string,
  lat: number,
  lng: number,
): Promise<void> {
  await db
    .update(drivers)
    .set({ lastLat: lat, lastLng: lng, lastLocationAt: new Date(), updatedAt: new Date() })
    .where(eq(drivers.id, driverId));
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
