import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/discover(.*)',
  '/property(.*)',
  '/properties(.*)',
  '/become-host',
  '/api/webhooks(.*)',
  '/api/properties(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // Don't use auth.protect() - let route handlers check auth themselves
  // This avoids Clerk's protect-rewrite behavior that causes 404s
  if (!isPublicRoute(request)) {
    // Just populate auth context, don't protect
    await auth()
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