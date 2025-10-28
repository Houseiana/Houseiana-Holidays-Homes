# Backend-Only Data Access Policy

**Last Updated:** October 28, 2025
**Status:** ✅ Implemented and Enforced

---

## 🎯 Overview

This project follows a **strict backend-only data access architecture** where:

- ✅ **Frontend (Next.js):** UI/UX, API calls, client-side logic
- ✅ **Backend (Railway C#):** ALL data operations, business logic, database access
- ❌ **Direct Database Access:** FORBIDDEN in frontend code

---

## 🚫 What NOT to Do

### ❌ Never Access Database Directly

```typescript
// ❌ FORBIDDEN - DO NOT DO THIS
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const users = await prisma.user.findMany();

// ❌ FORBIDDEN - DO NOT DO THIS
import prisma from '@/lib/prisma';
const user = await prisma.user.findUnique({ where: { id } });
```

### ❌ Never Use These Packages in Frontend

- `@prisma/client` - Database ORM (backend only)
- `pg` - PostgreSQL client (backend only)
- Direct SQL queries
- Database connection strings

---

## ✅ What TO Do

### ✅ Always Use Railway API Client

```typescript
// ✅ CORRECT - Use Railway API
import { railwayApi } from '@/lib/railway-api';

// Authentication
const result = await railwayApi.register({
  email: 'user@example.com',
  password: 'password',
  firstName: 'John',
  lastName: 'Doe'
});

// Get data
const properties = await railwayApi.getProperties({
  location: 'New York',
  guests: 2
});

// Create data
const booking = await railwayApi.createBooking({
  propertyId: '123',
  checkIn: '2025-11-01',
  checkOut: '2025-11-05',
  guests: 2
});
```

---

## 📁 Deprecated Files

The following files are **deprecated** and should NOT be used:

### 1. `/lib/prisma.ts`
- **Status:** Deprecated
- **Replacement:** Use `railwayApi` from `/lib/railway-api.ts`
- **Note:** File exports `null` and logs warnings

### 2. `/lib/secure-otp-storage.ts`
- **Status:** Deprecated
- **Replacement:** Use Railway API OTP endpoints
- **Note:** All methods throw errors with migration instructions

### 3. `/prisma/schema.prisma`
- **Status:** Reference only
- **Purpose:** Documentation of database structure
- **Note:** DO NOT run `prisma generate`, `prisma migrate`, etc.

---

## 🔧 Configuration

### Environment Variables

#### `.env` (Local Development)
```bash
# Railway Backend API
NEXT_PUBLIC_API_URL="https://houseianabackend-production.up.railway.app/api/v1.0"
API_URL="https://houseianabackend-production.up.railway.app/api/v1.0"
SOCKET_IO_URL="https://houseianabackend-production.up.railway.app"

# NO DATABASE_URL - Frontend doesn't need it!
```

#### `.env.local` (Local Development with Services)
```bash
# Railway Backend API (same as above)
NEXT_PUBLIC_API_URL="..."
API_URL="..."

# DATABASE_URL is commented out - not used by frontend
# DATABASE_URL="postgresql://..." (Backend only)
```

### Next.js Configuration

`next.config.js` has been updated to remove database packages:

```javascript
experimental: {
  // Only packages used by frontend
  serverComponentsExternalPackages: [
    '@vercel/blob',    // File uploads
    'nodemailer',      // Email (via API routes)
    'twilio',          // SMS (via API routes)
    '@sendgrid/mail'   // Email service
  ]
  // Removed: 'pg', 'bcryptjs' (backend only)
}
```

---

## 📚 Railway API Reference

### Authentication

```typescript
// Register
await railwayApi.register({ email, password, firstName, lastName });

// Login
await railwayApi.login({ email, password });

// Get current user
await railwayApi.getCurrentUser();

// Logout
await railwayApi.logout();
```

### Properties

```typescript
// Get all properties
await railwayApi.getProperties({ location, guests, checkIn, checkOut });

// Get single property
await railwayApi.getProperty(propertyId);

// Create property (host only)
await railwayApi.createProperty(propertyData);

// Update property
await railwayApi.updateProperty(propertyId, updates);

// Delete property
await railwayApi.deleteProperty(propertyId);
```

### Bookings

```typescript
// Get bookings
await railwayApi.getBookings({ role: 'guest', status: 'confirmed' });

// Create booking
await railwayApi.createBooking({
  propertyId,
  checkIn,
  checkOut,
  guests
});

// Update booking
await railwayApi.updateBooking(bookingId, { status: 'confirmed' });
```

### Payments

```typescript
// Create payment intent
await railwayApi.createPaymentIntent(bookingId);

// Confirm payment
await railwayApi.confirmPayment(paymentId);
```

### Messages

```typescript
// Get conversations
await railwayApi.getConversations();

// Get messages
await railwayApi.getMessages(conversationId);

// Send message
await railwayApi.sendMessage({ recipientId, message });
```

---

## 🔍 How to Verify

### Check for Direct Database Access

```bash
# Search for Prisma imports
grep -r "from '@prisma/client'" --include="*.ts" --include="*.tsx"

# Search for prisma usage
grep -r "prisma\." --include="*.ts" --include="*.tsx"

# Should only find deprecated files with warnings
```

### Verify Railway API Usage

```bash
# Search for Railway API usage
grep -r "railwayApi" --include="*.ts" --include="*.tsx"

# Should find many usages across the codebase
```

---

## 🚀 Migration Guide

If you find code using direct database access:

### Before (❌ Direct Database Access)

```typescript
import prisma from '@/lib/prisma';

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id }
  });
}
```

### After (✅ Railway API)

```typescript
import { railwayApi } from '@/lib/railway-api';

export async function getUserById(id: string) {
  const response = await railwayApi.getCurrentUser();
  return response.data;
}
```

---

## 🛡️ Security Benefits

This architecture provides:

1. **Separation of Concerns:** Frontend focuses on UI, backend handles data
2. **Security:** Database credentials never exposed to frontend
3. **Validation:** Backend validates all data before database operations
4. **Rate Limiting:** Backend can enforce rate limits on API calls
5. **Audit Logging:** All data operations logged on backend
6. **Scalability:** Backend can be scaled independently

---

## 📊 API Endpoints

All endpoints are prefixed with: `https://houseianabackend-production.up.railway.app/api/v1.0`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user |
| POST | `/auth/logout` | Logout user |
| GET | `/properties` | List properties |
| GET | `/properties/:id` | Get property details |
| POST | `/properties` | Create property |
| PUT | `/properties/:id` | Update property |
| DELETE | `/properties/:id` | Delete property |
| GET | `/bookings` | List bookings |
| POST | `/bookings` | Create booking |
| PATCH | `/bookings/:id` | Update booking |
| POST | `/payments/create-intent` | Create payment |
| POST | `/payments/:id/confirm` | Confirm payment |
| GET | `/messages/conversations` | List conversations |
| GET | `/messages/conversations/:id/messages` | Get messages |
| POST | `/messages/send` | Send message |

---

## 🔗 Related Documentation

- [VERCEL_RAILWAY_UPDATE_GUIDE.md](./VERCEL_RAILWAY_UPDATE_GUIDE.md) - Deployment configuration
- [lib/railway-api.ts](./lib/railway-api.ts) - API client source code
- [prisma/schema.prisma](./prisma/schema.prisma) - Database schema (reference only)

---

## ✅ Checklist

- [x] Removed Neon database connection from `.env`
- [x] Updated `.env.local` with Railway API URLs
- [x] Commented out `DATABASE_URL` in `.env.local`
- [x] Deprecated `/lib/prisma.ts` with warnings
- [x] Deprecated `/lib/secure-otp-storage.ts` with errors
- [x] Updated `prisma/schema.prisma` with reference-only notice
- [x] Removed `pg` and `bcryptjs` from `next.config.js`
- [x] Created comprehensive Railway API client
- [x] Documented migration strategy

---

## 🎉 Result

✅ **Frontend is now 100% API-driven**
✅ **No direct database access**
✅ **All data operations go through Railway Backend**
✅ **Secure, scalable, and maintainable architecture**

---

**Questions?** Check [lib/railway-api.ts](./lib/railway-api.ts:1) for implementation details.
