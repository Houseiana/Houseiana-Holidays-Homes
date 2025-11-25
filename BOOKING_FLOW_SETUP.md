# Booking Flow Implementation - Setup Guide

This guide explains how to use the newly implemented best-practice booking flow for Houseiana.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Environment Setup](#environment-setup)
5. [Testing Guide](#testing-guide)
6. [Frontend Integration](#frontend-integration)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### Booking Lifecycle States

The new booking flow follows this state machine:

```
REQUESTED → APPROVED → CONFIRMED → CHECKED_IN → COMPLETED
    ↓           ↓          ↓
  REJECTED    EXPIRED   CANCELLED
```

### Key Features Implemented

✅ **Request-to-Book & Instant Book Support**
- Properties can require host approval or allow instant booking
- Configurable approval window (default: 24 hours)

✅ **Automatic Hold Expiry**
- Bookings expire if not paid within the hold period
- Releases calendar availability automatically
- Cron job handles cleanup

✅ **Flexible Cancellation Policies**
- FLEXIBLE: Full refund if cancelled 24h before check-in
- MODERATE: Full refund if 5+ days before, 50% if 1-5 days
- STRICT: Full refund if 14+ days before, 50% if 7-14 days
- SUPER_STRICT: Full refund if 30+ days before, 50% if 14-30 days

✅ **Payment Integration**
- Stripe payment intents with webhook support
- Automatic confirmation on payment success
- Refund processing with policy enforcement

✅ **Audit Logging & Notifications**
- All booking actions logged
- Email/SMS notification framework ready

---

## Database Schema

### New Booking Fields

```typescript
model Booking {
  // ... existing fields ...

  // New Status Fields
  holdExpiresAt      DateTime?  // Auto-expire timer
  approvedAt         DateTime?  // When host approved
  paymentIntentId    String?    // Stripe payment intent
  paymentCapturedAt  DateTime?  // Payment timestamp

  // Refund Tracking
  refundAmount       Float?
  refundedAt         DateTime?
  refundReason       String?

  // Cancellation Policy
  cancellationPolicyType String? @default("FLEXIBLE")
  cancellationDeadline   DateTime?
}
```

### New Property Fields

```typescript
model Property {
  // ... existing fields ...

  // Cancellation & Approval Settings
  cancellationPolicy    String?  @default("FLEXIBLE")
  requestToBook         Boolean  @default(false)
  approvalWindowHours   Int?     @default(24)
}
```

### Booking Status Enum

```typescript
enum BookingStatus {
  PENDING      // Legacy
  REQUESTED    // Initial request
  APPROVED     // Host approved
  CONFIRMED    // Payment successful
  CANCELLED    // Cancelled
  COMPLETED    // Trip completed
  REJECTED     // Host declined
  EXPIRED      // Payment timeout
  CHECKED_IN   // Guest checked in
}
```

---

## API Endpoints

### 1. Create Booking

**POST** `/api/bookings`

Creates a new booking with `REQUESTED` status and sets hold expiry.

**Request:**
```json
{
  "propertyId": "property_123",
  "checkIn": "2025-12-01",
  "checkOut": "2025-12-05",
  "guests": 2,
  "adults": 2,
  "children": 0,
  "specialRequests": "Late check-in please"
}
```

**Response:**
```json
{
  "id": "booking_456",
  "status": "REQUESTED",
  "paymentStatus": "PENDING",
  "holdExpiresAt": "2025-11-26T12:00:00Z",
  "totalPrice": 1200.00,
  "cancellationPolicyType": "FLEXIBLE"
}
```

### 2. Approve/Decline Booking (Host)

**PATCH** `/api/bookings/[id]`

**Approve Request:**
```json
{
  "action": "approve"
}
```

**Decline Request:**
```json
{
  "action": "decline",
  "reason": "Property not available"
}
```

### 3. Create Payment Intent (Guest)

**POST** `/api/payments/create-intent`

Creates a Stripe payment intent for the booking.

**Request:**
```json
{
  "bookingId": "booking_456"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 1200.00,
  "currency": "QAR"
}
```

### 4. Cancel Booking

**PATCH** `/api/bookings/[id]`

**Request:**
```json
{
  "action": "cancel",
  "reason": "Plans changed"
}
```

**Response:**
```json
{
  "success": true,
  "booking": { ...},
  "refundAmount": 1200.00,
  "message": "Booking cancelled successfully"
}
```

### 5. Process Refund (Host/Admin)

**POST** `/api/payments/refund`

**Request:**
```json
{
  "bookingId": "booking_456",
  "reason": "Host cancellation"
}
```

### 6. Expire Bookings (Cron)

**GET/POST** `/api/cron/expire-bookings`

Headers:
```
Authorization: Bearer YOUR_CRON_SECRET
```

---

## Environment Setup

### 1. Add Environment Variables

Add to your `.env.local`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Cron Job Secret
CRON_SECRET=your_random_secret_string

# Database (already configured)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# JWT Secret (already configured)
JWT_SECRET=your_jwt_secret
```

### 2. Configure Stripe Webhooks

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/stripe`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Set Up Cron Job

#### Option A: Vercel Cron

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-bookings",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

#### Option B: External Cron Service

Use services like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- AWS CloudWatch Events

Configure to call:
```
GET https://your-domain.com/api/cron/expire-bookings
Header: Authorization: Bearer YOUR_CRON_SECRET
```

Run every 15-30 minutes.

---

## Testing Guide

### 1. Test Booking Creation

```bash
curl -X POST https://your-domain.com/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "propertyId": "property_123",
    "checkIn": "2025-12-01",
    "checkOut": "2025-12-05",
    "guests": 2,
    "adults": 2
  }'
```

Expected: Booking created with `REQUESTED` status

### 2. Test Host Approval

```bash
curl -X PATCH https://your-domain.com/api/bookings/BOOKING_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer HOST_JWT_TOKEN" \
  -d '{
    "action": "approve"
  }'
```

Expected: Booking moves to `APPROVED` status, hold extended

### 3. Test Payment Flow

```bash
# Step 1: Create payment intent
curl -X POST https://your-domain.com/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer GUEST_JWT_TOKEN" \
  -d '{
    "bookingId": "BOOKING_ID"
  }'

# Step 2: Use clientSecret with Stripe Elements on frontend
# Step 3: Webhook automatically confirms booking on payment success
```

### 4. Test Cancellation

```bash
curl -X PATCH https://your-domain.com/api/bookings/BOOKING_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer GUEST_JWT_TOKEN" \
  -d '{
    "action": "cancel",
    "reason": "Testing cancellation"
  }'
```

Expected: Booking cancelled with refund amount calculated

### 5. Test Stripe Webhooks (Local)

Use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test payment
stripe trigger payment_intent.succeeded
```

### 6. Test Hold Expiry

```bash
curl -X POST https://your-domain.com/api/cron/expire-bookings \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected: Expired bookings move to `EXPIRED` status

---

## Frontend Integration

### Using the Status Badge Component

```tsx
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge'

<BookingStatusBadge
  status={booking.status}
  paymentStatus={booking.paymentStatus}
  size="md"
/>
```

### Using the Payment Modal

```tsx
import { PaymentModal } from '@/components/bookings/PaymentModal'

const [showPayment, setShowPayment] = useState(false)

<PaymentModal
  isOpen={showPayment}
  onClose={() => setShowPayment(false)}
  booking={booking}
  onPaymentSuccess={() => {
    // Refresh booking data
    fetchBookings()
  }}
/>
```

### Showing "Pay Now" Button

```tsx
{booking.status === 'APPROVED' && booking.paymentStatus === 'PENDING' && (
  <button onClick={() => setShowPayment(true)}>
    Pay Now - QAR {booking.totalPrice}
  </button>
)}
```

### Displaying Hold Expiry Timer

```tsx
{booking.holdExpiresAt && booking.status !== 'CONFIRMED' && (
  <div className="text-sm text-orange-600">
    Hold expires: {new Date(booking.holdExpiresAt).toLocaleString()}
  </div>
)}
```

---

## Troubleshooting

### Issue: 401 Unauthorized on API calls

**Solution:** Ensure JWT token is included in requests:
```typescript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
}
```

### Issue: Webhook signature verification failed

**Solution:** Check that `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint secret in Stripe Dashboard.

### Issue: Bookings not expiring

**Solution:**
1. Check cron job is running
2. Verify `CRON_SECRET` is set
3. Check `/api/cron/expire-bookings` endpoint manually

### Issue: Payment intent creation fails

**Solution:**
1. Verify `STRIPE_SECRET_KEY` is set correctly
2. Check booking status is `REQUESTED` or `APPROVED`
3. Ensure hold hasn't expired

### Issue: Refund not processing

**Solution:**
1. Check booking has `paymentIntentId`
2. Verify payment was actually captured in Stripe
3. Check cancellation policy allows refund

---

## Next Steps

1. ✅ **Backend Complete** - All API endpoints implemented
2. ✅ **Components Created** - Status badge and payment modal ready
3. 🔲 **Update Client Dashboard** - Integrate components into trips view
4. 🔲 **Update Host Console** - Add approve/decline buttons
5. 🔲 **Configure Notifications** - Set up email service (SendGrid/Resend)
6. 🔲 **Production Testing** - Test full flow in staging environment

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API endpoint responses for error messages
3. Check browser console and server logs
4. Verify all environment variables are set

---

**Implementation Date:** November 2025
**Version:** 1.0
**Status:** Backend Complete, Frontend Integration Pending
