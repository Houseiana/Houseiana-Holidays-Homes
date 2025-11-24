import paypal from '@paypal/checkout-server-sdk'

if (!process.env.PAYPAL_CLIENT_ID) {
  throw new Error('PAYPAL_CLIENT_ID is not defined in environment variables')
}

if (!process.env.PAYPAL_CLIENT_SECRET) {
  throw new Error('PAYPAL_CLIENT_SECRET is not defined in environment variables')
}

// PayPal environment configuration
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!
  const mode = process.env.PAYPAL_MODE || 'sandbox'

  if (mode === 'live') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret)
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

// PayPal client
function client() {
  return new paypal.core.PayPalHttpClient(environment())
}

export const paypalClient = client()

export const PAYPAL_CONFIG = {
  currency: 'USD', // PayPal default currency
  mode: process.env.PAYPAL_MODE || 'sandbox',
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
}

/**
 * Create a PayPal order for a booking
 */
export async function createPayPalOrder(
  amount: number,
  currency: string = 'USD',
  metadata: {
    bookingId: string
    propertyId?: string
    guestId?: string
    hostId?: string
  }
) {
  const request = new paypal.orders.OrdersCreateRequest()
  request.prefer('return=representation')
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency.toUpperCase(),
          value: amount.toFixed(2),
        },
        custom_id: metadata.bookingId,
        description: `Houseiana Booking - ${metadata.bookingId}`,
      },
    ],
    application_context: {
      brand_name: 'Houseiana',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: `${process.env.NEXTAUTH_URL}/payment/success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/payment/cancel`,
    },
  })

  try {
    const response = await paypalClient.execute(request)
    return response.result
  } catch (error) {
    console.error('PayPal Create Order Error:', error)
    throw error
  }
}

/**
 * Capture payment for a PayPal order
 */
export async function capturePayPalOrder(orderId: string) {
  const request = new paypal.orders.OrdersCaptureRequest(orderId)
  request.requestBody({})

  try {
    const response = await paypalClient.execute(request)
    return response.result
  } catch (error) {
    console.error('PayPal Capture Order Error:', error)
    throw error
  }
}

/**
 * Get order details
 */
export async function getPayPalOrderDetails(orderId: string) {
  const request = new paypal.orders.OrdersGetRequest(orderId)

  try {
    const response = await paypalClient.execute(request)
    return response.result
  } catch (error) {
    console.error('PayPal Get Order Error:', error)
    throw error
  }
}

/**
 * Refund a PayPal capture
 */
export async function refundPayPalCapture(
  captureId: string,
  amount?: number,
  currency?: string
) {
  const request = new paypal.payments.CapturesRefundRequest(captureId)

  if (amount && currency) {
    request.requestBody({
      amount: {
        value: amount.toFixed(2),
        currency_code: currency.toUpperCase(),
      },
    })
  } else {
    request.requestBody({})
  }

  try {
    const response = await paypalClient.execute(request)
    return response.result
  } catch (error) {
    console.error('PayPal Refund Error:', error)
    throw error
  }
}

/**
 * Verify webhook signature (for production use)
 */
export async function verifyPayPalWebhook(
  headers: Record<string, string>,
  body: any,
  webhookId: string
): Promise<boolean> {
  try {
    const request = new paypal.notifications.WebhookVerifySignatureRequest()
    request.requestBody({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: body,
    })

    const response = await paypalClient.execute(request)
    return response.result.verification_status === 'SUCCESS'
  } catch (error) {
    console.error('PayPal Webhook Verification Error:', error)
    return false
  }
}

export default paypalClient
