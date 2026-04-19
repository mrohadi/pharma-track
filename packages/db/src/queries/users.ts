import { eq } from 'drizzle-orm';
import { db } from '../index';
import { users } from '../schema';
import { UserPreferences } from '@pharmatrack/shared';

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const [row] = await db
    .select({ preferences: users.preferences })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return UserPreferences.parse(row?.preferences ?? {});
}

export async function updateUserPreferences(
  userId: string,
  patch: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const current = await getUserPreferences(userId);
  const merged = UserPreferences.parse({ ...current, ...patch });

  await db
    .update(users)
    .set({ preferences: merged, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return merged;
}
