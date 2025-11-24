import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getVerificationSession } from '@/lib/stripe'

/**
 * GET /api/kyc/check-status?sessionId=xxx
 * Checks the status of a Stripe Identity verification session
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    console.log('Checking verification status for session:', sessionId)

    // Get the verification session from Stripe
    const session = await getVerificationSession(sessionId)

    // Extract verified data if verification was successful
    let verifiedData = null
    if (session.status === 'verified' && session.verified_outputs) {
      verifiedData = {
        firstName: session.verified_outputs.first_name || null,
        lastName: session.verified_outputs.last_name || null,
        dob: session.verified_outputs.dob || null,
        idNumber: session.verified_outputs.id_number || null,
        address: session.verified_outputs.address || null,
      }
    }

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      verifiedData,
      lastError: session.last_error || null,
    })

  } catch (error: any) {
    console.error('Error checking verification status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check verification status' },
      { status: 500 }
    )
  }
}
