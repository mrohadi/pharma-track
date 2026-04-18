import { pgTable, uuid, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { orders } from './orders';

export const contactChannelEnum = pgEnum('contact_channel', ['whatsapp', 'email', 'sms']);

export const addressRequests = pgTable('address_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  channel: contactChannelEnum('channel').notNull(),
  token: text('token').notNull().unique(),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
  reminderCount: integer('reminder_count').default(0).notNull(),
  lastReminderSentAt: timestamp('last_reminder_sent_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export type AddressRequest = typeof addressRequests.$inferSelect;
export type NewAddressRequest = typeof addressRequests.$inferInsert;
