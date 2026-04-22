import { NextRequest, NextResponse } from 'next/server';
import { UserPreferences } from '@pharmatrack/shared';
import { updateUserPreferences } from '@pharmatrack/db';
import { getSession } from '@/lib/session';

/**
 * PATCH /api/pharmacy/preferences
 *
 * Updates user-level preferences (locale, pushNotifications) for the
 * authenticated pharmacy user.
 */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'pharmacy') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = UserPreferences.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const updated = await updateUserPreferences(session.user.id, parsed.data);
  return NextResponse.json({ ok: true, preferences: updated });
}
