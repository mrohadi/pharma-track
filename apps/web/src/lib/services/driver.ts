'use server';

import { revalidatePath } from 'next/cache';
import { setDriverOnline, getTodayEarnings, listCompletedOrders } from '@pharmatrack/db';
import { getSession } from '@/lib/session';
import { getDriverByUserId } from '@pharmatrack/db';

export async function toggleDriverOnline(online: boolean) {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'driver') return { ok: false as const };
  await setDriverOnline(session.user.id, online);
  revalidatePath('/driver');
  return { ok: true as const };
}

export async function getDriverStats(driverId: string) {
  const earnings = await getTodayEarnings(driverId);
  return { todayEarningsCents: earnings };
}

export async function getDriverHistory(driverId: string, limit = 50) {
  return listCompletedOrders(driverId, limit);
}

export async function getDriverProfile(userId: string) {
  return getDriverByUserId(userId);
}
