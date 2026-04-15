import { redirect } from 'next/navigation';
import { getSession } from './session';
import type { Role } from '@pharmatrack/shared';

/**
 * Require a session with the given role for a Server Component / layout.
 * Redirects to /login if unauthenticated, or to the user's home if the role
 * doesn't match. Returns the typed session on success.
 */
export async function requireRole(role: Role) {
  const session = await getSession();
  if (!session?.user) {
    redirect(`/login`);
  }
  const userRole = session.user.role as Role | undefined;
  if (userRole !== role) {
    // Don't leak which route mismatched — send to /.
    redirect('/');
  }
  return session;
}
