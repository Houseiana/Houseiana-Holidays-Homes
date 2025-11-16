# 🏗️ Houseiana Project - Complete Structure & Database Schema

## 📊 Database Schema (PostgreSQL via Neon)

### Overview
- **Database Provider**: PostgreSQL (Neon Serverless)
- **ORM**: Prisma 6.18.0
- **Location**: `prisma/schema.prisma`

---

## 📋 Database Models

### 1. User Model
**Table**: `users`

```prisma
model User {
  id                       String      @id @default(cuid())
  firstName                String
  lastName                 String
  email                    String?     @unique
  password                 String
  phone                    String?
  countryCode              String?
  userType                 UserType    @default(GUEST)
  profilePhoto             String?
  birthDate                String?
  isPhoneVerified          Boolean     @default(false)
  isHost                   Boolean     @default(false)
  memberSince              DateTime    @default(now())
  emailVerified            Boolean     @default(false)
  phoneVerified            Boolean     @default(false)
  travelPoints             Int         @default(0)
  loyaltyTier              String      @default("Bronze")
  idNumber                 String?
  idCopy                   String?
  kycCompleted             Boolean     @default(false)
  avatar                   String?
  passwordResetToken       String?
  passwordResetExpires     DateTime?
  emailVerificationToken   String?
  emailVerificationExpires DateTime?
  failedLoginAttempts      Int         @default(0)
  accountLockedUntil       DateTime?
  lastLoginAt              DateTime?
  createdAt                DateTime    @default(now())
  updatedAt                DateTime    @updatedAt

  // Relations
  accounts                 Account[]
  otpCodes                 OtpCode[]
  referrals                Referral[]
  sessions                 Session[]
  properties               Property[]   // Host's properties
  bookings                 Booking[]    // Guest's bookings
  reviews                  Review[]     // Reviews written by user
  favorites                Favorite[]   // User's wishlist
}
```

**Key Fields**:
- `userType`: GUEST | HOST
- `isHost`: Boolean flag for host capabilities
- `kycCompleted`: KYC verification status
- `travelPoints`: Loyalty program points
- `loyaltyTier`: Bronze, Silver, Gold, Platinum

---

### 2. Property Model
**Table**: `properties`

```prisma
model Property {
  id              String           @id @default(cuid())
  hostId          String
  title           String
  description     String           @db.Text
  propertyType    PropertyType
  roomType        RoomType

  // Location
  country         String
  city            String
  state           String?
  address         String
  zipCode         String?
  latitude        Float?
  longitude       Float?

  // Capacity
  guests          Int
  bedrooms        Int
  beds            Int
  bathrooms       Float

  // Pricing
  pricePerNight   Float
  cleaningFee     Float?           @default(0)
  serviceFee      Float?           @default(0)
  weeklyDiscount  Float?           @default(0)
  monthlyDiscount Float?           @default(0)

  // Amenities (JSON array of strings)
  amenities       Json             @default("[]")

  // Photos (JSON array of photo URLs)
  photos          Json             @default("[]")
  coverPhoto      String?

  // House Rules
  checkInTime     String?          @default("15:00")
  checkOutTime    String?          @default("11:00")
  minNights       Int              @default(1)
  maxNights       Int?
  instantBook     Boolean          @default(false)
  allowPets       Boolean          @default(false)
  allowSmoking    Boolean          @default(false)
  allowEvents     Boolean          @default(false)

  // Status
  status          PropertyStatus   @default(DRAFT)
  isActive        Boolean          @default(true)

  // Stats
  viewCount       Int              @default(0)
  bookingCount    Int              @default(0)
  averageRating   Float?           @default(0)

  // Timestamps
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  publishedAt     DateTime?

  // Relations
  host            User             @relation(fields: [hostId], references: [id], onDelete: Cascade)
  bookings        Booking[]
  reviews         Review[]
  favorites       Favorite[]

  @@index([hostId])
  @@index([city])
  @@index([propertyType])
  @@index([status])
}
```

**Key Fields**:
- `propertyType`: HOUSE, APARTMENT, VILLA, CONDO, TOWNHOUSE, etc.
- `roomType`: ENTIRE_PLACE, PRIVATE_ROOM, SHARED_ROOM
- `status`: DRAFT, PENDING_REVIEW, PUBLISHED, UNLISTED, SUSPENDED
- `amenities`: JSON array (wifi, pool, parking, gym, etc.)
- `photos`: JSON array of image URLs

---

### 3. Booking Model
**Table**: `bookings`

