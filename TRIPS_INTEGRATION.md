# My Trips Integration Documentation

## Overview

The "My Trips" tab in the client dashboard has been fully integrated with real backend data. The system displays upcoming and past bookings, manages trip status, and provides comprehensive trip management features.

## Architecture

### Database Layer (Prisma)

**Location:** `prisma/schema.prisma`

**Model:** `Booking` (lines 594-654)

```prisma
model Booking {
  id              String         @id @default(cuid())
  propertyId      String
  guestId         String
  hostId          String

  // Dates
  checkIn         DateTime
  checkOut        DateTime
  numberOfNights  Int

  // Guests
  guests          Int
  adults          Int
  children        Int            @default(0)
  infants         Int            @default(0)

  // Pricing
  nightlyRate     Float
  subtotal        Float
  cleaningFee     Float          @default(0)
  serviceFee      Float          @default(0)
  taxAmount       Float          @default(0)
  totalPrice      Float

  // Platform Commission
  platformCommission Float
  hostEarnings    Float

  // Status
  status          BookingStatus  @default(PENDING)
  paymentStatus   PaymentStatus  @default(PENDING)

  // Guest Details
  specialRequests String?
  arrivalTime     String?

  // Timestamps
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  confirmedAt     DateTime?
  cancelledAt     DateTime?
  completedAt     DateTime?

  // Cancellation
  cancelledBy     String?
  cancellationReason String?

  // Relations
  property        Property       @relation(fields: [propertyId], references: [id])
  guest           User           @relation("GuestBookings", fields: [guestId], references: [id])
  host            User           @relation("HostBookings", fields: [hostId], references: [id])
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
```

### API Layer

**Location:** `app/api/trips/route.ts`

**Authentication:** JWT Bearer token (from localStorage: `auth_token`)

**Request:**
```http
GET /api/trips
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  summary: {
    upcomingCount: number     // Number of upcoming trips
    pastCount: number         // Number of past trips
    activeCount: number       // Number of confirmed trips
    totalSpent: number        // Total money spent on paid trips
  }
  upcoming: [{
    id: string
    propertyId: string
    propertyTitle: string
    propertyPhotos: string[]
    propertyAddress: string
    propertyCity: string
    propertyCountry: string
    checkIn: string (ISO)
    checkOut: string (ISO)
    numberOfNights: number
    guests: number
    adults: number
    children: number
    infants: number
    totalPrice: number
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REJECTED'
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
    specialRequests?: string
    confirmedAt?: string (ISO)
    cancelledAt?: string (ISO)
    cancelledBy?: string
    cancellationReason?: string
    createdAt: string (ISO)
  }]
  past: [{
    // Same structure as upcoming
  }]
}
```

**Data Classification Logic:**

**Upcoming Trips:**
- `checkIn >= today` AND
- `status IN ('PENDING', 'CONFIRMED')`

**Past Trips:**
- `checkOut < today` OR
- `status IN ('COMPLETED', 'CANCELLED', 'REJECTED')`

**Query Details:**
- Includes property details via JOIN
- Ordered by checkIn (upcoming) or checkOut (past)
- Limited to 50 past bookings for performance

### Frontend Layer

**Location:** `app/client-dashboard/page.tsx`

**Features:**

1. **Summary Cards**
   - Upcoming trips count
   - Past trips count
   - Status percentage (active/total)
   - Support contact card

2. **Trip Lists**
   - **Upcoming & Active Section**
     - Property photo
     - Property name and location
     - Check-in and check-out dates
     - Status badge (color-coded)
     - View details button
   - **Past Trips Section**
     - Same format as upcoming
     - Shows completed/cancelled trips

3. **Status Badges**
   - CONFIRMED: Green
   - PENDING: Amber/Yellow
   - COMPLETED: Blue
   - CANCELLED/REJECTED: Rose/Red

4. **Loading & Error States**
   - Loading spinner
   - Error messages with retry
   - Empty state with CTA

5. **Actions**
   - Refresh trips
   - Book new stay
   - View booking details
   - Contact support

**Data Flow:**
```
User clicks "My Trips" tab
  ↓
useEffect triggers fetchTrips()
  ↓
GET /api/trips with Bearer token
  ↓
API validates JWT token
  ↓
API queries bookings (Prisma)
  ├─ upcoming: checkIn >= today
  └─ past: checkOut < today
  ↓
API joins with Property model
  ↓
API returns formatted response
  ↓
Frontend transforms data
  ├─ Combines upcoming + past
  └─ Normalizes to Booking interface
  ↓
UI renders trip cards
```

