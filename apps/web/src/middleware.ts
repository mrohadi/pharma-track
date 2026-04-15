import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

/**
 * Lightweight edge middleware: redirects unauthenticated requests to /login.
 * Role-scoped access control (pharmacy vs admin vs driver) happens in the
 * per-segment layouts, where the full session is available via `getSession()`.
 *
 * Why not check role here? `getSessionCookie` only confirms a session exists;
 * it doesn't decode role without a DB round-trip, which we don't want on the
 * edge for every navigation.
 */
const PROTECTED_PREFIXES = ['/p', '/a', '/d'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!needsAuth) return NextResponse.next();

  const session = getSessionCookie(request);
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/p/:path*', '/a/:path*', '/d/:path*'],
};
