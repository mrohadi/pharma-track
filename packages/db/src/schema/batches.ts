import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { pharmacies } from './pharmacies';
import { drivers } from './drivers';

export const batchStatusEnum = pgEnum('batch_status', [
  'draft',
  'assigned',
  'picked_up',
  'completed',
  'cancelled',
]);

export const batches = pgTable('batches', {
  id: uuid('id').defaultRandom().primaryKey(),
  pharmacyId: uuid('pharmacy_id')
    .notNull()
    .references(() => pharmacies.id, { onDelete: 'restrict' }),
  driverId: uuid('driver_id').references(() => drivers.id, { onDelete: 'set null' }),
  status: batchStatusEnum('status').default('draft').notNull(),
  pickupPinHash: text('pickup_pin_hash'),
  pickupConfirmedAt: timestamp('pickup_confirmed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Batch = typeof batches.$inferSelect;
export type NewBatch = typeof batches.$inferInsert;
