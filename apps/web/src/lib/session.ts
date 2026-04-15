import { headers } from 'next/headers';
import { auth } from './auth';
import type { Role } from '@pharmatrack/shared';

/**
 * Server-side helper to read the current session in a Server Component or
 * Server Action. Returns null if unauthenticated.
 */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Role-aware post-login redirect target.
 */
export function homeForRole(role: Role | undefined): string {
  switch (role) {
    case 'admin':
      return '/a';
    case 'pharmacy':
      return '/p';
    case 'driver':
      return '/d';
    default:
      return '/';
  }
}
