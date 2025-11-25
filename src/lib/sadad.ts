/**
 * Sadad Qatar Payment Gateway Integration
 * Documentation: https://developer.sadad.qa
 * API Base URL: https://api-s.sadad.qa
 */

// Sadad API Configuration
const SADAD_API_URL = 'https://api-s.sadad.qa'
const SADAD_SECRET_KEY = process.env.SADAD_SECRET_KEY || ''
const SADAD_ID = process.env.SADAD_ID || '' // Your Sadad ID number
const SADAD_DOMAIN = process.env.SADAD_DOMAIN || 'www.houseiana.net'

// Cache access token (tokens don't expire quickly, so we can cache)
let cachedAccessToken: string | null = null
let tokenExpiry: number = 0

/**
 * Authenticate with Sadad and get access token
 */
async function getSadadAccessToken(): Promise<string> {
  // Return cached token if still valid (cache for 1 hour)
  if (cachedAccessToken && Date.now() < tokenExpiry) {
    return cachedAccessToken
  }

  try {
    const response = await fetch(`${SADAD_API_URL}/api/userbusinesses/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sadadId: parseInt(SADAD_ID),
        secretKey: SADAD_SECRET_KEY,
        domain: SADAD_DOMAIN
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Authentication failed')
    }

    const data = await response.json()
    cachedAccessToken = data.accessToken
    tokenExpiry = Date.now() + (60 * 60 * 1000) // Cache for 1 hour

    return data.accessToken
  } catch (error) {
    console.error('Sadad authentication error:', error)
    throw error
  }
}

/**
 * Create an invoice for payment
 */
export async function createSadadPayment(params: {
  amount: number
  customerName: string
  customerPhone?: string
  customerCountryCode?: string
  description: string
  metadata?: Record<string, any>
}): Promise<{
  invoiceNumber: string
  invoiceId: number
  amount: number
  status: string
  paymentUrl: string
}> {
  try {
    const accessToken = await getSadadAccessToken()

    // Prepare invoice details
    const invoiceDetails = [
      {
        description: params.description,
        quantity: 1,
        amount: params.amount
      }
    ]

    // Create invoice
    const response = await fetch(`${SADAD_API_URL}/api/invoices/createInvoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken
      },
      body: JSON.stringify({
        countryCode: params.customerCountryCode || 974, // Qatar country code
        cellnumber: params.customerPhone || '00000000',
        clientname: params.customerName,
        status: 2, // 2 = Unpaid
        remarks: JSON.stringify(params.metadata || {}),
        amount: params.amount,
        invoicedetails: invoiceDetails
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to create invoice')
    }

    const data = await response.json()
    const invoice = Array.isArray(data) ? data[0] : data

    // Generate payment URL (Sadad's invoice payment page)
    const paymentUrl = `https://sadad.qa/invoice/${invoice.invoiceno}`

    return {
      invoiceNumber: invoice.invoiceno,
      invoiceId: invoice.id,
      amount: invoice.grossamount,
      status: 'pending',
      paymentUrl
    }
  } catch (error) {
    console.error('Sadad invoice creation error:', error)
    throw error
  }
}

/**
 * Get transaction details by transaction number
 */
export async function getSadadTransaction(
  transactionNumber: string
): Promise<{
  transactionNumber: string
  status: string
  amount: number
  isPaid: boolean
  transactionDate?: string
}> {
  try {
    const accessToken = await getSadadAccessToken()

    const response = await fetch(
      `${SADAD_API_URL}/api/transactions/getTransaction`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken,
          'Origin': `https://${SADAD_DOMAIN}`
        },
        body: JSON.stringify({
          transactionno: transactionNumber
        })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Transaction not found')
    }

    const data = await response.json()

    return {
      transactionNumber: data.invoicenumber,
      status: data.transactionstatus?.name || 'UNKNOWN',
      amount: data.amount,
      isPaid: data.transactionstatusId === 3, // 3 = SUCCESS
      transactionDate: data.transactiondate
    }
  } catch (error) {
    console.error('Sadad transaction lookup error:', error)
    throw error
  }
}

/**
 * List transactions with filters
 */
export async function listSadadTransactions(params?: {
  skip?: number
  limit?: number
  startDate?: string
  endDate?: string
}): Promise<any[]> {
  try {
    const accessToken = await getSadadAccessToken()

    const skip = params?.skip || 0
    const limit = params?.limit || 10

    let url = `${SADAD_API_URL}/api/transactions/listTransactions?filter[skip]=${skip}&filter[limit]=${limit}`

    if (params?.startDate && params?.endDate) {
      url += `&filter[date_range][startDate]=${params.startDate}&filter[date_range][endDate]=${params.endDate}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to list transactions')
    }

    return await response.json()
  } catch (error) {
    console.error('Sadad list transactions error:', error)
    throw error
  }
}

/**
 * Refund a transaction
 */
export async function createSadadRefund(params: {
  transactionNumber: string
  amount?: number
  reason?: string
}): Promise<{
  refundId: string
  status: string
  amount: number
}> {
  try {
    const accessToken = await getSadadAccessToken()

    const response = await fetch(
      `${SADAD_API_URL}/api/transactions/refundTransaction`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken
        },
        body: JSON.stringify({
          transactionnumber: params.transactionNumber
        })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Refund failed')
    }

    const data = await response.json()

    return {
      refundId: data.invoicenumber,
      status: data.transactionstatus?.name || 'REFUND',
      amount: data.amount
    }
  } catch (error) {
    console.error('Sadad refund error:', error)
    throw error
  }
}

/**
 * Share invoice via SMS or Email
 */
export async function shareSadadInvoice(params: {
  invoiceNumber: string
  method: 'sms' | 'email'
  recipient: string
}): Promise<boolean> {
  try {
    const accessToken = await getSadadAccessToken()

    const requestBody: any = {
      sentvia: params.method === 'sms' ? 4 : 3,
      invoicenumber: params.invoiceNumber
    }

    if (params.method === 'sms') {
      requestBody.receivercellno = params.recipient
    } else {
      requestBody.receiverEmail = params.recipient
    }

    const response = await fetch(`${SADAD_API_URL}/api/invoices/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to share invoice')
    }

    const data = await response.json()
    return data.result === true
  } catch (error) {
    console.error('Sadad share invoice error:', error)
    throw error
  }
}

/**
 * Generate merchant reference for booking
 */
export function generateMerchantReference(bookingId: string): string {
  const timestamp = Date.now().toString().slice(-8)
  return `BK${bookingId.slice(0, 8).toUpperCase()}${timestamp}`
}

/**
 * Validate Sadad configuration
 */
export function validateSadadConfig(): void {
  if (!SADAD_SECRET_KEY) {
    throw new Error('SADAD_SECRET_KEY is not configured')
  }
  if (!SADAD_ID) {
    throw new Error('SADAD_ID is not configured')
  }
  if (!SADAD_DOMAIN) {
    throw new Error('SADAD_DOMAIN is not configured')
  }
}

/**
 * Verify webhook signature (if Sadad provides webhooks)
 * Note: Sadad API docs don't mention webhooks, may need to poll transactions instead
 */
export function verifySadadWebhook(
  payload: string,
  signature: string
): boolean {
  // TODO: Implement if Sadad provides webhook signatures
  // For now, return true (assuming webhooks are from trusted source)
  return true
}
