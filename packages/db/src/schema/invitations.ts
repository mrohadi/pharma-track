import { pgTable, uuid, text, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const invitationRoleEnum = pgEnum('invitation_role', ['pharmacy', 'driver']);

export const invitations = pgTable('invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  token: text('token').notNull().unique(),
  email: text('email').notNull(),
  role: invitationRoleEnum('role').notNull(),
  invitedByUserId: uuid('invited_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  usedAt: timestamp('used_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type InvitationRole = (typeof invitationRoleEnum.enumValues)[number];
