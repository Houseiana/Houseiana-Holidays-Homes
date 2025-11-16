# OOP Architecture Implementation Guide

## Overview

This guide explains how to use the new Object-Oriented Programming (OOP) architecture that has been implemented in your Houseiana application. The architecture follows Clean Architecture principles with Domain-Driven Design (DDD).

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                      │
│          (API Routes, React Components)                  │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│               Application Layer                          │
│        (Services: BookingService, etc.)                  │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│                 Domain Layer                             │
│  (Entities, Value Objects, Repository Interfaces)        │
└─────────────────────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│             Infrastructure Layer                         │
│    (Prisma Repositories, Mappers, DI Container)          │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
src/
├── domain/                    # Domain Layer (Core Business Logic)
│   ├── entities/             # Domain Entities with rich behavior
│   │   ├── BaseEntity.ts     # Abstract base class
│   │   ├── Booking.ts        # Booking entity with state machine
│   │   ├── Property.ts       # Property entity
│   │   ├── User.ts           # User entity with roles
│   │   └── index.ts
│   ├── value-objects/        # Immutable value objects
│   │   ├── Money.ts          # Currency handling
│   │   ├── Email.ts          # Email validation
│   │   ├── PhoneNumber.ts    # Phone number handling
│   │   ├── DateRange.ts      # Date range logic
│   │   ├── Address.ts        # Address with geocoding
│   │   └── index.ts
│   └── repositories/         # Repository interfaces (contracts)
│       ├── IBookingRepository.ts
│       ├── IPropertyRepository.ts
│       ├── IUserRepository.ts
│       └── index.ts
│
├── application/              # Application Layer (Use Cases)
│   └── services/
│       ├── BookingService.ts # Booking business logic
│       └── ...               # Other services
│
├── infrastructure/           # Infrastructure Layer (Implementation Details)
│   ├── repositories/        # Concrete Prisma implementations
│   │   ├── PrismaBookingRepository.ts
│   │   └── ...
│   ├── mappers/             # Convert between Prisma and Domain
│   │   ├── BookingMapper.ts
│   │   └── ...
│   └── di/                  # Dependency Injection
│       └── Container.ts     # Service container
│
└── app/
    └── api/
        └── v2/              # New API routes using OOP
            └── bookings/
                ├── route.ts      # GET, POST /api/v2/bookings
                └── [id]/
                    └── route.ts  # GET, PATCH /api/v2/bookings/[id]
```

## How to Use the New Architecture

### 1. Creating a New Booking (API Route)

```typescript
// src/app/api/v2/bookings/route.ts
import { getBookingService } from '@/infrastructure/di/Container';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Get service from DI container
  const bookingService = getBookingService();

  // Service handles ALL business logic
  const booking = await bookingService.createBooking({
    propertyId: body.propertyId,
    guestId: body.guestId,
    startDate: body.startDate,
    endDate: body.endDate,
    guestCount: body.guestCount,
  });

  return NextResponse.json({
    success: true,
    data: booking.toJSON(), // Entity converts itself to JSON
  });
}
```

### 2. Using Services in React Components

```typescript
// Example: src/components/BookingForm.tsx
'use client';

import { useState } from 'react';

