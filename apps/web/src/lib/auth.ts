import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, users, sessions, accounts, verifications } from '@pharmatrack/db';

// Secret is validated at runtime by better-auth; keep import-time side-effects
// minimal so `next build` can collect page data without env.
export const auth = betterAuth({
  secret: process.env.AUTH_SECRET ?? 'dev-only-placeholder-replace-me',
  baseURL: process.env.AUTH_URL ?? 'http://localhost:3000',

  database: drizzleAdapter(db, {
    provider: 'pg',
    // With usePlural, better-auth maps its singular model names (user, session,
    // account, verification) to our plural table objects automatically.
    schema: { users, sessions, accounts, verifications },
    usePlural: true,
  }),

  advanced: {
    database: {
      // Our columns are uuid; override better-auth's default nanoid generator.
      generateId: () => crypto.randomUUID(),
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // PoC: skip verification flow
    minPasswordLength: 8,
  },

  // Map extra columns on our users table so better-auth surfaces them on the session.
  // NOTE: public email/password sign-up is still open — Phase 1 TODO is to gate it
  // behind an invite token or admin-only endpoint. Until then, role is accepted as
  // input (so seed works) which is not a production-safe default.
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        input: true,
      },
      pharmacyId: {
        type: 'string',
        required: false,
        input: true,
      },
      phone: {
        type: 'string',
        required: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh every 24h
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min cache; middleware reads cookie without DB hit
    },
  },
});

export type Session = typeof auth.$Infer.Session;
