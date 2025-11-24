# Payment System Integration Documentation

## Overview

The payment page in the client dashboard has been fully integrated with the project's backend infrastructure. The system includes:

- ✅ Database models (Prisma schema)
- ✅ API endpoint (`/api/payments`)
- ✅ Frontend components (Client Dashboard)
- ✅ Authentication & authorization
- ✅ Real-time data fetching

## Architecture

### Database Layer (Prisma)

**Location:** `prisma/schema.prisma`

The following models support the payment system:

```prisma
model PaymentMethod {
  id          String   @id @default(cuid())
  userId      String
  brand       String
  last4       String
  expiry      String
  isDefault   Boolean  @default(false)
  stripePaymentMethodId String? @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
}

model Transaction {
  id            String   @id @default(cuid())
  userId        String
  bookingId     String?
  description   String
  amount        Float
  status        TransactionStatus @default(PAID)
  type          TransactionType
  paymentMethod String
  stripeChargeId String? @unique
  stripeRefundId String? @unique
  date          DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id])
}

enum TransactionStatus {
  PAID
  PENDING
  REFUNDED
  FAILED
}

enum TransactionType {
  PAYMENT
  REFUND
}
```

### API Layer

**Location:** `app/api/payments/route.ts`

**Authentication:** JWT Bearer token (from localStorage: `auth_token`)

**Request:**
```http
GET /api/payments
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  summary: {
    outstanding: number      // Total pending payments
    credits: number          // Available travel credits
    totalSpend: number       // Lifetime spend
    successRate: number      // Payment success rate (%)
  }
  upcomingCharges: [{
    id: string
    title: string
    amount: number
    dueDate: string (ISO)
    status: 'scheduled' | 'processing'
  }]
  methods: [{
    id: string
    brand: string              // e.g., "Visa", "Mastercard"
    last4: string              // Last 4 digits
    exp: string                // Expiry date
    name: string               // Cardholder name
    primary: boolean           // Default payment method
  }]
  history: [{
    id: string
    property: string
    propertyLocation: string
    date: string (ISO)
    amount: number
    status: 'Paid' | 'Pending' | 'Refunded' | 'Failed'
    method: string
    type: 'reservation' | 'security-deposit' | 'add-on' | 'refund' | 'payment'
  }]
}
```

**Data Sources:**
- **Transactions:** `prisma.transaction.findMany()` - User's payment history
- **Payment Methods:** `prisma.paymentMethod.findMany()` - Saved cards
- **Upcoming Charges:** `prisma.booking.findMany()` - Pending bookings with PENDING payment status
- **Property Details:** Joins with `Property` model for context

### Frontend Layer

**Location:** `app/client-dashboard/page.tsx`

**Features:**
1. **Summary Dashboard**
   - Current balance
   - Total spend
   - Travel credits
   - Success rate metrics

2. **Payment Methods**
   - Default payment method display
   - Card brand and last 4 digits
   - Expiry date
   - Refresh functionality

3. **Payment History Table**
   - Reference ID
   - Property name and location
   - Transaction date
   - Amount
   - Payment method
   - Status badges (colored by status)

4. **Upcoming Charges**
   - Auto-pay enabled charges
   - Due dates
   - Scheduled/processing status

5. **Loading & Error States**
   - Loading spinner while fetching
   - Error messages with retry option
   - Empty states with CTAs

**Data Flow:**
```
User clicks "Payments" tab
  ↓
useEffect triggers fetchPayments()
  ↓
GET /api/payments with Bearer token
  ↓
API validates JWT token
  ↓
API queries database (Prisma)
  ↓
API returns formatted response
  ↓
Frontend updates state
  ↓
UI renders payment data
```

## Authentication System

**Token Storage:** `localStorage.getItem('auth_token')`

**Token Format:** JWT (JSON Web Token)

**Token Payload:**
```typescript
{
  userId: string
  email: string
  firstName: string
  lastName: string
  isHost: boolean
  iat: number   // Issued at
  exp: number   // Expiration
}
```

**Auth Flow:**
1. User signs in via Clerk or custom auth
2. JWT token stored in `localStorage` as `auth_token`
3. Frontend includes token in `Authorization: Bearer <token>` header
4. API validates token via `getUserFromRequest()` helper
5. API extracts `userId` from token
6. API queries user's payment data

## Database Setup

### Required Models

Ensure the following models exist in your Prisma schema:
- ✅ `User` (lines 21-116)
- ✅ `PaymentMethod` (lines 1219-1235)
- ✅ `Transaction` (lines 1237-1259)
- ✅ `Booking` (referenced for upcoming charges)
- ✅ `Property` (referenced for transaction context)

### Sync Database

```bash
# Generate Prisma Client
npx prisma generate

# Apply schema changes to database
npx prisma db push

# (Optional) View database in browser
npx prisma studio
```

