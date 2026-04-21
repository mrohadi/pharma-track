import { NextRequest, NextResponse } from 'next/server';
import { OrderWizardSchema } from '@pharmatrack/shared';
import { getSession } from '@/lib/session';
import { createOrderFromWizard } from '@/lib/services/orders';

/**
 * POST /api/orders
 * Creates a new order from the pharmacy manual-entry wizard.
 * Body: OrderWizardInput (validated by OrderWizardSchema)
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'pharmacy') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pharmacyId = (session.user as { pharmacyId?: string }).pharmacyId;
  if (!pharmacyId) {
    return NextResponse.json({ error: 'No pharmacy linked to account' }, { status: 400 });
  }

  const body = await req.json();
  const parsed = OrderWizardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { orderId } = await createOrderFromWizard(pharmacyId, session.user.id, parsed.data);

  return NextResponse.json({ ok: true, orderId }, { status: 201 });
}
