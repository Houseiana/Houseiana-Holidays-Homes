import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Allow access to public pages without authentication
    const publicPaths = ['/', '/discover', '/property', '/test-otp', '/signup', '/become-host'];
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    if (isPublicPath) {
      return NextResponse.next();
    }

    // Protected routes that require authentication
    const protectedPaths = ['/dashboard', '/host-dashboard', '/client-dashboard'];
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    // Redirect to homepage if no token (where auth modals are available)
    if (!token) {
      const url = new URL('/', req.url);
      url.searchParams.set('auth', 'signin');
      url.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(url);
    }

    // Admin-only routes (if you have admin)
    if (pathname.startsWith('/admin')) {
      if (token.role !== 'admin') {
        const url = new URL('/unauthorized', req.url);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public pages
        const publicPaths = ['/', '/discover', '/property', '/test-otp', '/signup', '/become-host'];
        const isPublicPath = publicPaths.some(path =>
          req.nextUrl.pathname.startsWith(path)
        );

        if (isPublicPath) {
          return true;
        }

        // Require authentication for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};