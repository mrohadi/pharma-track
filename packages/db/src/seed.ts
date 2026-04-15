/**
 * Development seed — creates one pharmacy, one admin, one pharmacy user,
 * one driver. Idempotent (uses ON CONFLICT DO NOTHING on email).
 *
 * Passwords are hashed through better-auth's sign-up endpoint so the local
 * accounts row is written correctly. We call the API over HTTP so the seed
 * script doesn't need to import the Next.js auth config directly.
 *
 * Usage (from repo root, with app running on :3000):
 *   pnpm --filter @pharmatrack/db seed
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { pharmacies, users, drivers } from './schema';

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://pharmatrack:pharmatrack@localhost:5432/pharmatrack';
const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';

type SeedUser = {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'pharmacy' | 'driver';
};

const SEED_USERS: SeedUser[] = [
  { email: 'admin@pharmatrack.local', password: 'admin12345', name: 'Admin User', role: 'admin' },
  {
    email: 'pharmacy@pharmatrack.local',
    password: 'pharmacy12345',
    name: 'Pharmacy Staff',
    role: 'pharmacy',
  },
  {
    email: 'driver@pharmatrack.local',
    password: 'driver12345',
    name: 'Driver One',
    role: 'driver',
  },
];

async function signUp(u: SeedUser) {
  const res = await fetch(`${APP_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // better-auth rejects cross-origin requests without an Origin header
      Origin: APP_URL,
    },
    body: JSON.stringify({ email: u.email, password: u.password, name: u.name, role: u.role }),
  });
  if (res.ok) return { created: true };
  const body = (await res.json().catch(() => ({}))) as { message?: string; code?: string };
  if (body.code === 'USER_ALREADY_EXISTS' || body.message?.toLowerCase().includes('already')) {
    return { created: false };
  }
  throw new Error(`sign-up failed for ${u.email}: ${res.status} ${JSON.stringify(body)}`);
}

async function main() {
  const client = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(client, { schema: { pharmacies, users, drivers } });

  console.log('→ Creating seed pharmacy…');
  const [pharmacy] = await db
    .insert(pharmacies)
    .values({ name: 'Demo Pharmacy', phone: '+6281234567890', address: 'Jakarta, Indonesia' })
    .onConflictDoNothing()
    .returning();

  const pharmacyRow = pharmacy ?? (await db.select().from(pharmacies).limit(1)).at(0);
  if (!pharmacyRow) throw new Error('no pharmacy row');

  console.log(`→ Signing up seed users via ${APP_URL}/api/auth/sign-up/email…`);
  for (const u of SEED_USERS) {
    const { created } = await signUp(u);
    console.log(`  ${u.email} — ${created ? 'created' : 'exists'}`);
  }

  // better-auth creates users with no role (additionalField default) — patch them now.
  console.log('→ Patching roles & pharmacy assignment…');
  for (const u of SEED_USERS) {
    await db
      .update(users)
      .set({
        role: u.role,
        pharmacyId: u.role === 'pharmacy' ? pharmacyRow.id : null,
      })
      .where(eq(users.email, u.email));
  }

  // Link the driver user → drivers row
  const driverUser = (
    await db.select().from(users).where(eq(users.email, 'driver@pharmatrack.local'))
  ).at(0);
  if (driverUser) {
    await db
      .insert(drivers)
      .values({ userId: driverUser.id, vehicle: 'Honda Beat', licensePlate: 'B 1234 ABC' })
      .onConflictDoNothing();
  }

  await client.end();
  console.log('\n✅ Seed complete.\n');
  console.log('   admin@pharmatrack.local    / admin12345');
  console.log('   pharmacy@pharmatrack.local / pharmacy12345');
  console.log('   driver@pharmatrack.local   / driver12345');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
