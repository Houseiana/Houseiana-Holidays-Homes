# Sadad Qatar Payment Integration Guide

This guide explains how to configure and use the Sadad Qatar payment gateway for the Houseiana booking platform.

## 📋 Overview

Sadad Qatar is the payment gateway provider for Qatar. The integration supports:
- Credit Card payments
- Debit Card payments
- Sadad Pay
- Secure redirect-based checkout
- Webhook notifications
- Automated refunds

---

## 🔧 Configuration

### 1. Environment Variables

Add these variables to your `.env.local` file:

```bash
# Sadad Qatar Configuration
SADAD_SECRET_KEY=LkOx3OfmcIOH0t7F
SADAD_ID=your_sadad_id_here
SADAD_DOMAIN=www.houseiana.net

# Application URLs
NEXT_PUBLIC_APP_URL=https://www.houseiana.net

# Cron Job Secret
CRON_SECRET=your_random_secret_string

# Database (already configured)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# JWT Secret (already configured)
JWT_SECRET=your_jwt_secret
```

**Note:** The Sadad API URL (`https://api-s.sadad.qa`) is hardcoded in the integration library.

### 2. Sadad Dashboard Setup

#### A. Webhook Configuration

1. Log in to your [Sadad Dashboard](https://dashboard.sadad.qa)
2. Navigate to **Webhooks** section
3. Set webhook URL to:
   ```
   https://www.houseiana.net/api/webhooks/sadad
   ```
4. Enter alert email: `admin@houseiana.net`
5. Enable these webhook events:
   - Payment Success
   - Payment Failed
   - Payment Cancelled
   - Refund Success

#### B. Checkout Customization

1. Upload your logo (max 1MB, minimum 100x100px)
2. Set colors:
   - Background Color: `#8d193c`
   - Title Color: `#ffffff`
3. Save changes

#### C. Domain Registration

Ensure `www.houseiana.net` is registered in your Sadad account.

---

## 🔐 Security

### Webhook Signature Verification

Sadad signs webhooks with HMAC-SHA256. The signature is verified in:
```typescript
// src/lib/sadad.ts
export function verifySadadWebhook(payload: string, signature: string): boolean
```

The webhook handler checks the signature before processing any payment updates.

### API Authentication

Sadad uses a token-based authentication system:

1. **Login:** First, authenticate using your Sadad ID and Secret Key:
```typescript
POST https://api-s.sadad.qa/api/userbusinesses/login
{
  "sadadId": parseInt(SADAD_ID),
  "secretKey": SADAD_SECRET_KEY,
  "domain": SADAD_DOMAIN
}
// Returns: { "accessToken": "..." }
```

2. **API Requests:** Include the access token in subsequent requests:
```typescript
{
  'Authorization': accessToken,  // Direct token, no "Bearer" prefix
  'Content-Type': 'application/json'
}
```

Access tokens are cached for 1 hour to reduce authentication calls.

---

## 💳 Payment Flow

### Standard Booking Flow

```
1. Guest creates booking → Status: REQUESTED
2. Host approves (if request-to-book) → Status: APPROVED
3. Guest clicks "Pay Now"
4. System creates Sadad transaction
5. Guest redirected to Sadad payment page
6. Guest completes payment on Sadad
7. Sadad webhook notifies system
8. Booking updated → Status: CONFIRMED, Payment: PAID
9. Guest redirected back to Houseiana
```

### Technical Flow

```typescript
// 1. Create payment transaction
POST /api/payments/create-intent
Request: { bookingId: "booking_123" }
Response: {
  transactionId: "sadad_xyz",
  paymentUrl: "https://checkout.sadad.qa/pay/xyz",
  merchantReference: "BK12345678",
  amount: 1200.00,
  currency: "QAR"
}

// 2. Redirect user to paymentUrl

// 3. User completes payment on Sadad

// 4. Sadad sends webhook
POST /api/webhooks/sadad
{
  event: "payment.success",
  transaction_id: "sadad_xyz",
  merchant_reference: "BK12345678",
  amount: 1200.00,
  status: "paid"
}

// 5. System updates booking

// 6. User redirected to return URL
https://www.houseiana.net/payment/return?status=success&transaction_id=sadad_xyz
```

---

## 🔄 Webhook Events

### Payment Success

```json
{
  "event": "payment.success",
  "transaction_id": "sadad_xyz123",
  "merchant_reference": "BK12345678",
  "amount": 1200.00,
  "currency": "QAR",
  "paid_at": "2025-11-25T14:30:00Z",
  "customer_email": "guest@example.com"
}
```

**Action:** Booking status → CONFIRMED, Payment status → PAID

### Payment Failed

```json
{
  "event": "payment.failed",
  "transaction_id": "sadad_xyz123",
  "merchant_reference": "BK12345678",
  "reason": "Insufficient funds"
}
```

**Action:** Payment status → FAILED (booking remains REQUESTED/APPROVED for retry)

### Payment Cancelled

```json
{
  "event": "payment.cancelled",
  "transaction_id": "sadad_xyz123",
  "merchant_reference": "BK12345678"
}
```

**Action:** Booking status → EXPIRED, Payment status → FAILED

### Refund Success

```json
{
  "event": "refund.success",
  "transaction_id": "sadad_xyz123",
  "refund_id": "ref_abc456",
  "amount": 600.00,
  "status": "completed"
}
```

**Action:** Payment status → REFUNDED or PARTIALLY_REFUNDED

---

## 💰 Refund Processing

### Automatic Refund Calculation

Refunds are calculated based on the cancellation policy:

| Policy | Timing | Refund |
|--------|--------|--------|
| FLEXIBLE | 1+ days before | 100% |
| MODERATE | 5+ days before | 100% |
| MODERATE | 1-5 days before | 50% |
| STRICT | 14+ days before | 100% |
| STRICT | 7-14 days before | 50% |
| SUPER_STRICT | 30+ days before | 100% |
| SUPER_STRICT | 14-30 days before | 50% |

### Process Refund

```bash
# As host or admin
POST /api/payments/refund
{
  "bookingId": "booking_123",
  "reason": "Host cancellation"
}

# System calculates refund amount based on policy
# Sadad processes refund
# Booking updated with refund details
```

---

## 🧪 Testing

### Test Mode

Your Secret Key type is **Test**, so all transactions will be in test mode.

### Test Payment Flow

1. Create a test booking
2. Click "Pay Now"
3. On Sadad checkout page:
   - Use test card: `4111 1111 1111 1111`
   - Any future expiry date
   - Any 3-digit CVV
4. Complete payment
5. You'll be redirected back to Houseiana
6. Check booking status is CONFIRMED

### Test Webhook Locally

```bash
# 1. Start your dev server
npm run dev

# 2. Use ngrok to expose localhost
ngrok http 3000

# 3. Update Sadad webhook URL to ngrok URL
https://your-ngrok-url.ngrok.io/api/webhooks/sadad

# 4. Make a test payment

# 5. Check terminal for webhook logs
```

### Test Refund

```bash
# Create and pay for a booking
# Then cancel it
PATCH /api/bookings/booking_123
{
  "action": "cancel",
  "reason": "Test cancellation"
}

# System will automatically process refund through Sadad
```

---

## 📱 Payment Return Page

When users complete payment on Sadad, they're redirected to:
```
https://www.houseiana.net/payment/return?status=success&transaction_id=xyz
```

The return page:
1. Checks payment status from URL parameters
2. Verifies with backend
3. Shows success/failure message
4. Redirects to bookings page after 3 seconds

File: [app/payment/return/page.tsx](app/payment/return/page.tsx)

---

## 🚨 Troubleshooting

### Issue: Payment not confirming

**Solutions:**
1. Check webhook is configured correctly in Sadad dashboard
2. Verify webhook URL is accessible publicly
3. Check server logs for webhook errors
4. Ensure `SADAD_SECRET_KEY` is correct

### Issue: Invalid signature error

**Solutions:**
1. Check if Sadad is sending `x-sadad-signature` header
2. Verify signature algorithm with Sadad documentation
3. Check secret key is correct

### Issue: Redirect URL not working

**Solutions:**
1. Ensure `NEXT_PUBLIC_APP_URL` is set correctly
2. Check Sadad dashboard has correct return URL
3. Verify domain is registered in Sadad account

### Issue: Refund failing

**Solutions:**
1. Check transaction was successful (status = PAID)
2. Verify transaction ID is correct
3. Check refund amount doesn't exceed original payment
4. Contact Sadad support for transaction details

---

## 📚 API Reference

### Sadad Integration Library

Location: [src/lib/sadad.ts](src/lib/sadad.ts)

#### Create Payment

```typescript
import { createSadadPayment } from '@/lib/sadad'

const payment = await createSadadPayment({
  amount: 1200.00,
  currency: 'QAR',
  merchantReference: 'BK12345678',
  customerEmail: 'guest@example.com',
  customerName: 'John Doe',
  description: 'Booking for Villa in Doha',
  metadata: {
    bookingId: 'booking_123',
    propertyId: 'prop_456'
  }
})

// Returns:
// {
//   transactionId: 'sadad_xyz',
//   paymentUrl: 'https://checkout.sadad.qa/...',
//   status: 'pending',
//   merchantReference: 'BK12345678'
// }
```

#### Create Refund

```typescript
import { createSadadRefund } from '@/lib/sadad'

const refund = await createSadadRefund({
  transactionId: 'sadad_xyz',
  amount: 600.00,
  reason: 'Cancellation refund'
})

// Returns:
// {
//   refundId: 'ref_abc',
//   status: 'completed',
//   amount: 600.00
// }
```

#### Get Transaction Status

```typescript
import { getSadadTransactionStatus } from '@/lib/sadad'

const status = await getSadadTransactionStatus('sadad_xyz')

// Returns:
// {
//   transactionId: 'sadad_xyz',
//   status: 'captured',
//   amount: 1200.00,
//   currency: 'QAR',
//   paidAt: '2025-11-25T14:30:00Z'
// }
```

---

## 🎨 Customization

### Payment Modal

The payment modal redirects users to Sadad's checkout page.

File: [components/bookings/PaymentModal.tsx](components/bookings/PaymentModal.tsx)

Key features:
- Shows booking summary
- Displays total amount
- Lists supported payment methods
- Redirects to Sadad on "Pay Now"
- Stores booking ID for return verification

### Checkout Page Branding

Customize in Sadad Dashboard:
- Logo: Your company logo
- Background Color: Brand color
- Title Color: Contrast color
- Company Name: Displayed on checkout

---

## 📊 Production Checklist

Before going live:

- [ ] Switch to **Production** Secret Key in Sadad dashboard
- [ ] Update `SADAD_SECRET_KEY` in production environment
- [ ] Set production webhook URL
- [ ] Test complete payment flow
- [ ] Test refund flow
- [ ] Verify webhook signature validation
- [ ] Set up monitoring for payment failures
- [ ] Configure email notifications
- [ ] Test cron job for expired bookings
- [ ] Review Sadad transaction logs
- [ ] Set up error tracking (Sentry)

---

## 🔗 Resources

- [Sadad Qatar Website](https://sadad.qa)
- [Sadad Dashboard](https://dashboard.sadad.qa)
- [Sadad API Documentation](https://sadad.qa/developers) (if available)
- Support: +974-44464666

---

## 💡 Best Practices

1. **Always verify webhooks** - Don't trust incoming requests without signature verification
2. **Handle webhook retries** - Sadad may send the same webhook multiple times
3. **Log all transactions** - Keep audit logs of all payment activities
4. **Monitor payment success rate** - Alert on unusual failure rates
5. **Test refunds regularly** - Ensure refund flow works correctly
6. **Keep webhook endpoint fast** - Process webhooks quickly, queue heavy work
7. **Handle edge cases** - Payment succeeds but webhook fails, etc.

---

**Last Updated:** November 2025
**Integration Version:** 1.0
**Payment Gateway:** Sadad Qatar