```prisma
model Booking {
  id              String         @id @default(cuid())
  propertyId      String
  guestId         String

  // Dates
  checkIn         DateTime
  checkOut        DateTime

  // Pricing
  nightlyRate     Float
  numberOfNights  Int
  subtotal        Float
  cleaningFee     Float          @default(0)
  serviceFee      Float          @default(0)
  totalPrice      Float

  // Guest Info
  guests          Int

  // Status
  status          BookingStatus  @default(PENDING)

  // Payment
  paymentStatus   PaymentStatus  @default(PENDING)
  paymentMethod   String?
  transactionId   String?

  // Timestamps
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  confirmedAt     DateTime?
  cancelledAt     DateTime?

  // Relations
  property        Property       @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  guest           User           @relation(fields: [guestId], references: [id], onDelete: Cascade)

  @@index([propertyId])
  @@index([guestId])
  @@index([status])
}
```

**Key Fields**:
- `status`: PENDING, CONFIRMED, CANCELLED, COMPLETED, REJECTED
- `paymentStatus`: PENDING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED

---

### 4. Review Model
**Table**: `reviews`

```prisma
model Review {
  id              String    @id @default(cuid())
  propertyId      String
  userId          String
  bookingId       String?

  // Ratings (1-5 scale)
  overallRating   Float
  cleanlinessRating Float?
  accuracyRating  Float?
  checkInRating   Float?
  communicationRating Float?
  locationRating  Float?
  valueRating     Float?

  // Content
  comment         String?   @db.Text

  // Host Response
  hostResponse    String?   @db.Text
  hostRespondedAt DateTime?

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  property        Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([propertyId])
  @@index([userId])
}
```

---

### 5. Favorite Model (Wishlist)
**Table**: `favorites`

```prisma
model Favorite {
  id         String   @id @default(cuid())
  userId     String
  propertyId String
  createdAt  DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@unique([userId, propertyId])
  @@index([userId])
}
```

---

### 6. Session Model (JWT Authentication)
**Table**: `sessions`

