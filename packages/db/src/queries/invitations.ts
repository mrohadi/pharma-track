import { eq } from 'drizzle-orm';
import { db } from '../index';
import { invitations, auditLog } from '../schema';
import type { InvitationRole } from '../schema/invitations';

const EXPIRY_HOURS = 72; // 3 days

export async function createInvitation(opts: {
  email: string;
  role: InvitationRole;
  invitedByUserId: string;
}): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);

  await db.transaction(async (tx) => {
    await tx.insert(invitations).values({
      token,
      email: opts.email,
      role: opts.role,
      invitedByUserId: opts.invitedByUserId,
      expiresAt,
    });

    await tx.insert(auditLog).values({
      actorUserId: opts.invitedByUserId,
      entityType: 'invitation',
      entityId: token,
      action: 'invitation.created',
      diff: { email: opts.email, role: opts.role } as Record<string, unknown>,
    });
  });

  return { token, expiresAt };
}

export async function getInvitationByToken(token: string) {
  const [row] = await db.select().from(invitations).where(eq(invitations.token, token)).limit(1);
  return row ?? null;
}

export async function markInvitationUsed(token: string): Promise<void> {
  await db.update(invitations).set({ usedAt: new Date() }).where(eq(invitations.token, token));
}

export async function listInvitations() {
  return db.select().from(invitations).orderBy(invitations.createdAt);
}
