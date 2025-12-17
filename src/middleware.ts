import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Session Configuration:
// - Session timeout: 30 minutes of inactivity
// - Configured in Clerk Dashboard > Sessions > Session lifetime
// - Set "Inactivity timeout" to 30 minutes (1800 seconds)
// - Sessions automatically expire after 30 minutes of user inactivity

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/register(.*)',
  '/login(.*)',
  '/discover(.*)',
  '/property(.*)',
  '/properties(.*)',
  '/become-host',
  '/api/webhooks(.*)',
  '/api/properties(.*)',
])

export default clerkMiddleware(
  async (auth, request) => {
    // Protect all private routes by redirecting to sign-in
    if (!isPublicRoute(request)) {
      const authObj = await auth()

      if (!authObj.userId) {
        // For API routes, return JSON error instead of redirect
        if (request.nextUrl.pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }

        // For page routes, redirect to sign-in
        const signInUrl = new URL('/sign-in', request.url)
        signInUrl.searchParams.set('redirect_url', request.url)
        return NextResponse.redirect(signInUrl)
      }
    }
  },
  {
    // Enable debug mode for session tracking (optional)
    debug: false,
  }
)

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}