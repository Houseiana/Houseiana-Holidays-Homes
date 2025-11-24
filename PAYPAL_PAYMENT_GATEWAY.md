# PayPal Payment Gateway Integration

Complete guide for setting up and using the PayPal payment gateway in Houseiana.

## Table of Contents

- [Overview](#overview)
- [Setup Instructions](#setup-instructions)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Webhook Configuration](#webhook-configuration)
- [Testing](#testing)
- [Production Deployment](#production-deployment)

---

## Overview

The Houseiana platform supports PayPal for secure payment processing alongside Stripe. This integration includes:

- **PayPal Orders**: Secure payment processing for bookings
- **Expanded Checkout**: Support for credit/debit cards through PayPal
- **PayPal Buttons**: Easy checkout with PayPal account
- **Webhooks**: Real-time payment event processing
- **Refunds**: Automated refund processing

**Currency**: USD (default) - supports 22 currencies in 36 countries

---

## Setup Instructions

### 1. Create a PayPal Business Account

1. Go to [https://www.paypal.com/](https://www.paypal.com/) and sign up for a Business account
2. Complete your business verification
3. Navigate to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)

### 2. Get Your API Credentials

**Sandbox Keys** (for development):
1. Go to Apps & Credentials > Sandbox
2. Create a new app or use default application
3. Copy the Client ID and Secret

**Live Keys** (for production):
1. Go to Apps & Credentials > Live
2. Create a new app
3. Copy the Client ID and Secret

### 3. Configure Environment Variables

Update your `.env.local` file:

```bash
# PayPal API Keys
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id_here

# PayPal Mode: sandbox or live
PAYPAL_MODE=sandbox

# Webhook ID (get this after setting up webhooks - see step 4)
PAYPAL_WEBHOOK_ID=your_webhook_id_here
```

### 4. Set Up Webhooks

Webhooks allow PayPal to notify your application about payment events in real-time.

#### For Production:

1. Go to PayPal Developer Dashboard > Webhooks
2. Click "Add Webhook"
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/paypal`
4. Select events to listen for:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`
5. Copy the webhook ID
6. Add it to your production environment variables in Vercel:
   ```bash
   vercel env add PAYPAL_WEBHOOK_ID production
   ```

---

## Architecture

### File Structure

```
src/lib/
  └── paypal.ts                # Centralized PayPal configuration and utilities

app/api/
  ├── paypal/
  │   ├── create-order/
  │   │   └── route.ts        # Create PayPal order for booking
  │   └── capture-order/
  │       └── route.ts        # Capture payment after approval
  └── webhooks/
      └── paypal/
          └── route.ts        # Handle PayPal webhook events
```

### Database Schema

**Payment Model** - Uses existing fields:
```prisma
model Payment {
  // ... other fields
  method            String         # Set to 'paypal'
  stripePaymentId   String?        # Stores PayPal Order ID
  // ... other fields
}
```

**Transaction Model**:
```prisma
model Transaction {
  id             String            @id @default(cuid())
  userId         String
  bookingId      String?
  description    String
  amount         Float
  status         TransactionStatus @default(PAID)
  type           TransactionType
  paymentMethod  String            # Set to 'PayPal'
  stripeChargeId String?           # Stores PayPal Capture ID
  date           DateTime          @default(now())
  user           User              @relation(...)
}
```

---

## API Endpoints

### 1. Create PayPal Order

**Endpoint**: `POST /api/paypal/create-order`

**Description**: Creates a PayPal order for a booking

**Request Body**:
```json
{
  "bookingId": "booking_id_here"
}
```

**Response**:
```json
{
  "orderId": "5O190127TN364715T",
  "amount": 1500.00,
  "currency": "USD",
  "status": "CREATED"
}
```

**Use Case**: Called when a user initiates PayPal payment for a booking

---

### 2. Capture PayPal Order

**Endpoint**: `POST /api/paypal/capture-order`

**Description**: Captures payment after user approves the order

**Request Body**:
```json
{
  "orderId": "5O190127TN364715T"
}
```

**Response**:
```json
{
  "success": true,
  "orderId": "5O190127TN364715T",
  "captureId": "2GG279541U471931P",
  "status": "COMPLETED",
  "amount": 1500.00,
  "currency": "USD"
}
```

---

### 3. Webhook Handler

**Endpoint**: `POST /api/webhooks/paypal`

**Description**: Receives and processes PayPal webhook events

**Events Handled**:

| Event | Action |
|-------|--------|
| `CHECKOUT.ORDER.APPROVED` | Updates payment status to PROCESSING |
| `PAYMENT.CAPTURE.COMPLETED` | Marks booking as CONFIRMED, creates transaction |
| `PAYMENT.CAPTURE.DENIED` | Marks booking as CANCELLED, creates failed transaction |
| `PAYMENT.CAPTURE.REFUNDED` | Creates refund transaction, marks booking as REFUNDED |

---

## Webhook Configuration

### Local Development (Testing)

For local testing, use a tool like [ngrok](https://ngrok.com/) to create a public URL:

```bash
# Start your Next.js server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Use the ngrok URL for webhook testing
# Example: https://abc123.ngrok.io/api/webhooks/paypal
```

### Production

1. Add webhook endpoint in PayPal Developer Dashboard:
   - URL: `https://houseiana.net/api/webhooks/paypal`
   - Events: Select all payment-related events

2. Copy webhook ID

3. Add to Vercel environment variables:
   ```bash
   vercel env add PAYPAL_WEBHOOK_ID production
   ```

---

## Testing

### Test Accounts

PayPal Sandbox provides test accounts for different scenarios:

**Buyer Accounts** (for testing purchases):
- You can create test buyer accounts in the PayPal Sandbox
- Or use the default sandbox personal account

**Test Card Numbers**:
- Visa: `4032035497629493`
- Mastercard: `5450751368701831`
- Any future expiry date
- Any 3-digit CVV

### Testing Payment Flow

1. **Create a booking** (status: PENDING)
2. **Create PayPal order**: `POST /api/paypal/create-order`
3. **Use PayPal JS SDK** to render PayPal buttons
4. **User approves** payment in PayPal popup
5. **Capture order**: `POST /api/paypal/capture-order`
6. **Webhook processes** the payment result
7. **Booking status** updates to CONFIRMED

### Testing Webhooks Locally

Use ngrok to expose your local server:

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Configure webhook in PayPal Sandbox to point to ngrok URL
```

---

## Production Deployment

### 1. Update Environment Variables in Vercel

```bash
# Set production PayPal keys
vercel env add PAYPAL_CLIENT_ID production
vercel env add PAYPAL_CLIENT_SECRET production
vercel env add NEXT_PUBLIC_PAYPAL_CLIENT_ID production
vercel env add PAYPAL_MODE production
vercel env add PAYPAL_WEBHOOK_ID production
```

### 2. Enable Live Mode in PayPal

1. Switch to Live mode in PayPal Developer Dashboard
2. Get your live API credentials
3. Update environment variables with live keys
4. Set `PAYPAL_MODE=live`

### 3. Configure Production Webhook

1. Go to PayPal Developer Dashboard > Webhooks
2. Add endpoint: `https://houseiana.net/api/webhooks/paypal`
3. Select events to monitor
4. Copy webhook ID and update environment variable

### 4. Test in Production

1. Make a small test transaction ($1.00)
2. Verify webhook events are received
3. Check booking status updates correctly
4. Verify transaction records created

---

## Security Best Practices

1. **Never expose secret keys**: Keep `PAYPAL_CLIENT_SECRET` server-side only
2. **Validate webhooks**: Always verify webhook signatures in production
3. **Use HTTPS**: Webhooks only work with HTTPS endpoints
4. **Idempotency**: Webhook handlers should be idempotent (safe to retry)
5. **Error handling**: Log errors but don't expose internal details to clients
6. **PCI Compliance**: Use PayPal's hosted checkout - never store card details

---

## PayPal vs Stripe

| Feature | PayPal | Stripe |
|---------|--------|--------|
| **Currencies** | 22 currencies | 135+ currencies |
| **Countries** | 36 countries | 195+ countries |
| **Payment Methods** | PayPal, Cards | Cards, Wallets, Bank transfers |
| **Setup Complexity** | Medium | Medium |
| **Transaction Fees** | 2.9% + $0.30 | 2.9% + $0.30 |
| **Payout Speed** | 1-2 days | 2-7 days |
| **User Trust** | Very High | High |

---

## Common Issues & Solutions

### Issue: "PayPal SDK not loading"
**Solution**: Ensure `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set and accessible on client-side

### Issue: Webhook signature verification failed
**Solution**:
- Check `PAYPAL_WEBHOOK_ID` is correct
- Verify webhook URL matches exactly
- Ensure request body is read as JSON

### Issue: Payment order creation fails
**Solution**:
- Verify booking exists and is in PENDING status
- Check amount is positive and currency is valid
- Ensure PayPal credentials are correct

### Issue: Capture fails after approval
**Solution**:
- Verify order was created successfully
- Check order hasn't expired (3 hours)
- Ensure order status is "APPROVED"

---

## Integration Examples

### Client-Side PayPal Button

```tsx
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

export default function PayPalCheckout({ bookingId }: { bookingId: string }) {
  return (
    <PayPalScriptProvider options={{
      "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
      currency: "USD"
    }}>
      <PayPalButtons
        createOrder={async () => {
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId })
          })
          const data = await res.json()
          return data.orderId
        }}
        onApprove={async (data) => {
          const res = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: data.orderID })
          })
          const result = await res.json()
          if (result.success) {
            alert('Payment successful!')
          }
        }}
      />
    </PayPalScriptProvider>
  )
}
```

---

## Support & Resources

- **PayPal Developer**: [https://developer.paypal.com/](https://developer.paypal.com/)
- **PayPal Dashboard**: [https://www.paypal.com/businessmanage/](https://www.paypal.com/businessmanage/)
- **PayPal Support**: [https://www.paypal.com/smarthelp/contact-us](https://www.paypal.com/smarthelp/contact-us)
- **API Reference**: [https://developer.paypal.com/api/rest/](https://developer.paypal.com/api/rest/)
- **JS SDK**: [https://developer.paypal.com/sdk/js/](https://developer.paypal.com/sdk/js/)

---

## Summary

Your PayPal payment gateway is now fully configured with:

✅ Centralized PayPal configuration (`src/lib/paypal.ts`)
✅ Order creation for bookings
✅ Order capture after approval
✅ Webhook handler for real-time events
✅ Transaction tracking and history
✅ Comprehensive error handling
✅ Production-ready security

**Next Steps**:
1. Get your PayPal API credentials (sandbox for development)
2. Update environment variables in `.env.local`
3. Set up webhooks for production
4. Test payment flow with sandbox accounts
5. Deploy to production with live keys
