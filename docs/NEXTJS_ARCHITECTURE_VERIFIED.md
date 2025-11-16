# ✅ Next.js Full-Stack Architecture - VERIFIED

## Overview

Your Houseiana project is a **complete Next.js full-stack application**. There are NO separate frontend or backend servers - everything runs within the Next.js framework.

---

## 🏗️ Architecture Breakdown

### 1. Frontend (Next.js App Router)
**Framework**: Next.js 14.2.5 with React 18.3.1

**Technology Stack**:
- React 18.3.1 - UI components
- TypeScript - Type safety
- Tailwind CSS - Styling
- Lucide Icons - UI icons
- Client Components ('use client') - Interactive UI

**Key Frontend Files**:
- [components/layout/header.tsx](components/layout/header.tsx) - Navigation with auth state
- [components/auth/login-modal.tsx](components/auth/login-modal.tsx) - Login UI
- [components/auth/signup-modal.tsx](components/auth/signup-modal.tsx) - Signup UI
- [components/auth/otp-login.tsx](components/auth/otp-login.tsx) - OTP login UI
- [app/page.tsx](app/page.tsx) - Homepage
- [app/dashboard/page.tsx](app/dashboard/page.tsx) - User dashboard

**How Frontend Connects to Backend**:
```typescript
// Frontend makes fetch() calls to Next.js API routes
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const result = await response.json();
```

---

### 2. Backend (Next.js API Routes)
**Framework**: Next.js API Routes (serverless functions)

**Technology Stack**:
- Next.js API Routes - Backend endpoints
- JWT (jsonwebtoken) - Authentication tokens
- bcryptjs - Password hashing
- Twilio SDK - SMS/WhatsApp OTP
- SendGrid - Email OTP

**API Endpoints**:

#### Authentication APIs:
- `POST /api/auth/login` - Email/Phone + Password login
  - File: [app/api/auth/login/route.ts](app/api/auth/login/route.ts)
  - Returns: JWT token + user data

- `POST /api/auth/otp-login` - OTP-based login
  - File: [app/api/auth/otp-login/route.ts](app/api/auth/otp-login/route.ts)
  - Returns: JWT token after OTP verification

- `POST /api/auth/otp-signup` - Signup with OTP verification
  - File: [app/api/auth/otp-signup/route.ts](app/api/auth/otp-signup/route.ts)
  - Returns: JWT token + creates user in database

#### OTP Service APIs:
- `POST /api/otp/send-twilio` - Send SMS/WhatsApp OTP
- `POST /api/otp/send-email` - Send Email OTP
- `POST /api/otp/verify-twilio` - Verify Twilio OTP
- `POST /api/otp/verify-email` - Verify Email OTP

**How Backend Connects to Database**:
```typescript
// API routes use Prisma Client to query database
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // Query Neon PostgreSQL via Prisma
  const user = await prisma.user.findUnique({
    where: { email }
  });

  // Hash password with bcrypt
  const isValid = await comparePasswords(password, user.password);

  // Generate JWT token
  const token = generateToken({ userId: user.id });

  return NextResponse.json({ token, user });
}
```

---

### 3. Database (Neon PostgreSQL + Prisma ORM)
**Database**: Neon PostgreSQL (Serverless)

**ORM**: Prisma 6.18.0

**Connection**:
```
Next.js API Routes → Prisma Client → Neon PostgreSQL (via SSL)
```

**Database Schema** ([prisma/schema.prisma](prisma/schema.prisma)):
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id               String    @id @default(cuid())
  phone            String?   @unique
  email            String?   @unique
  firstName        String?
  lastName         String?
  password         String
  phoneVerified    Boolean   @default(false)
  emailVerified    Boolean   @default(false)
  isHost           Boolean   @default(false)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  sessions         Session[]
  referrals        Referral[]
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  token        String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id])
}

model OtpCode {
  id           String   @id @default(cuid())
  phoneOrEmail String
  code         String
  expiresAt    DateTime
  verified     Boolean  @default(false)
  createdAt    DateTime @default(now())
}
```

**Connection Configuration** (.env):
```env
DATABASE_URL="postgresql://..."  # Neon connection string with SSL
DIRECT_URL="postgresql://..."    # Direct connection for migrations
```

**Prisma Client Initialization** ([lib/prisma.ts](lib/prisma.ts)):
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

## 🔄 Data Flow Architecture

### User Login Flow:
```
1. User enters credentials in LoginModal (Frontend)
   ↓
2. React component calls: fetch('/api/auth/login')
   ↓
3. Next.js API Route: app/api/auth/login/route.ts
   ↓
4. Prisma Client queries: prisma.user.findUnique({ where: { email } })
   ↓
5. Neon PostgreSQL returns user data
   ↓
6. bcrypt verifies password
   ↓
7. JWT token generated
   ↓
8. Token stored in: localStorage + HTTP cookies
   ↓
9. User redirected to /dashboard
```

### Protected Route Access:
```
1. User navigates to /dashboard
   ↓
2. Next.js Middleware (middleware.ts) intercepts request
   ↓
3. Middleware checks: req.cookies.get('auth_token')
   ↓
4. If token exists: Allow access
   ↓
5. If no token: Redirect to homepage
```

### OTP Signup Flow:
```
1. User enters phone/email in SignupModal (Frontend)
   ↓
2. Component calls: fetch('/api/otp/send-twilio')
   ↓
3. API route calls Twilio Verify API
   ↓
