import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { pharmacies } from './pharmacies';

export const roleEnum = pgEnum('user_role', ['admin', 'pharmacy', 'driver']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  name: text('name'),
  role: roleEnum('role').notNull(),
  pharmacyId: uuid('pharmacy_id').references(() => pharmacies.id, { onDelete: 'set null' }),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
