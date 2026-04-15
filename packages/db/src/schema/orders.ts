import { pgTable, uuid, text, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { pharmacies } from './pharmacies';
import { drivers } from './drivers';
import { batches } from './batches';

export const orderStatusEnum = pgEnum('order_status', [
  'pending_address',
  'address_collected',
  'assigned',
  'picked_up',
  'in_transit',
  'delivered',
  'failed',
  'cancelled',
]);

export const failureReasonEnum = pgEnum('failure_reason', [
  'no_answer',
  'wrong_address',
  'patient_refused',
  'patient_not_home',
  'other',
]);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    pharmacyId: uuid('pharmacy_id')
      .notNull()
      .references(() => pharmacies.id, { onDelete: 'restrict' }),
    patientName: text('patient_name').notNull(),
    patientPhone: text('patient_phone').notNull(),
    medicineText: text('medicine_text').notNull(),
    deliveryAddress: text('delivery_address'),
    addressCollectedAt: timestamp('address_collected_at', { withTimezone: true }),
    status: orderStatusEnum('status').default('pending_address').notNull(),
    batchId: uuid('batch_id').references(() => batches.id, { onDelete: 'set null' }),
    assignedDriverId: uuid('assigned_driver_id').references(() => drivers.id, {
      onDelete: 'set null',
    }),
    pickupOtpHash: text('pickup_otp_hash'),
    deliveryOtpHash: text('delivery_otp_hash'),
    pickedUpAt: timestamp('picked_up_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    failureReason: failureReasonEnum('failure_reason'),
    failureNote: text('failure_note'),
    podPhotoUrl: text('pod_photo_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('orders_status_pharmacy_idx').on(t.status, t.pharmacyId),
    index('orders_driver_status_idx').on(t.assignedDriverId, t.status),
  ],
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
