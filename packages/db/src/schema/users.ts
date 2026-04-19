import { pgTable, uuid, text, timestamp, pgEnum, boolean, jsonb } from 'drizzle-orm/pg-core';
import { pharmacies } from './pharmacies';

export const roleEnum = pgEnum('user_role', ['admin', 'pharmacy', 'driver']);

/**
 * Users table — serves as better-auth's `user` table.
 * Password is stored in the `accounts` table (better-auth convention).
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  name: text('name'),
  image: text('image'),
  phone: text('phone'),
  role: roleEnum('role').notNull(),
  pharmacyId: uuid('pharmacy_id').references(() => pharmacies.id, { onDelete: 'set null' }),
  preferences: jsonb('preferences').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
