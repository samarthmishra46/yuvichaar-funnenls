import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth API routes and static assets to pass through
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  /* ──────────────────────────────────────────
     Superadmin routes — require superadmin role
     ────────────────────────────────────────── */
  if (pathname.startsWith('/superadmin')) {
    // Allow superadmin login page to be accessed without auth
    if (pathname === '/superadmin/login') {
      if (token?.role === 'superadmin') {
        return NextResponse.redirect(new URL('/superadmin/finances', request.url));
      }
      return NextResponse.next();
    }

    if (!token) {
      const loginUrl = new URL('/superadmin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/superadmin/login', request.url));
    }

    return NextResponse.next();
  }

  /* ──────────────────────────────────────────
     Admin routes — admin OR superadmin role
     ────────────────────────────────────────── */
  if (pathname.startsWith('/admin')) {
    // Allow admin login page to be accessed without auth
    if (pathname === '/admin/login') {
      // If already logged in as admin/superadmin, redirect to dashboard
      if (token?.role === 'admin' || token?.role === 'superadmin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Not authenticated → redirect to admin login
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated but not admin/superadmin → redirect to admin login
    if (token.role !== 'admin' && token.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  /* ──────────────────────────────────────────
     Client routes — require client role
     ────────────────────────────────────────── */
  if (pathname.startsWith('/client')) {
    // Not authenticated → redirect to client login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated but not client → redirect to client login
    if (token.role !== 'client') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  /* ──────────────────────────────────────────
     Client login page — redirect if already logged in
     ────────────────────────────────────────── */
  if (pathname === '/login') {
    if (token?.role === 'client') {
      return NextResponse.redirect(new URL('/client', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/superadmin/:path*',
    '/client/:path*',
    '/login',
  ],
};