export function BookingForm({ propertyId, guestId }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);

    try {
      // Call the v2 API that uses OOP architecture
      const response = await fetch('/api/v2/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          guestId,
          startDate: formData.checkIn,
          endDate: formData.checkOut,
          guestCount: formData.guests,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Booking created successfully
        console.log('Booking:', result.data);
      } else {
        // Business logic error (e.g., "Property not available")
        alert(result.error);
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

### 3. Working with Domain Entities Directly (Server-Side)

```typescript
// In a Server Component or API route
import { Booking } from '@/domain/entities/Booking';
import { Money } from '@/domain/value-objects/Money';
import { DateRange } from '@/domain/value-objects/DateRange';

// Create value objects
const dateRange = DateRange.create('2025-12-01', '2025-12-05');
const price = Money.create(500, 'QAR');

// Create booking entity
const booking = Booking.create({
  propertyId: 'prop_123',
  guestId: 'user_456',
  hostId: 'user_789',
  dateRange,
  pricePerNight: price,
  guestCount: 2,
  cancellationPolicy: CancellationPolicy.MODERATE,
});

// Use business logic methods
console.log(booking.getSummary()); // "4 nights for 2 guest(s) - QAR 2,000.00"
console.log(booking.canBeCancelled()); // true

// Cancel booking
const { refundAmount, refundPercentage } = booking.cancel(
  'Change of plans',
  'guest'
);
console.log(`Refund: ${refundAmount.format()} (${refundPercentage}%)`);
```

## Key Concepts

### Value Objects

Value objects are immutable and defined by their values (not identity):

```typescript
const price1 = Money.create(100, 'QAR');
const price2 = Money.create(50, 'QAR');
const total = price1.add(price2); // Returns NEW Money instance (QAR 150)

const email = Email.create('user@example.com');
console.log(email.domain); // "example.com"
```

### Entities

Entities have identity and lifecycle:

```typescript
const booking = await bookingService.getBookingById('booking_123');

// Business logic in entity methods
booking.confirm();         // State: PENDING → CONFIRMED
booking.complete();        // State: CONFIRMED → COMPLETED

// Validation happens automatically
booking.validate(); // Throws error if booking is invalid
```

### Repositories

Repositories abstract data access:

```typescript
// Instead of direct Prisma calls:
// ❌ const bookings = await prisma.booking.findMany({ where: { guestId } });

// Use repository:
// ✅ const bookings = await bookingRepository.findByGuestId(guestId);
```

### Services

Services orchestrate business logic:

```typescript
// Service handles complex workflows
const booking = await bookingService.createBooking(dto);

// Service coordinates:
// 1. Validate guest exists and can book
// 2. Validate property exists and is available
// 3. Check date availability
// 4. Calculate pricing
// 5. Create booking entity
// 6. Save to database
```

## Migration Strategy

### Gradual Migration Approach

You don't need to migrate everything at once. Follow this approach:

#### Phase 1: New Features (Current)
- All NEW features should use the OOP architecture
- Use `/api/v2/*` routes for new endpoints
- Example: New booking features, property management

#### Phase 2: Critical Paths
- Migrate high-value, frequently-used features
- Example: Booking workflow, payment processing
- Keep old endpoints running while testing

#### Phase 3: Complete Migration
- Migrate remaining features
- Deprecate old `/api/*` routes
- Update all components to use v2 APIs

### Example Migration

**Before (Old Way):**
```typescript
// src/app/api/bookings/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const prisma = new PrismaClient();

  // Business logic mixed with data access
  const property = await prisma.property.findUnique({
    where: { id: body.propertyId }
  });

  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  // ... more database calls and logic mixed together
}
```

**After (New Way):**
```typescript
// src/app/api/v2/bookings/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const bookingService = getBookingService(); // DI container

  // Service handles ALL business logic
  const booking = await bookingService.createBooking(body);

  return NextResponse.json({ data: booking.toJSON() });
}
```

## Testing

The OOP architecture makes testing much easier:

```typescript
// Mock repositories for testing
const mockBookingRepository: IBookingRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  // ... other methods
};

// Test service with mocked dependencies
const bookingService = new BookingService(
  mockBookingRepository,
  mockPropertyRepository,
  mockUserRepository
);

// Test business logic without database
await expect(
  bookingService.createBooking({ invalidData })
).rejects.toThrow('Validation error');
```

## Common Patterns

### 1. Get Data from API

```typescript
// Client-side
const response = await fetch('/api/v2/bookings?userId=123&role=guest');
const { data } = await response.json();

console.log(data.upcoming); // Array of upcoming bookings
console.log(data.current);  // Array of current bookings
console.log(data.past);     // Array of past bookings
```

### 2. Create Resource

```typescript
const response = await fetch('/api/v2/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    propertyId: 'prop_123',
    guestId: 'user_456',
    startDate: '2025-12-01',
    endDate: '2025-12-05',
    guestCount: 2,
  }),
});

const { data, message } = await response.json();
```

### 3. Update Resource

```typescript
const response = await fetch(`/api/v2/bookings/${bookingId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'confirm',
    hostId: 'user_789',
  }),
});
```

### 4. Cancel Booking

```typescript
const response = await fetch(`/api/v2/bookings/${bookingId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'cancel',
    userId: 'user_456',
    reason: 'Change of plans',
  }),
});

const { data } = await response.json();
console.log(`Refund: ${data.refund.percentage}%`);
```

## Benefits of This Architecture

1. **Business Logic in One Place** - No scattered logic across components
2. **Type Safety** - TypeScript catches errors at compile time
3. **Testability** - Mock dependencies for unit testing
4. **Maintainability** - Clear separation of concerns
5. **Scalability** - Easy to add new features
6. **Validation** - Invalid objects cannot exist
7. **Reusability** - Services and entities used anywhere
8. **Documentation** - Code is self-documenting

## Next Steps

1. ✅ Domain entities created
2. ✅ Services implemented
3. ✅ Repositories defined
4. ✅ DI container setup
5. ✅ Example API routes created
6. ⏳ Implement remaining repositories (Property, User)
7. ⏳ Implement remaining services (PropertyService, UserService)
8. ⏳ Migrate existing API routes to v2
9. ⏳ Update React components to use v2 APIs
10. ⏳ Write comprehensive tests

## Questions?

Refer to [OOP_ARCHITECTURE.md](./OOP_ARCHITECTURE.md) for detailed architecture documentation and examples.