## API Implementation Details

### Query Logic

```typescript
// Upcoming trips query
prisma.booking.findMany({
  where: {
    guestId: user.userId,
    checkIn: { gte: now },
    status: { in: ['PENDING', 'CONFIRMED'] }
  },
  include: {
    property: {
      select: {
        id, title, photos, address,
        city, state, country
      }
    }
  },
  orderBy: { checkIn: 'asc' }
})

// Past trips query
prisma.booking.findMany({
  where: {
    guestId: user.userId,
    OR: [
      { checkOut: { lt: now } },
      { status: { in: ['COMPLETED', 'CANCELLED', 'REJECTED'] } }
    ]
  },
  // ... same include and orderBy
  take: 50
})
```

### Data Transformation

The API transforms raw Prisma data into a clean response:

```typescript
const formatBooking = (booking: any): BookingItem => {
  // Extract photos from property.photos array
  const photos = Array.isArray(property.photos) ? property.photos : []
  const photoUrls = photos.map(p =>
    typeof p === 'string' ? p : p?.url || ''
  )

  return {
    id: booking.id,
    propertyTitle: property.title || 'Property',
    propertyPhotos: photoUrls,
    propertyAddress: property.address || '',
    // ... other fields
  }
}
```

### Summary Calculation

```typescript
const summary = {
  upcomingCount: upcoming.length,
  pastCount: past.length,
  activeCount: upcoming.filter(b => b.status === 'CONFIRMED').length,
  totalSpent: [...upcoming, ...past]
    .filter(b => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.totalPrice, 0)
}
```

## Frontend Implementation Details

### State Management

```typescript
const [trips, setTrips] = useState<Booking[]>([])
const [tripsLoading, setTripsLoading] = useState(false)
const [tripsError, setTripsError] = useState<string | null>(null)
```

### Fetch Function

```typescript
const fetchTrips = async () => {
  const token = localStorage.getItem('auth_token')
  const response = await fetch('/api/trips', {
    headers: { Authorization: `Bearer ${token}` }
  })

  const data = await response.json()
  const allTrips = [...(data.upcoming || []), ...(data.past || [])]

  // Transform to match UI expectations
  const normalizedTrips = allTrips.map(trip => ({
    id: trip.id,
    property: {
      title: trip.propertyTitle,
      address: `${trip.propertyCity}, ${trip.propertyCountry}`,
      photos: trip.propertyPhotos
    },
    checkIn: trip.checkIn,
    checkOut: trip.checkOut,
    status: trip.status
  }))

  setTrips(normalizedTrips)
}
```

### Filtering Logic

```typescript
const isUpcomingTrip = (trip: Booking) => {
  const checkout = new Date(trip.checkOut)
  const now = new Date()
  return ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(trip.status)
    && checkout >= now
}

const upcomingTrips = trips.filter(isUpcomingTrip)
const pastTrips = trips.filter(trip => !isUpcomingTrip(trip))
```

### Status Styling

```typescript
const tripStatusStyle = (status: string) => {
  const normalized = status?.toUpperCase?.() || ''
  if (normalized === 'CONFIRMED')
    return 'bg-green-50 text-green-700 border-green-100'
  if (normalized === 'PENDING')
    return 'bg-amber-50 text-amber-700 border-amber-100'
  if (normalized === 'COMPLETED')
    return 'bg-blue-50 text-blue-700 border-blue-100'
  if (normalized === 'CANCELLED' || normalized === 'REJECTED')
    return 'bg-rose-50 text-rose-700 border-rose-100'
  return 'bg-gray-50 text-gray-600 border-gray-100'
}
```

## Testing

### 1. Test API Endpoint

**Without Auth (Expected: 401)**
```bash
curl -i http://localhost:3000/api/trips
# Response: {"error":"Authentication required"}
```

**With Auth Token**
```bash
TOKEN="your-jwt-token"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/trips | jq
```

**Expected Response:**
```json
{
  "summary": {
    "upcomingCount": 2,
    "pastCount": 5,
    "activeCount": 1,
    "totalSpent": 2450.00
  },
  "upcoming": [...],
  "past": [...]
}
```

