/**
 * Payment Gateway Verification Utilities
 *
 * This module provides secure server-side verification of payment transactions
 * with PayPal and Sadad Qatar payment gateways.
 *
 * SECURITY: Never trust client-side payment confirmations. Always verify with the gateway.
 */

// ============================================================================
// PayPal OAuth2 Access Token
// ============================================================================

interface PayPalAccessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

/**
 * Get PayPal OAuth2 access token for API requests
 * Uses client credentials grant flow
 */
export async function getPayPalAccessToken(): Promise<string | null> {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
    const baseUrl = process.env.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

    if (!clientId || !clientSecret) {
      console.error('PayPal credentials not configured')
      return null
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      console.error('Failed to get PayPal access token:', response.status)
      return null
    }

    const data: PayPalAccessTokenResponse = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting PayPal access token:', error)
    return null
  }
}

// ============================================================================
// PayPal Order Verification
// ============================================================================

interface PayPalOrderDetails {
  id: string
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED'
  purchase_units: Array<{
    amount: {
      currency_code: string
      value: string
    }
    payments?: {
      captures?: Array<{
        id: string
        status: 'COMPLETED' | 'PENDING' | 'DECLINED'
        amount: {
          currency_code: string
          value: string
        }
      }>
    }
  }>
}

export interface PaymentVerificationResult {
  success: boolean
  status: 'COMPLETED' | 'PENDING' | 'FAILED'
  transactionId?: string
  amount?: number
  currency?: string
  error?: string
}

/**
 * Verify PayPal order payment status by querying PayPal API directly
 *
 * @param orderId - PayPal order ID
 * @returns Payment verification result
 */
