import { pgTable, uuid, text, timestamp, doublePrecision, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const driverStatusEnum = pgEnum('driver_status', ['offline', 'available', 'on_delivery']);

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
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;
