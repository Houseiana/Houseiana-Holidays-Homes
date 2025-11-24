import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

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

export default clerkMiddleware(async (auth, request) => {
  // Protect all private routes by redirecting to sign-in
  if (!isPublicRoute(request)) {
    const authObj = await auth()

    if (!authObj.userId) {
      // User is not authenticated, redirect to sign-in
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}