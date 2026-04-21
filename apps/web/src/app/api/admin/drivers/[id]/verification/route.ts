import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/guards';
import { approveDriver, suspendDriver, activateDriver } from '@/lib/services/verification';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireRole('admin');
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { action, reason } = body as { action?: string; reason?: string };

  if (action === 'approve') {
    await approveDriver(id);
  } else if (action === 'suspend') {
    if (!reason?.trim()) {
      return NextResponse.json({ error: 'reason required' }, { status: 422 });
    }
    await suspendDriver(id, reason.trim());
  } else if (action === 'activate') {
    await activateDriver(id);
  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 422 });
  }

  return NextResponse.json({ success: true });
}
