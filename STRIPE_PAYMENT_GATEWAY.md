# Stripe Payment Gateway Integration

Complete guide for setting up and using the Stripe payment gateway in Houseiana.

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

The Houseiana platform uses Stripe for secure payment processing. This integration includes:

- **Payment Intents**: Secure payment processing for bookings
- **Customer Management**: Automatic Stripe customer creation and management
- **Payment Methods**: Save and manage credit/debit cards
- **Webhooks**: Real-time payment event processing
- **Refunds**: Automated refund processing

**Currency**: Qatar Riyal (QAR) - default for the platform

---

## Setup Instructions

### 1. Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and sign up
2. Complete your account verification
3. Navigate to Developers > API Keys

### 2. Get Your API Keys

**Test Mode Keys** (for development):
- Publishable key: `pk_test_...`
- Secret key: `sk_test_...`

**Live Mode Keys** (for production):
- Publishable key: `pk_live_...`
- Secret key: `sk_live_...`

### 3. Configure Environment Variables

Update your `.env.local` file:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Webhook Secret (get this after setting up webhooks - see step 4)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. Set Up Webhooks

Webhooks allow Stripe to notify your application about payment events in real-time.

#### For Development (Using Stripe CLI):

1. Install Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```

4. Copy the webhook signing secret that appears and add it to `.env.local`

#### For Production:

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
   - `payment_method.attached`
   - `payment_method.detached`
   - `customer.updated`
5. Copy the webhook signing secret
6. Add it to your production environment variables in Vercel:
   ```bash
   vercel env add STRIPE_WEBHOOK_SECRET
   ```

---

## Architecture

### File Structure

```
lib/
  └── stripe.ts                 # Centralized Stripe configuration and utilities

app/api/
  ├── payments/
  │   ├── route.ts             # Get payment history, methods, upcoming charges
  │   └── create-intent/
  │       └── route.ts         # Create payment intent for booking
  ├── payment-methods/
  │   ├── route.ts             # List and add payment methods
  │   └── [id]/
  │       └── route.ts         # Delete or set default payment method
  └── webhooks/
      └── stripe/
          └── route.ts         # Handle Stripe webhook events
```

### Database Schema

**User Model** - Added field:
```prisma
model User {
  // ... other fields
  stripeCustomerId  String?  @unique  // Stripe customer ID
  // ... other fields
}
```

**PaymentMethod Model**:
```prisma
model PaymentMethod {
  id                    String   @id @default(cuid())
  userId                String
  brand                 String   # visa, mastercard, etc.
  last4                 String   # Last 4 digits
  expiry                String   # Format: MM/YYYY
  isDefault             Boolean  @default(false)
  stripePaymentMethodId String?  @unique
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  user                  User     @relation(...)
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
  paymentMethod  String
  stripeChargeId String?          @unique
  date           DateTime         @default(now())
  user           User             @relation(...)
}
```

---

## API Endpoints

### 1. Create Payment Intent

**Endpoint**: `POST /api/payments/create-intent`

**Description**: Creates a Stripe PaymentIntent for a booking

**Request Body**:
```json
{
  "bookingId": "booking_id_here"
}
```

**Response**:
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 1500.00,
  "currency": "QAR"
}
```

**Use Case**: Called when a user initiates payment for a booking

---

### 2. Get Payment Data

**Endpoint**: `GET /api/payments`

**Description**: Retrieves payment history, methods, and upcoming charges

**Response**:
```json
{
  "summary": {
    "outstanding": 0,
    "credits": 0,
    "totalSpend": 5000,
    "successRate": 100
  },
  "upcomingCharges": [
    {
      "id": "booking_xxx",
      "title": "Luxury Villa in Doha",
      "amount": 2500,
      "dueDate": "2025-12-01T00:00:00.000Z",
      "status": "scheduled"
    }
  ],
  "methods": [
    {
      "id": "pm_xxx",
      "brand": "visa",
      "last4": "4242",
      "exp": "12/2026",
      "name": "John Doe",
      "primary": true
    }
  ],
  "history": [
    {
      "id": "txn_xxx",
      "property": "Luxury Villa in Doha",
      "propertyLocation": "Doha, Qatar",
      "date": "2025-11-20T00:00:00.000Z",
      "amount": 2500,
      "status": "Paid",
      "method": "Credit Card",
      "type": "reservation"
    }
  ]
}
```

---

### 3. List Payment Methods

**Endpoint**: `GET /api/payment-methods`

**Description**: Get all saved payment methods for the authenticated user

**Response**:
```json
{
  "methods": [
    {
      "id": "pm_xxx",
      "userId": "user_xxx",
      "brand": "visa",
      "last4": "4242",
      "expiry": "12/2026",
      "isDefault": true,
      "stripePaymentMethodId": "pm_xxx"
    }
  ]
}
```

---

### 4. Add Payment Method

**Endpoint**: `POST /api/payment-methods`

**Description**: Add a new payment method for the user

**Request Body**:
```json
{
  "paymentMethodId": "pm_xxx"  // From Stripe.js client-side
}
```

**Response**:
```json
{
  "method": {
    "id": "pm_xxx",
    "brand": "visa",
    "last4": "4242",
    "expiry": "12/2026",
    "isDefault": true
  },
  "message": "Payment method added successfully"
}
```