export async function verifyPayPalOrder(orderId: string): Promise<PaymentVerificationResult> {
  try {
    const accessToken = await getPayPalAccessToken()
    if (!accessToken) {
      return {
        success: false,
        status: 'FAILED',
        error: 'Failed to authenticate with PayPal',
      }
    }

    const baseUrl = process.env.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('PayPal order verification failed:', response.status)
      return {
        success: false,
        status: 'FAILED',
        error: `PayPal API returned status ${response.status}`,
      }
    }

    const orderDetails: PayPalOrderDetails = await response.json()

    // Check if order is completed
    if (orderDetails.status === 'COMPLETED') {
      const capture = orderDetails.purchase_units[0]?.payments?.captures?.[0]

      if (capture && capture.status === 'COMPLETED') {
        return {
          success: true,
          status: 'COMPLETED',
          transactionId: capture.id,
          amount: parseFloat(capture.amount.value),
          currency: capture.amount.currency_code,
        }
      }
    }

    // Order exists but not completed
    if (orderDetails.status === 'APPROVED' || orderDetails.status === 'PAYER_ACTION_REQUIRED') {
      return {
        success: false,
        status: 'PENDING',
        error: 'Payment approved but not yet captured',
      }
    }

    // Order not completed
    return {
      success: false,
      status: 'FAILED',
      error: `PayPal order status: ${orderDetails.status}`,
    }

  } catch (error) {
    console.error('Error verifying PayPal order:', error)
    return {
      success: false,
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// Sadad Qatar Payment Verification
// ============================================================================

interface SadadAccessTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface SadadTransactionDetails {
  transactionId: string
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'CANCELLED'
  amount: number
  currency: string
  merchantReference?: string
}

/**
 * Get Sadad Qatar OAuth2 access token for API requests
 */
export async function getSadadAccessToken(): Promise<string | null> {
  try {
    const clientId = process.env.SADAD_CLIENT_ID
    const clientSecret = process.env.SADAD_CLIENT_SECRET
    const baseUrl = process.env.SADAD_MODE === 'live'
      ? process.env.SADAD_LIVE_URL
      : process.env.SADAD_SANDBOX_URL

    if (!clientId || !clientSecret || !baseUrl) {
      console.error('Sadad credentials not configured')
      return null
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      console.error('Failed to get Sadad access token:', response.status)
      return null
    }

    const data: SadadAccessTokenResponse = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting Sadad access token:', error)
    return null
  }
}

/**
 * Verify Sadad Qatar payment transaction by querying Sadad API directly
 *
 * @param transactionId - Sadad transaction ID
 * @returns Payment verification result
 */
export async function verifySadadTransaction(transactionId: string): Promise<PaymentVerificationResult> {
  try {
    const accessToken = await getSadadAccessToken()
    if (!accessToken) {
      return {
        success: false,
        status: 'FAILED',
        error: 'Failed to authenticate with Sadad',
      }
    }

    const baseUrl = process.env.SADAD_MODE === 'live'
      ? process.env.SADAD_LIVE_URL
      : process.env.SADAD_SANDBOX_URL

    const response = await fetch(`${baseUrl}/api/v1/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Sadad transaction verification failed:', response.status)
      return {
        success: false,
        status: 'FAILED',
        error: `Sadad API returned status ${response.status}`,
      }
    }

    const transactionDetails: SadadTransactionDetails = await response.json()

    // Check if transaction is successful
    if (transactionDetails.status === 'SUCCESS') {
      return {
        success: true,
        status: 'COMPLETED',
        transactionId: transactionDetails.transactionId,
        amount: transactionDetails.amount,
        currency: transactionDetails.currency,
      }
    }

    // Transaction exists but not completed
    if (transactionDetails.status === 'PENDING') {
      return {
        success: false,
        status: 'PENDING',
        error: 'Payment is still pending',
      }
    }

    // Transaction failed or cancelled
    return {
      success: false,
      status: 'FAILED',
      error: `Sadad transaction status: ${transactionDetails.status}`,
    }

  } catch (error) {
    console.error('Error verifying Sadad transaction:', error)
    return {
      success: false,
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// Stripe Payment Verification
// ============================================================================

import { getStripePaymentIntent } from './stripe-config'

/**
 * Verify Stripe payment intent status
 *
 * @param paymentIntentId - Stripe payment intent ID
 * @returns Payment verification result
 */
export async function verifyStripePaymentIntent(paymentIntentId: string): Promise<PaymentVerificationResult> {
  try {
    const paymentIntent = await getStripePaymentIntent(paymentIntentId)

    // Check if payment is successful
    if (paymentIntent.status === 'succeeded') {
      return {
        success: true,
        status: 'COMPLETED',
        transactionId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert cents to dollars
        currency: paymentIntent.currency.toUpperCase(),
      }
    }

    // Payment exists but not completed
    if (paymentIntent.status === 'processing' || paymentIntent.status === 'requires_action') {
      return {
        success: false,
        status: 'PENDING',
        error: 'Payment is being processed',
      }
    }

    // Payment failed or cancelled
    return {
      success: false,
      status: 'FAILED',
      error: `Stripe payment status: ${paymentIntent.status}`,
    }

  } catch (error) {
    console.error('Error verifying Stripe payment:', error)
    return {
      success: false,
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// Unified Payment Gateway Verification
// ============================================================================

export type PaymentProvider = 'paypal' | 'sadad' | 'stripe' | 'apple_pay' | 'google_pay'

/**
 * Check payment status directly with the payment gateway
 *
 * This is the SINGLE SOURCE OF TRUTH for payment verification.
 * NEVER trust client-side payment confirmations.
 *
 * @param paymentOrderId - Payment gateway order/transaction ID
 * @param provider - Payment gateway provider
 * @returns Payment verification result
 */
export async function checkPaymentGatewayStatus(
  paymentOrderId: string,
  provider: PaymentProvider
): Promise<PaymentVerificationResult> {
  switch (provider) {
    case 'paypal':
      return verifyPayPalOrder(paymentOrderId)

    case 'sadad':
      return verifySadadTransaction(paymentOrderId)

    case 'stripe':
      return verifyStripePaymentIntent(paymentOrderId)

    case 'apple_pay':
    case 'google_pay':
      // Apple Pay and Google Pay typically use Stripe as backend
      // Use Stripe verification for these
      return verifyStripePaymentIntent(paymentOrderId)

    default:
      return {
        success: false,
        status: 'FAILED',
        error: `Unknown payment provider: ${provider}`,
      }
  }
}