### 2. Test in UI

1. Navigate to http://localhost:3000/client-dashboard
2. Click "My Trips" tab
3. Verify:
   - ✅ Loading state appears
   - ✅ Summary cards display
   - ✅ Upcoming trips section shows
   - ✅ Past trips section shows
   - ✅ Status badges color-coded
   - ✅ Refresh button works
   - ✅ Empty state if no trips

### 3. Seed Test Data

```typescript
// Create test booking
await prisma.booking.create({
  data: {
    propertyId: 'property-id',
    guestId: 'user-id',
    hostId: 'host-id',
    checkIn: new Date('2025-12-01'),
    checkOut: new Date('2025-12-05'),
    numberOfNights: 4,
    guests: 2,
    adults: 2,
    children: 0,
    infants: 0,
    nightlyRate: 150.00,
    subtotal: 600.00,
    cleaningFee: 50.00,
    serviceFee: 75.00,
    taxAmount: 72.50,
    totalPrice: 797.50,
    platformCommission: 119.63,
    hostEarnings: 627.87,
    status: 'CONFIRMED',
    paymentStatus: 'PAID'
  }
})
```

## Features

### ✅ Completed Features

1. **Real-time Data Fetching** - Pulls from database via API
2. **Trip Classification** - Automatically separates upcoming/past
3. **Status Management** - Color-coded status badges
4. **Summary Stats** - Trip counts and spending totals
5. **Error Handling** - Graceful error messages
6. **Loading States** - User-friendly loading indicators
7. **Empty States** - Helpful CTAs when no trips
8. **Refresh Functionality** - Manual data refresh
9. **Responsive Design** - Works on all screen sizes

### 🔄 Planned Enhancements

1. **Trip Cancellation** - Cancel bookings from UI
2. **Modification Requests** - Request date/guest changes
3. **Direct Messaging** - Message host from trip card
4. **Review Prompts** - Prompt to review after checkout
5. **Trip Details Modal** - Full trip information popup
6. **Export/Print** - Download trip itinerary
7. **Calendar View** - Visual timeline of trips
8. **Filters** - Filter by status, date, location

## Integration Summary

| Component | Status | Location |
|-----------|--------|----------|
| Database Model | ✅ Complete | prisma/schema.prisma (lines 594-654) |
| API Endpoint | ✅ Complete | app/api/trips/route.ts |
| Authentication | ✅ Integrated | src/lib/auth.ts |
| Frontend UI | ✅ Connected | app/client-dashboard/page.tsx (lines 783-991) |
| Data Transform | ✅ Working | fetchTrips() function |
| Error Handling | ✅ Implemented | Try/catch with user messages |
| Loading States | ✅ Implemented | tripsLoading state |

## Security

1. **JWT Validation** - All requests require valid token
2. **User Isolation** - Only shows user's own bookings
3. **Status Filtering** - Only appropriate statuses shown
4. **Data Sanitization** - All user input validated
5. **HTTPS Enforced** - Production uses secure connections

## Troubleshooting

### Issue: "Authentication required" error
**Solution:**
1. Verify token exists: `localStorage.getItem('auth_token')`
2. Check token validity (not expired)
3. Ensure Authorization header sent

### Issue: Empty trips list
**Solution:**
1. Check if user has bookings in database
2. Verify guestId matches user.userId
3. Seed test data

### Issue: Trips not updating after booking
**Solution:**
1. Click "Refresh" button
2. Check if booking creation succeeded
3. Verify booking status is PENDING or CONFIRMED

## File Structure

```
project/
├── app/
│   ├── api/
│   │   └── trips/
│   │       └── route.ts           # Trips API endpoint
│   └── client-dashboard/
│       └── page.tsx                # My Trips tab UI
├── prisma/
│   └── schema.prisma               # Booking model
├── src/
│   └── lib/
│       ├── auth.ts                 # JWT authentication
│       └── prisma-server.ts        # Prisma client
└── TRIPS_INTEGRATION.md            # This file
```

## Related Documentation

- [PAYMENTS_INTEGRATION.md](./PAYMENTS_INTEGRATION.md) - Payment system integration
- [Prisma Booking Model](./prisma/schema.prisma#L594-L654)
- [Client Dashboard](./app/client-dashboard/page.tsx)

## Contributors

Generated with Claude Code - Trips Integration
Date: November 24, 2025
