import { redirect } from 'next/navigation';
import { getPharmacyById, getDriverByUserId } from '@pharmatrack/db';
import { getSession } from './session';
import type { Role } from '@pharmatrack/shared';

/**
 * Require a session with the given role for a Server Component / layout.
 * Redirects to /login if unauthenticated, or to the user's home if the role
 * doesn't match. Returns the typed session on success.
 *
 * For pharmacy and driver roles, also checks verificationStatus — pending or
 * suspended users are redirected to /pending-verification.
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

  if (role === 'pharmacy') {
    const pharmacyId = (session.user as { pharmacyId?: string }).pharmacyId;
    if (pharmacyId) {
      const pharmacy = await getPharmacyById(pharmacyId);
      if (
        pharmacy?.verificationStatus === 'pending' ||
        pharmacy?.verificationStatus === 'suspended'
      ) {
        redirect('/pending-verification');
      }
    }
  }

  if (role === 'driver') {
    const driver = await getDriverByUserId(session.user.id);
    if (driver?.verificationStatus === 'pending' || driver?.verificationStatus === 'suspended') {
      redirect('/pending-verification');
    }
  }

  return session;
}
