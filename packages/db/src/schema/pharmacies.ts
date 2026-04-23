import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const pharmacyVerificationStatusEnum = pgEnum('pharmacy_verification_status', [
  'pending',
  'active',
  'suspended',
  'rejected',
]);

export const pharmacies = pgTable('pharmacies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  logoUrl: text('logo_url'),
  settings: jsonb('settings').$type<Record<string, unknown>>().default({}).notNull(),
  // KYC fields
  picName: text('pic_name'),
  npwp: text('npwp'),
  siaNumber: text('sia_number'),
  sipaNumber: text('sipa_number'),
  province: text('province'),
  city: text('city'),
  verificationStatus: pharmacyVerificationStatusEnum('verification_status')
    .default('pending')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Pharmacy = typeof pharmacies.$inferSelect;
export type NewPharmacy = typeof pharmacies.$inferInsert;
export type PharmacyVerificationStatus = (typeof pharmacyVerificationStatusEnum.enumValues)[number];