**Note**: The first payment method is automatically set as default

---

### 5. Delete Payment Method

**Endpoint**: `DELETE /api/payment-methods/[id]`

**Description**: Remove a saved payment method

**Response**:
```json
{
  "message": "Payment method deleted successfully"
}
```

---

### 6. Set Default Payment Method

**Endpoint**: `PATCH /api/payment-methods/[id]`

**Description**: Set a payment method as the default

**Request Body**:
```json
{
  "action": "set-default"
}
```

**Response**:
```json
{
  "message": "Default payment method updated successfully"
}
```

---

### 7. Webhook Handler

**Endpoint**: `POST /api/webhooks/stripe`

**Description**: Receives and processes Stripe webhook events

**Events Handled**:

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Marks booking as CONFIRMED, creates transaction |
| `payment_intent.payment_failed` | Marks booking payment as FAILED, creates failed transaction |
| `payment_intent.canceled` | Marks booking as CANCELED |
| `charge.refunded` | Creates refund transaction, marks booking as REFUNDED |
| `payment_method.attached` | Saves payment method to database |
| `payment_method.detached` | Removes payment method from database |
| `customer.updated` | Updates default payment method |

---

## Webhook Configuration

### Local Development

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login:
   ```bash
   stripe login
   ```

3. Start webhook forwarding:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```

4. In another terminal, test a webhook:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

### Production

1. Add webhook endpoint in Stripe Dashboard:
   - URL: `https://houseiana.net/api/webhooks/stripe`
   - Events: Select all payment-related events

2. Copy webhook signing secret

3. Add to Vercel environment variables:
   ```bash
   vercel env add STRIPE_WEBHOOK_SECRET production
   ```

---

## Testing

### Test Cards

Stripe provides test cards for different scenarios:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Payment declined (insufficient funds) |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 0341` | Payment declined (lost card) |

**Test Details**:
- Use any future expiry date (e.g., 12/26)
- Use any 3-digit CVC
- Use any ZIP code

### Testing Payment Flow

1. **Create a booking** (status: PENDING)
2. **Create payment intent**: `POST /api/payments/create-intent`
3. **Use Stripe.js** to collect payment details and confirm
4. **Webhook processes** the payment result
5. **Booking status** updates to CONFIRMED

### Testing Webhooks Locally

```bash
# Terminal 1: Start your Next.js server
npm run dev

# Terminal 2: Forward Stripe webhooks
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe

# Terminal 3: Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger charge.refunded
```

---

## Production Deployment

### 1. Update Environment Variables in Vercel

```bash
# Set production Stripe keys
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
```

### 2. Enable Live Mode in Stripe

1. Switch to Live mode in Stripe Dashboard
2. Get your live API keys
3. Update environment variables with live keys

### 3. Configure Production Webhook

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://houseiana.net/api/webhooks/stripe`
3. Select events to monitor
4. Copy signing secret and update environment variable

### 4. Test in Production

1. Make a small test transaction (1 QAR)
2. Verify webhook events are received
3. Check booking status updates correctly
4. Verify transaction records created

---

## Security Best Practices

1. **Never expose secret keys**: Keep `STRIPE_SECRET_KEY` server-side only
2. **Validate webhooks**: Always verify webhook signatures
3. **Use HTTPS**: Webhooks only work with HTTPS endpoints
4. **Idempotency**: Webhook handlers should be idempotent (safe to retry)
5. **Error handling**: Log errors but don't expose internal details to clients
6. **PCI Compliance**: Never store full card numbers - let Stripe handle it

---

## Common Issues & Solutions

### Issue: "Stripe is not configured"
**Solution**: Ensure `STRIPE_SECRET_KEY` is set and doesn't contain placeholder values

### Issue: Webhook signature verification failed
**Solution**:
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Verify webhook URL matches exactly
- Ensure request body is read as raw text

### Issue: Payment intent creation fails
**Solution**:
- Verify booking exists and is in PENDING status
- Check amount is positive and currency is valid
- Ensure Stripe customer was created successfully

### Issue: Payment methods not syncing
**Solution**:
- Verify webhooks are configured correctly
- Check webhook events are being received
- Ensure payment_method.attached event is enabled

---

## Support & Resources

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe Dashboard**: [https://dashboard.stripe.com](https://dashboard.stripe.com)
- **Stripe Support**: [https://support.stripe.com](https://support.stripe.com)
- **Stripe API Reference**: [https://stripe.com/docs/api](https://stripe.com/docs/api)

---

## Summary

Your Stripe payment gateway is now fully configured with:

✅ Centralized Stripe configuration (`lib/stripe.ts`)
✅ Payment Intent creation for bookings
✅ Payment method management (add, delete, set default)
✅ Webhook handler for real-time events
✅ Automatic Stripe customer creation
✅ Transaction tracking and history
✅ Comprehensive error handling
✅ Production-ready security

**Next Steps**:
1. Get your Stripe API keys (test mode for development)
2. Update environment variables in `.env.local`
3. Set up webhooks using Stripe CLI for local testing
4. Test payment flow with test cards
5. Deploy to production with live keys
