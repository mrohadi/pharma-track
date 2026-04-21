import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getDashboardStats } from '@pharmatrack/db';

/**
 * GET /api/analytics/dashboard
 *
 * Admin-only. Returns today's KPIs, 7-day order chart, status breakdown.
 */
export async function GET() {
  const session = await getSession();
  if (!session?.user || (session.user.role as string) !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const data = await getDashboardStats();
  return NextResponse.json(data);
}
