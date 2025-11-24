import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { createVerificationSession } from '@/lib/stripe'

/**
 * POST /api/kyc/create-session
 * Creates a Stripe Identity verification session for KYC
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get the return URL from request body or use default
    const body = await request.json()
    const returnUrl = body.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client-dashboard?kyc=complete`

    console.log('Creating verification session for user:', user.userId)

    // Create Stripe Identity verification session
    const verificationSession = await createVerificationSession(
      user.userId,
      user.email,
      returnUrl
    )

    console.log('Verification session created:', verificationSession.id)

    // Return the client_secret and url for the frontend
    return NextResponse.json({
      sessionId: verificationSession.id,
      clientSecret: verificationSession.client_secret,
      url: verificationSession.url,
      status: verificationSession.status
    })

  } catch (error: any) {
    console.error('Error creating verification session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create verification session' },
      { status: 500 }
    )
  }
}
