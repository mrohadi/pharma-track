import { pgTable, uuid, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { orders } from './orders';

export const otpTypeEnum = pgEnum('otp_type', ['pickup', 'delivery']);

export const otpAttempts = pgTable('otp_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  type: otpTypeEnum('type').notNull(),
  attemptCount: integer('attempt_count').default(0).notNull(),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type OtpAttempt = typeof otpAttempts.$inferSelect;
export type NewOtpAttempt = typeof otpAttempts.$inferInsert;