```prisma
model Session {
  id           String   @id @default(cuid())
  userId       String
  token        String   @unique
  refreshToken String?  @unique
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

---

### 7. OtpCode Model
**Table**: `otp_codes`

```prisma
model OtpCode {
  id        String   @id @default(cuid())
  userId    String?
  phone     String?
  email     String?
  code      String
  type      OtpType
  expiresAt DateTime
  verified  Boolean  @default(false)
  attempts  Int      @default(0)
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**OTP Types**:
- PHONE_VERIFICATION
- EMAIL_VERIFICATION
- LOGIN
- PASSWORD_RESET

---

### 8. Referral Model
**Table**: `referrals`

```prisma
model Referral {
  id        String   @id @default(cuid())
  userId    String
  code      String   @unique
  usedBy    String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

### 9. Account Model (OAuth)
**Table**: `accounts`

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

---

## 📊 Database Enums

```prisma
enum UserType {
  HOST
  GUEST
}

enum PropertyType {
  HOUSE
  APARTMENT
  VILLA
  CONDO
  TOWNHOUSE
  GUESTHOUSE
  HOTEL
  CABIN
  BUNGALOW
  STUDIO
  LOFT
  OTHER
}

enum RoomType {
  ENTIRE_PLACE
  PRIVATE_ROOM
  SHARED_ROOM
}

enum PropertyStatus {
  DRAFT
  PENDING_REVIEW
  PUBLISHED
  UNLISTED
  SUSPENDED
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  REJECTED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

enum OtpType {
  PHONE_VERIFICATION
  EMAIL_VERIFICATION
  LOGIN
  PASSWORD_RESET
}
```

---

## 📁 Project Structure

```
houseiana-nextjs/
│
├── app/                                    # Next.js App Router
│   ├── page.tsx                           # Homepage
│   ├── layout.tsx                         # Root layout
│   │
│   ├── api/                               # API Routes (Backend)
│   │   ├── auth/
│   │   │   ├── login/route.ts            # POST - User login (JWT)
│   │   │   ├── signup/route.ts           # POST - User signup
│   │   │   ├── logout/route.ts           # POST - User logout
│   │   │   ├── verify-otp/route.ts       # POST - OTP verification
│   │   │   └── send-otp/route.ts         # POST - Send OTP (SMS/Email)
│   │   │
│   │   ├── properties/
│   │   │   └── route.ts                  # GET, POST, PUT, DELETE - Property CRUD
│   │   │
│   │   ├── bookings/
│   │   │   └── route.ts                  # Booking management
│   │   │
│   │   ├── profile/
│   │   │   └── upload-photo/route.ts     # Photo upload
│   │   │
│   │   └── users/
│   │       └── route.ts                  # User management
│   │
│   ├── dashboard/
│   │   └── page.tsx                       # Unified dashboard (Guest/Host toggle)
│   │
│   ├── host-dashboard/
│   │   ├── page.tsx                       # Host dashboard
│   │   └── add-listing/
│   │       └── page.tsx                   # 8-step property listing wizard
│   │
│   ├── client-dashboard/
│   │   └── page.tsx                       # Guest/Client dashboard
│   │
│   ├── settings/
│   │   └── page.tsx                       # User settings (Profile, Security, Notifications, Privacy, Preferences)
│   │
│   ├── discover/
│   │   └── page.tsx                       # Browse properties
│   │
│   ├── property/
│   │   └── [id]/
│   │       └── page.tsx                   # Property details
│   │
│   ├── booking/
│   │   ├── confirm/page.tsx              # Booking confirmation
│   │   └── success/page.tsx              # Booking success
│   │
│   ├── my-trips/
│   │   └── page.tsx                       # User bookings
│   │
│   ├── saved-properties/
│   │   └── page.tsx                       # Wishlist/Favorites
│   │
│   ├── messages-inbox/
│   │   └── page.tsx                       # Messaging system
│   │
│   ├── become-host/
│   │   └── page.tsx                       # Host onboarding
│   │
│   ├── help/
│   │   └── page.tsx                       # Help center
│   │
│   ├── contact-support/
│   │   └── page.tsx                       # Support page
│   │
│   └── unauthorized/
│       └── page.tsx                       # Access denied page
│
├── components/                             # React Components
│   ├── layout/
│   │   ├── header.tsx                    # Main navigation header (JWT auth)
│   │   └── footer.tsx                    # Footer
│   │
│   ├── auth/
│   │   ├── login-modal.tsx               # Login modal (JWT)
│   │   └── signup-modal.tsx              # Signup modal
│   │
│   ├── dashboard/
│   │   ├── host-dashboard-content.tsx    # Host dashboard content
│   │   └── client-dashboard-content.tsx  # Guest dashboard content
│   │
│   └── KYCModal.tsx                       # KYC verification modal
│
├── lib/                                    # Utilities & Configuration
│   ├── stores/
│   │   └── auth-store.ts                 # Zustand auth state management
│   │
│   ├── prisma.ts                         # Prisma client instance
│   └── db.ts                             # Database utilities
│
├── prisma/
│   ├── schema.prisma                     # Database schema (9 models)
│   └── migrations/                       # Database migrations
│
├── middleware.ts                          # Next.js middleware (JWT route protection)
│
├── .env                                   # Environment variables
│   ├── DATABASE_URL                      # Neon PostgreSQL connection
│   ├── DIRECT_URL                        # Direct database connection
│   ├── JWT_SECRET                        # JWT signing secret
│   ├── TWILIO_*                          # SMS OTP (Twilio)
│   └── SENDGRID_*                        # Email OTP (SendGrid)
│
└── public/                                # Static assets
    └── images/
```

---

## 🔗 Database Relationships

### User Relationships:
```
User
├── 1:N → Properties (as host)
├── 1:N → Bookings (as guest)
├── 1:N → Reviews (as reviewer)
├── 1:N → Favorites (wishlist)
├── 1:N → Sessions (auth sessions)
├── 1:N → OtpCodes (verification codes)
├── 1:N → Referrals
└── 1:N → Accounts (OAuth)
```

### Property Relationships:
```
Property
├── N:1 → User (host)
├── 1:N → Bookings
├── 1:N → Reviews
└── 1:N → Favorites
```

### Booking Relationships:
```
Booking
├── N:1 → Property
└── N:1 → User (guest)
```

### Review Relationships:
```
Review
├── N:1 → Property
└── N:1 → User (reviewer)
```

### Favorite Relationships:
```
Favorite
├── N:1 → User
└── N:1 → Property

@@unique([userId, propertyId])  # Prevents duplicate favorites
```

---

## 🛠️ Technology Stack

### Frontend:
- **Framework**: Next.js 14.2.5 (App Router)
- **UI Library**: React 18.3.1
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand (auth store)
- **Forms**: React Hook Form (implied)

### Backend:
- **Runtime**: Next.js API Routes (serverless)
- **Database**: PostgreSQL (Neon - serverless)
- **ORM**: Prisma 6.18.0
- **Authentication**: JWT (JSON Web Tokens)
- **OTP**: Twilio (SMS) + SendGrid (Email)

### Authentication Flow:
```
1. User Login/Signup
   ↓
2. Backend validates credentials
   ↓
3. JWT token generated (7-day expiration)
   ↓
4. Token stored in:
   - localStorage: 'auth_token'
   - HTTP Cookie: 'auth_token' (for middleware)
   - localStorage: 'auth_user' (user data)
   ↓
5. Protected routes check JWT via middleware
   ↓
6. API routes verify JWT on each request
```

---

## 📊 Key Features by Page

### Homepage (`/`)
- Property search
- Featured listings
- Categories
- Auth modals (Login/Signup)

### Dashboard (`/dashboard`)
- **Unified**: Toggle between Guest/Host mode
- **Guest Mode**: Bookings, wishlist, messages
- **Host Mode**: Properties, analytics, bookings

### Host Dashboard (`/host-dashboard`)
- Property management
- Booking requests
- Revenue analytics
- Calendar availability

### Add Listing (`/host-dashboard/add-listing`)
- 8-step wizard:
  1. Property Type
  2. Location (Qatar zones/districts)
  3. Property Details
  4. Amenities (20 options)
  5. Photos (upload UI)
  6. Pricing
  7. House Rules
  8. Review & Publish

### Settings (`/settings`)
- Profile management
- Password change
- Notification preferences
- Privacy settings
- Language/Currency/Timezone

---

## 🔐 Security Features

1. **JWT Authentication**: 7-day token expiration
2. **Password Hashing**: bcrypt (10 rounds)
3. **OTP Verification**: SMS + Email
4. **Rate Limiting**: Failed login attempts tracking
5. **Account Locking**: After multiple failed attempts
6. **SQL Injection Protection**: Prisma ORM
7. **XSS Protection**: React auto-escaping
8. **CSRF Protection**: HTTP-only cookies
9. **Middleware**: Route protection before page load

---

## 📈 Database Indexes

**Optimized queries for**:
- User lookup by email
- Properties by host, city, type, status
- Bookings by property, guest, status
- Reviews by property, user
- Favorites by user
- Sessions by token
- Referrals by code

---

## 🚀 API Endpoints Summary

### Authentication:
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP

### Properties:
- `GET /api/properties` - List properties (with filters)
- `POST /api/properties` - Create property (auth required)
- `PUT /api/properties` - Update property (auth required)
- `DELETE /api/properties` - Delete property (auth required)

### Users:
- `GET /api/users` - Get user info
- `PUT /api/users` - Update user profile
- `POST /api/profile/upload-photo` - Upload profile photo

---

## 📝 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host/database?sslmode=require"

# Authentication
JWT_SECRET="your-secret-key-change-in-production"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Email (SendGrid)
SENDGRID_API_KEY="your-sendgrid-key"
SENDGRID_FROM_EMAIL="noreply@houseiana.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NODE_ENV="development"
```

---

## 📊 Database Statistics

**Total Models**: 9
- User
- Property
- Booking
- Review
- Favorite
- Session
- OtpCode
- Referral
- Account

**Total Enums**: 7
- UserType (2 values)
- PropertyType (12 values)
- RoomType (3 values)
- PropertyStatus (5 values)
- BookingStatus (5 values)
- PaymentStatus (5 values)
- OtpType (4 values)

**Total Relationships**: 15+

---

## 🎯 Quick Commands

```bash
# Development
npm run dev                    # Start dev server (localhost:3001)

# Database
npx prisma studio              # Open Prisma Studio (localhost:5555)
npx prisma db push             # Push schema to database
npx prisma migrate dev         # Create migration
npx prisma generate            # Regenerate Prisma Client

# Production
npm run build                  # Build for production
npm start                      # Start production server
```

---

## 📚 Related Documentation

- [AUTHENTICATION_FIXED_FINAL.md](AUTHENTICATION_FIXED_FINAL.md) - JWT auth system
- [DASHBOARDS_FIXED.md](DASHBOARDS_FIXED.md) - Dashboard fixes
- [PROPERTY_LISTING_SYSTEM.md](PROPERTY_LISTING_SYSTEM.md) - Property listing system
- [NEXTJS_ARCHITECTURE_VERIFIED.md](NEXTJS_ARCHITECTURE_VERIFIED.md) - Architecture overview
- [PROJECT_PAGES_STATUS.md](PROJECT_PAGES_STATUS.md) - All pages status

---

**Last Updated**: 2025-11-14
**Database Schema Version**: 1.0
**Total Tables**: 9
**Total Pages**: 20+