4. SMS/WhatsApp OTP sent to user
   ↓
5. User enters OTP code
   ↓
6. Component calls: fetch('/api/otp/verify-twilio')
   ↓
7. API route verifies OTP with Twilio
   ↓
8. User enters password
   ↓
9. Component calls: fetch('/api/auth/otp-signup')
   ↓
10. API route: prisma.user.create({ data: { phone, password } })
   ↓
11. Neon PostgreSQL stores new user
   ↓
12. JWT token generated and returned
   ↓
13. User redirected to /dashboard
```

---

## 📁 Project Structure

```
houseiana-nextjs/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API Routes
│   │   ├── auth/
│   │   │   ├── login/route.ts    # Login API
│   │   │   ├── otp-login/route.ts
│   │   │   └── otp-signup/route.ts
│   │   └── otp/
│   │       ├── send-twilio/route.ts
│   │       ├── verify-twilio/route.ts
│   │       ├── send-email/route.ts
│   │       └── verify-email/route.ts
│   ├── dashboard/                # Protected pages
│   ├── page.tsx                  # Homepage
│   └── layout.tsx                # Root layout
│
├── components/                   # React Components
│   ├── auth/
│   │   ├── login-modal.tsx       # Login UI
│   │   ├── signup-modal.tsx      # Signup UI
│   │   └── otp-login.tsx         # OTP login UI
│   └── layout/
│       └── header.tsx            # Navigation
│
├── lib/                          # Utility functions
│   ├── prisma.ts                 # Prisma Client
│   ├── auth.ts                   # JWT + bcrypt helpers
│   └── twilio.ts                 # Twilio integration
│
├── prisma/
│   └── schema.prisma             # Database schema
│
├── middleware.ts                 # Route protection
├── .env                          # Environment variables
└── package.json                  # Dependencies
```

---

## 🔐 Authentication System

### Token Storage Strategy:
- **localStorage**: `auth_token` + `auth_user` (for client-side state)
- **HTTP Cookies**: `auth_token` (for middleware access)

### Why Both?
1. **localStorage**: React components can read auth state instantly
2. **Cookies**: Middleware runs on the server and can only access cookies

### Token Flow:
```typescript
// After successful login (in login-modal.tsx)
localStorage.setItem('auth_token', result.token);
localStorage.setItem('auth_user', JSON.stringify(result.user));

// Set cookie for middleware
document.cookie = `auth_token=${result.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
```

### Middleware Protection:
```typescript
// middleware.ts
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedPaths = ['/dashboard', '/host-dashboard', '/client-dashboard'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      const url = new URL('/', req.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
```

---

## 🌐 External Services Integration

### 1. Neon PostgreSQL (Database)
**Connection**: SSL required, serverless
**URL**: Environment variable `DATABASE_URL`
**Region**: Auto-scaled globally

### 2. Twilio (SMS/WhatsApp OTP)
**Service**: Twilio Verify API
**Environment Variables**:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VERIFY_SERVICE_SID`

### 3. SendGrid (Email OTP)
**Service**: SendGrid Email API
**Environment Variable**: `SENDGRID_API_KEY`

---

## ✅ Verification Checklist

- [x] **Frontend**: 100% Next.js React components
- [x] **Backend**: 100% Next.js API Routes (no Express/Node server)
- [x] **Database**: Neon PostgreSQL connected via Prisma
- [x] **Authentication**: Custom JWT system (no NextAuth in auth flow)
- [x] **OTP Services**: Twilio + SendGrid integrated
- [x] **Route Protection**: Next.js middleware with JWT cookies
- [x] **Single Server**: Everything runs on `npm run dev` (localhost:3001)

---

## 🚀 How Everything Connects

### Single Command Startup:
```bash
npm run dev
```

This single command starts:
1. ✅ Next.js development server (Frontend + Backend)
2. ✅ API routes available at /api/*
3. ✅ Prisma connects to Neon PostgreSQL
4. ✅ Middleware protects routes
5. ✅ All components render

### No Separate Servers Needed:
- ❌ No separate Express server
- ❌ No separate React app
- ❌ No separate database server (Neon is serverless)
- ✅ ONE Next.js application handles everything

---

## 📊 Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 14.2.5 | Full-stack framework |
| **Frontend** | React | 18.3.1 | UI components |
| **Language** | TypeScript | 5.6.3 | Type safety |
| **Styling** | Tailwind CSS | 3.4.1 | CSS framework |
| **Backend** | Next.js API Routes | 14.2.5 | REST APIs |
| **Database** | Neon PostgreSQL | Cloud | Serverless database |
| **ORM** | Prisma | 6.18.0 | Database queries |
| **Auth Tokens** | JWT | 9.0.2 | Authentication |
| **Passwords** | bcryptjs | 3.0.2 | Password hashing |
| **SMS/WhatsApp** | Twilio | 5.10.3 | OTP delivery |
| **Email** | SendGrid | 8.1.6 | Email OTP |

---

## 🎯 Conclusion

Your Houseiana project is a **pure Next.js full-stack application**:

✅ **Frontend**: Next.js App Router with React components
✅ **Backend**: Next.js API Routes (serverless functions)
✅ **Database**: Neon PostgreSQL via Prisma ORM
✅ **Authentication**: Custom JWT system
✅ **OTP Services**: Twilio + SendGrid integrated

**Everything is connected and working within the Next.js framework.**

No separate servers, no separate backends - just one unified Next.js application running at **http://localhost:3001**.
