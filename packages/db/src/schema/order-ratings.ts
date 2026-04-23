import { pgTable, uuid, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { orders } from './orders';

export const orderRatings = pgTable('order_ratings', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(), // 1–5
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type OrderRating = typeof orderRatings.$inferSelect;
export type NewOrderRating = typeof orderRatings.$inferInsert;
