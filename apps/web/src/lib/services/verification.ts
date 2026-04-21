import { setPharmacyVerificationAudit, setDriverVerificationAudit } from '@pharmatrack/db';
import { getSession } from '@/lib/session';

async function actorId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

export async function approvePharmacy(id: string): Promise<void> {
  const actor = await actorId();
  await setPharmacyVerificationAudit(id, 'active', 'approve', actor, {
    verificationStatus: { before: 'pending', after: 'active' },
  });
}

export async function suspendPharmacy(id: string, reason: string): Promise<void> {
  const actor = await actorId();
  await setPharmacyVerificationAudit(id, 'suspended', 'suspend', actor, { reason });
}

export async function activatePharmacy(id: string): Promise<void> {
  const actor = await actorId();
  await setPharmacyVerificationAudit(id, 'active', 'activate', actor);
}

export async function approveDriver(id: string): Promise<void> {
  const actor = await actorId();
  await setDriverVerificationAudit(id, 'active', 'approve', actor, {
    verificationStatus: { before: 'pending', after: 'active' },
  });
}

export async function suspendDriver(id: string, reason: string): Promise<void> {
  const actor = await actorId();
  await setDriverVerificationAudit(id, 'suspended', 'suspend', actor, { reason });
}

export async function activateDriver(id: string): Promise<void> {
  const actor = await actorId();
  await setDriverVerificationAudit(id, 'active', 'activate', actor);
}
