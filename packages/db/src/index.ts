import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://pharmatrack:pharmatrack@localhost:5432/pharmatrack';

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined;
}

// Reuse pool across hot-reloads in dev; create once in prod
const client =
  globalThis.__pgClient ??
  postgres(connectionString, { max: 5, idle_timeout: 20, connect_timeout: 10 });
if (process.env.NODE_ENV !== 'production') globalThis.__pgClient = client;

export const db = drizzle(client, { schema });
export * from './schema';
export { schema };
export * from './queries/orders';
export * from './queries/insert-orders';
export * from './queries/admin-orders';
export * from './queries/drivers';
export * from './queries/assign';
export * from './queries/address-requests';
export * from './queries/batches';
export * from './queries/batchable-orders';
export * from './queries/delivery-otp';
export * from './queries/export-orders';
export * from './queries/export-pharmacy-orders';
export * from './queries/analytics';
export * from './queries/audit-log';
export * from './queries/pharmacy-settings';
export * from './queries/push-subscriptions';
export * from './queries/address-reminders';
export * from './queries/pharmacies';
export * from './queries/users';
export * from './queries/signup';
export * from './queries/verification';
export * from './queries/order-detail';
export * from './queries/legal-doc-reviews';
export * from './queries/auto-assign';
export * from './queries/invitations';
