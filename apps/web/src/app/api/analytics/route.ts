import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getAdminAnalytics, type AnalyticsFilters } from '@pharmatrack/db';

/**
 * GET /api/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Admin-only. Returns order analytics: total, status breakdown, per-pharmacy stats.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user || (session.user.role as string) !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sp = req.nextUrl.searchParams;
  const filters: AnalyticsFilters = {};

  const from = sp.get('from');
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) filters.from = from;

  const to = sp.get('to');
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) filters.to = to;

  const data = await getAdminAnalytics(filters);
  return NextResponse.json(data);
}
