import crypto from 'crypto';

const SADAD_API_URL = 'https://api-s.sadad.qa';

// Cache for access token
let accessTokenCache: { token: string; expiresAt: number } | null = null;

interface SadadLoginResponse {
  accessToken: string;
}

interface CreatePaymentParams {
  amount: number;
  currency: string;
  merchantReference: string;
  customerEmail: string;
  customerName: string;
  description: string;
  metadata?: Record<string, any>;
}

interface CreatePaymentResponse {
  transactionId: string;
  paymentUrl: string;
  status: string;
  merchantReference: string;
}

interface RefundParams {
  transactionId: string;
  amount: number;
  reason: string;
}

interface RefundResponse {
  refundId: string;
  status: string;
  amount: number;
}

interface TransactionStatusResponse {
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  paidAt?: string;
}

/**
 * Get Sadad access token (with 1-hour caching)
 */
async function getSadadAccessToken(): Promise<string> {
  // Check cache
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now()) {
    return accessTokenCache.token;
  }

  const sadadId = process.env.SADAD_ID;
  const secretKey = process.env.SADAD_SECRET_KEY;
  const domain = process.env.SADAD_DOMAIN;

  if (!sadadId || !secretKey || !domain) {
    throw new Error('Missing Sadad credentials in environment variables');
  }

  try {
    const response = await fetch(`${SADAD_API_URL}/api/userbusinesses/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sadadId: parseInt(sadadId),
        secretKey,
        domain,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sadad login failed: ${error}`);
    }

    const data: SadadLoginResponse = await response.json();

    // Cache token for 1 hour
    accessTokenCache = {
      token: data.accessToken,
      expiresAt: Date.now() + 3600000, // 1 hour
    };

    return data.accessToken;
  } catch (error: any) {
    console.error('Failed to get Sadad access token:', error);
    throw new Error(`Sadad authentication failed: ${error.message}`);
  }
}

/**
 * Create a payment transaction with Sadad
 */
export async function createSadadPayment(
  params: CreatePaymentParams
): Promise<CreatePaymentResponse> {
  const accessToken = await getSadadAccessToken();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.houseiana.net';

  try {
    const response = await fetch(`${SADAD_API_URL}/api/transactions/create`, {
      method: 'POST',
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency,
        merchantReference: params.merchantReference,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
        description: params.description,
        returnUrl: `${appUrl}/payment/return`,
        cancelUrl: `${appUrl}/payment/return?status=cancelled`,
        webhookUrl: `${appUrl}/api/webhooks/sadad`,
        metadata: params.metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sadad payment creation failed: ${error}`);
    }

    const data = await response.json();

    return {
      transactionId: data.transactionId || data.id,
      paymentUrl: data.paymentUrl || data.checkoutUrl,
      status: data.status || 'pending',
      merchantReference: params.merchantReference,
    };
  } catch (error: any) {
    console.error('Failed to create Sadad payment:', error);
    throw new Error(`Sadad payment creation failed: ${error.message}`);
  }
}

/**
 * Create a refund for a transaction
 */
export async function createSadadRefund(
  params: RefundParams
): Promise<RefundResponse> {
  const accessToken = await getSadadAccessToken();

  try {
    const response = await fetch(`${SADAD_API_URL}/api/transactions/${params.transactionId}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount,
        reason: params.reason,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sadad refund failed: ${error}`);
    }

    const data = await response.json();

    return {
      refundId: data.refundId || data.id,
      status: data.status || 'completed',
      amount: params.amount,
    };
  } catch (error: any) {
    console.error('Failed to create Sadad refund:', error);
    throw new Error(`Sadad refund failed: ${error.message}`);
  }
}

/**
 * Get transaction status
 */
export async function getSadadTransactionStatus(
  transactionId: string
): Promise<TransactionStatusResponse> {
  const accessToken = await getSadadAccessToken();

  try {
    const response = await fetch(`${SADAD_API_URL}/api/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get transaction status: ${error}`);
    }

    const data = await response.json();

    return {
      transactionId: data.transactionId || data.id,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      paidAt: data.paidAt || data.paid_at,
    };
  } catch (error: any) {
    console.error('Failed to get Sadad transaction status:', error);
    throw new Error(`Failed to get transaction status: ${error.message}`);
  }
}

/**
 * Verify Sadad webhook signature
 */
export function verifySadadWebhook(payload: string, signature: string): boolean {
  const secretKey = process.env.SADAD_SECRET_KEY;

  if (!secretKey) {
    throw new Error('Missing SADAD_SECRET_KEY in environment variables');
  }

  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
