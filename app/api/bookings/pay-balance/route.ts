import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-server'
import { getUserFromRequest } from '@/lib/auth'

/**
 * POST /api/bookings/pay-balance
 *
 * Handle second payment for split payment (50/50) bookings
 * This allows guests to complete payment for PARTIALLY_PAID bookings
 *
 * Flow:
 * 1. Validate booking exists and belongs to user
 * 2. Check booking is PARTIALLY_PAID
 * 3. Calculate remaining balance
 * 4. Create payment order with gateway (PayPal/Sadad)
 * 5. Return payment URL for redirect
 *
 * Security:
 * - Requires authentication
 * - Validates booking ownership
 * - Prevents duplicate payments
 * - Prevents payment after booking expired/cancelled
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

    const { bookingId, paymentProvider } = await request.json()

    // Validate required fields
    if (!bookingId || !paymentProvider) {
      return NextResponse.json(
        { error: 'bookingId and paymentProvider are required' },
        { status: 400 }
      )
    }

    // Fetch booking with all details
    const booking = await (prisma as any).booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            country: true,
          }
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify booking ownership
    if (booking.guestId !== user.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to pay for this booking' },
        { status: 403 }
      )
    }

    // Validate booking status - only allow PARTIALLY_PAID bookings
    if (booking.paymentStatus !== 'PARTIALLY_PAID') {
      if (booking.paymentStatus === 'PAID') {
        return NextResponse.json(
          { error: 'This booking has already been fully paid' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: `Cannot pay balance for booking with payment status: ${booking.paymentStatus}` },
        { status: 400 }
      )
    }

    // Validate booking is not cancelled or expired
    if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
      return NextResponse.json(
        { error: `Cannot pay for ${booking.status.toLowerCase()} booking` },
        { status: 400 }
      )
    }

    // Calculate remaining balance
    const totalPrice = booking.totalPrice
    const amountPaid = booking.amountPaid || 0
    const remainingBalance = totalPrice - amountPaid

    if (remainingBalance <= 0) {
      return NextResponse.json(
        { error: 'No balance remaining on this booking' },
        { status: 400 }
      )
    }

    // Create payment order based on provider
    let paymentUrl: string | null = null
    let paymentOrderId: string | null = null

    switch (paymentProvider.toLowerCase()) {
      case 'paypal':
        // Create PayPal order for remaining balance
        const paypalOrderId = `${bookingId}_balance_${Date.now()}`
        const paypalResponse = await createPayPalOrder(
          remainingBalance,
          `Balance payment for booking ${bookingId}`,
          paypalOrderId
        )

        if (paypalResponse.success) {
          paymentUrl = paypalResponse.approvalUrl
          paymentOrderId = paypalResponse.orderId
        } else {
          return NextResponse.json(
            { error: paypalResponse.error || 'Failed to create PayPal order' },
            { status: 500 }
          )
        }
        break

      case 'sadad':
        // Create Sadad transaction for remaining balance
        const sadadTxnId = `${bookingId}_balance_${Date.now()}`
        const sadadResponse = await createSadadTransaction(
          remainingBalance,
          `Balance payment for booking ${bookingId}`,
          sadadTxnId
        )

        if (sadadResponse.success) {
          paymentUrl = sadadResponse.paymentUrl
          paymentOrderId = sadadResponse.transactionId
        } else {
          return NextResponse.json(
            { error: sadadResponse.error || 'Failed to create Sadad transaction' },
            { status: 500 }
          )
        }
        break

      default:
        return NextResponse.json(
          { error: `Unsupported payment provider: ${paymentProvider}` },
          { status: 400 }
        )
    }

    if (!paymentUrl || !paymentOrderId) {
      return NextResponse.json(
        { error: 'Failed to create payment order' },
        { status: 500 }
      )
    }

    // Update booking with new payment order ID (for verification later)
    await (prisma as any).booking.update({
      where: { id: bookingId },
      data: {
        paymentIntentId: paymentOrderId, // Store for verification
        updatedAt: new Date(),
      }
    })

    return NextResponse.json({
      success: true,
      paymentUrl,
      paymentOrderId,
      remainingBalance,
      bookingId,
      message: 'Payment order created successfully',
    })

  } catch (error) {
    console.error('Error creating balance payment:', error)
    return NextResponse.json(
      { error: 'Failed to create balance payment' },
      { status: 500 }
    )
  }
}

// ============================================================================
// Payment Gateway Integration Functions
// ============================================================================

interface PayPalOrderResponse {
  success: boolean
  orderId?: string
  approvalUrl?: string
  error?: string
}

/**
 * Create PayPal order for balance payment
 */
async function createPayPalOrder(
  amount: number,
  description: string,
  referenceId: string
): Promise<PayPalOrderResponse> {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
    const baseUrl = process.env.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

    if (!clientId || !clientSecret) {
      return { success: false, error: 'PayPal credentials not configured' }
    }

    // Get access token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!tokenResponse.ok) {
      return { success: false, error: 'Failed to get PayPal access token' }
    }

    const { access_token } = await tokenResponse.json()

    // Create order
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: referenceId,
          description,
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2),
          },
        }],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/return`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
        },
      }),
    })

    if (!orderResponse.ok) {
      return { success: false, error: 'Failed to create PayPal order' }
    }

    const orderData = await orderResponse.json()
    const approvalUrl = orderData.links?.find((link: any) => link.rel === 'approve')?.href

    return {
      success: true,
      orderId: orderData.id,
      approvalUrl,
    }
  } catch (error) {
    console.error('PayPal order creation error:', error)
    return { success: false, error: 'PayPal order creation failed' }
  }
}

interface SadadTransactionResponse {
  success: boolean
  transactionId?: string
  paymentUrl?: string
  error?: string
}

/**
 * Create Sadad Qatar transaction for balance payment
 */
async function createSadadTransaction(
  amount: number,
  description: string,
  referenceId: string
): Promise<SadadTransactionResponse> {
  try {
    const clientId = process.env.SADAD_CLIENT_ID
    const clientSecret = process.env.SADAD_CLIENT_SECRET
    const baseUrl = process.env.SADAD_MODE === 'live'
      ? process.env.SADAD_LIVE_URL
      : process.env.SADAD_SANDBOX_URL

    if (!clientId || !clientSecret || !baseUrl) {
      return { success: false, error: 'Sadad credentials not configured' }
    }

    // Get access token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!tokenResponse.ok) {
      return { success: false, error: 'Failed to get Sadad access token' }
    }

    const { access_token } = await tokenResponse.json()

    // Create transaction
    const txnResponse = await fetch(`${baseUrl}/api/v1/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchantReference: referenceId,
        description,
        amount: amount.toFixed(2),
        currency: 'QAR',
        returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/return`,
        cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
      }),
    })

    if (!txnResponse.ok) {
      return { success: false, error: 'Failed to create Sadad transaction' }
    }

    const txnData = await txnResponse.json()

    return {
      success: true,
      transactionId: txnData.transactionId,
      paymentUrl: txnData.paymentUrl,
    }
  } catch (error) {
    console.error('Sadad transaction creation error:', error)
    return { success: false, error: 'Sadad transaction creation failed' }
  }
}
