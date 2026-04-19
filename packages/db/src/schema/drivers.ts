import { pgTable, uuid, text, timestamp, doublePrecision, pgEnum, date } from 'drizzle-orm/pg-core';
import { users } from './users';

export const driverStatusEnum = pgEnum('driver_status', ['offline', 'available', 'on_delivery']);

export const driverVerificationStatusEnum = pgEnum('driver_verification_status', [
  'pending',
  'active',
  'suspended',
  'rejected',
]);

export const driverVehicleTypeEnum = pgEnum('driver_vehicle_type', [
  'motorcycle',
  'car',
  'bicycle',
]);

export const driverSimClassEnum = pgEnum('driver_sim_class', ['A', 'B1', 'B2', 'C']);

export const drivers = pgTable('drivers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  vehicle: text('vehicle'),
  licensePlate: text('license_plate'),
  lastLat: doublePrecision('last_lat'),
  lastLng: doublePrecision('last_lng'),
  lastLocationAt: timestamp('last_location_at', { withTimezone: true }),
  status: driverStatusEnum('status').default('offline').notNull(),
  // KYC fields
  nik: text('nik'),
  province: text('province'),
  vehicleType: driverVehicleTypeEnum('vehicle_type'),
  vehicleModel: text('vehicle_model'),
  simClass: driverSimClassEnum('sim_class'),
  simNumber: text('sim_number'),
  simExpiresAt: date('sim_expires_at'),
  payoutBank: text('payout_bank'),
  payoutAccountNumber: text('payout_account_number'),
  payoutAccountName: text('payout_account_name'),
  verificationStatus: driverVerificationStatusEnum('verification_status')
    .default('pending')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;
export type DriverVerificationStatus = (typeof driverVerificationStatusEnum.enumValues)[number];
export type DriverVehicleType = (typeof driverVehicleTypeEnum.enumValues)[number];
export type DriverSimClass = (typeof driverSimClassEnum.enumValues)[number];