## Testing the Integration

### 1. Prerequisites

- ✅ Next.js dev server running (`npm run dev`)
- ✅ Valid JWT token in localStorage
- ✅ Database connection configured
- ✅ Prisma client generated

### 2. Test Without Auth (Expected: 401)

```bash
curl -i http://localhost:3000/api/payments
# Expected: {"error":"Authentication required"}
```

### 3. Test With Auth (Expected: 200)

**Step 1:** Sign in to the application to get a token

**Step 2:** Extract token from browser localStorage:
```javascript
// In browser console:
localStorage.getItem('auth_token')
```

**Step 3:** Test with curl:
```bash
TOKEN="your-jwt-token-here"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/payments | jq
```

**Expected Response:**
```json
{
  "summary": { ... },
  "upcomingCharges": [ ... ],
  "methods": [ ... ],
  "history": [ ... ]
}
```

### 4. Test in UI

1. Navigate to http://localhost:3000/client-dashboard
2. Sign in with valid credentials
3. Click "Payments" tab
4. Verify:
   - ✅ Loading state appears
   - ✅ Data loads without errors
   - ✅ Summary cards display
   - ✅ Payment history table renders
   - ✅ Refresh button works

## Seeding Test Data

To see the payments page with real data, seed the database:

```typescript
// prisma/seed.ts (create this file)
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const userId = 'your-user-id' // Get from database or auth

  // Seed payment method
  await prisma.paymentMethod.create({
    data: {
      userId,
      brand: 'Visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true,
      stripePaymentMethodId: 'pm_test_123'
    }
  })

  // Seed transactions
  await prisma.transaction.create({
    data: {
      userId,
      description: 'Booking payment',
      amount: 450.00,
      status: 'PAID',
      type: 'PAYMENT',
      paymentMethod: 'Visa ****4242',
      bookingId: 'booking-id-here' // Optional
    }
  })

  // Seed more transactions...
}

main()
```

Run seed:
```bash
npx ts-node prisma/seed.ts
```

## API Error Handling

| Error | Status | Response |
|-------|--------|----------|
| No auth token | 401 | `{"error":"Authentication required"}` |
| Invalid token | 401 | `{"error":"Authentication required"}` |
| Database error | 500 | `{"error":"Internal server error"}` |

## Environment Variables

Required in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
JWT_SECRET="your-32-char-secret"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

## Security Considerations

1. **JWT Validation:** All requests validated via `getUserFromRequest()`
2. **User Isolation:** Queries filtered by `userId` from token
3. **HTTPS Only:** Production should enforce HTTPS
4. **Token Expiry:** Tokens expire after 7 days
5. **No Sensitive Data:** Card numbers masked (last 4 digits only)

## Troubleshooting

### Issue: "Cannot find module '@/lib/prisma'"
**Solution:** Import changed to `@/lib/prisma-server` for API routes

### Issue: "Authentication required" in UI
**Solution:**
1. Check `localStorage.getItem('auth_token')` exists
2. Verify token is valid JWT
3. Check API route receives Authorization header

### Issue: Empty payment data
**Solution:**
1. Seed test data (see above)
2. Verify database connection
3. Check Prisma queries return data

### Issue: Database connection errors
**Solution:**
1. Verify `DATABASE_URL` in `.env.local`
2. Run `npx prisma generate`
3. Test connection: `npx prisma db pull`

## Next Steps

### Immediate Tasks

1. **Seed Test Data** - Create sample transactions and payment methods
2. **Test Authentication** - Verify JWT tokens are properly stored and sent
3. **UI Testing** - Navigate through all payment features
4. **Error Scenarios** - Test edge cases (no data, failed requests)

### Future Enhancements

1. **Stripe Integration** - Connect real payment processing
2. **Invoice Downloads** - Implement PDF generation for receipts
3. **Payment Method Management** - Add/remove/edit cards
4. **Refund Requests** - UI for initiating refunds
5. **Payment Reminders** - Email notifications for upcoming charges
6. **Export Functionality** - CSV export of payment history

## Support & Documentation

- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **JWT Authentication:** https://jwt.io/introduction

## File Structure

```
project/
├── app/
│   ├── api/
│   │   └── payments/
│   │       └── route.ts         # Payments API endpoint
│   └── client-dashboard/
│       └── page.tsx              # Frontend UI with payments tab
├── prisma/
│   └── schema.prisma             # Database models
├── src/
│   └── lib/
│       ├── auth.ts               # JWT helpers
│       ├── prisma-server.ts      # Prisma client for API routes
│       └── prisma.ts             # (Deprecated - for frontend only)
└── PAYMENTS_INTEGRATION.md       # This file
```

## Contributors

Generated with Claude Code - Payments Integration
Date: November 24, 2025
