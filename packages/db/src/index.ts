import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://pharmatrack:pharmatrack@localhost:5432/pharmatrack';

const client = postgres(connectionString, { max: 10 });

export const db = drizzle(client, { schema });
export * from './schema';
export { schema };
export * from './queries/orders';
export * from './queries/insert-orders';
export * from './queries/admin-orders';
export * from './queries/drivers';
export * from './queries/assign';
export * from './queries/address-requests';
