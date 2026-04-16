'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { assignOrderToDriver } from '@pharmatrack/db';
import { getSession } from '@/lib/session';

const UUID_RE = /^[0-9a-f-]{36}$/i;

/**
 * Admin-only server action. Called from a plain <form action={...}> in
 * AssignCell — no client JS needed. On success we revalidate and redirect
 * back to /a (preserving the user's current filters). On failure we redirect
 * with an error searchParam the page can surface later if needed.
 */
export async function assignOrderAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  const orderId = String(formData.get('orderId') ?? '');
  const driverId = String(formData.get('driverId') ?? '');

  if (!UUID_RE.test(orderId) || !UUID_RE.test(driverId)) {
    redirect('/a?error=invalid_ids');
  }

  const result = await assignOrderToDriver({
    orderId,
    driverId,
    actorUserId: session.user.id,
  });

  if (!result.ok) {
    redirect(`/a?error=${result.reason}`);
  }

  revalidatePath('/a');
  revalidatePath('/d');
  redirect('/a');
}
