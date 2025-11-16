# API v2 Reference - OOP Architecture

This document provides a complete reference for all v2 API endpoints that use the new OOP architecture.

## Overview

All v2 endpoints are prefixed with `/api/v2/` and use the OOP architecture with:
- **Services**: Business logic layer (BookingService, PropertyService, UserService)
- **Repositories**: Data access layer (PrismaBookingRepository, PrismaPropertyRepository, PrismaUserRepository)
- **Entities**: Domain models with rich behavior (Booking, Property, User)
- **Value Objects**: Immutable objects (Money, Email, DateRange, Address, PhoneNumber)

## Bookings API

### Create Booking
```
POST /api/v2/bookings
```

**Request Body:**
```json
{
  "propertyId": "string",
  "guestId": "string",
  "startDate": "2025-12-01",
  "endDate": "2025-12-05",
  "guestCount": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* Booking object */ },
  "message": "Booking created successfully"
}
```

### Get Bookings
```
GET /api/v2/bookings?userId=xxx&role=guest|host
```

**Query Parameters:**
- `userId` (required): User ID
- `role` (required): Either "guest" or "host"

**Response (Guest):**
```json
{
  "success": true,
  "data": {
    "upcoming": [ /* Booking objects */ ],
    "current": [ /* Booking objects */ ],
    "past": [ /* Booking objects */ ]
  }
}
```

**Response (Host):**
```json
{
  "success": true,
  "data": [ /* Booking objects */ ]
}
```

### Get Booking by ID
```
GET /api/v2/bookings/:id
```

### Update Booking (Actions)
```
PATCH /api/v2/bookings/:id
```

**Confirm Booking:**
```json
{
  "action": "confirm",
  "hostId": "string"
}
```

**Reject Booking:**
```json
{
  "action": "reject",
  "hostId": "string",
  "reason": "string"
}
```

**Cancel Booking:**
```json
{
  "action": "cancel",
  "userId": "string",
  "reason": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": { /* Updated booking object */ },
    "refund": {
      "amount": { /* Money object */ },
      "percentage": 80
    }
  },
  "message": "Booking cancelled successfully"
}
```

---

## Properties API

### Create Property
```
POST /api/v2/properties
```

**Request Body:**
```json
{
  "hostId": "string",
  "title": "string",
  "description": "string",
  "type": "HOUSE|APARTMENT|VILLA|CONDO|TOWNHOUSE|STUDIO",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postalCode": "string",
    "coordinates": { "lat": 25.123, "lng": 51.456 }
  },
  "pricePerNight": 500,
  "cleaningFee": 50,
  "maxGuests": 4,
  "bedrooms": 2,
  "bathrooms": 2,
  "beds": 2,
  "amenities": ["WiFi", "Pool", "Parking"],
  "images": ["url1", "url2"],
  "rules": {
    "checkInTime": "15:00",
    "checkOutTime": "11:00",
    "petsAllowed": false,
    "smokingAllowed": false,
    "partiesAllowed": false
  },
  "minimumStay": 1,
  "instantBooking": false
}
```

### Search Properties
```
GET /api/v2/properties?[filters]
```

**Query Parameters:**
- `location`: City or country to search in
- `type`: Property type (HOUSE, APARTMENT, etc.)
- `minPrice`: Minimum price per night
- `maxPrice`: Maximum price per night
- `minGuests`: Minimum guest capacity
- `bedrooms`: Number of bedrooms
- `bathrooms`: Number of bathrooms
- `amenities`: Comma-separated amenity names
- `instantBooking`: "true" for instant booking only
- `startDate` & `endDate`: Date range for availability filtering
- `lat`, `lng`, `radiusKm`: Geospatial search

**Special Endpoints:**
```
GET /api/v2/properties?hostId=xxx        # Get properties by host
GET /api/v2/properties?featured=true     # Get featured properties
GET /api/v2/properties?recent=true       # Get recent properties
```

### Get Property by ID
```
GET /api/v2/properties/:id
```

### Update Property
```
PATCH /api/v2/properties/:id
```

**Update Details:**
```json
{
  "action": "update",
  "hostId": "string",
  "title": "New Title",
  "description": "New Description",
  "pricePerNight": 600,
  "cleaningFee": 60,
  "maxGuests": 5,
  "minimumStay": 2,
  "maximumStay": 14
}
```

**Publish Property:**
```json
{
  "action": "publish",
  "hostId": "string"
}
```

**Unlist Property:**
```json
{
  "action": "unlist",
  "hostId": "string"
}
```

**Add Amenity:**
```json
{
  "action": "add-amenity",
  "hostId": "string",
  "amenity": "Hot Tub"
}
```

**Add Image:**
```json
{
  "action": "add-image",
  "hostId": "string",
  "imageUrl": "https://..."
}
```

### Delete Property
```
DELETE /api/v2/properties/:id?hostId=xxx
```

### Get Property Statistics
```
GET /api/v2/properties/:id/stats?hostId=xxx
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBookings": 42,
    "upcomingBookings": 5,
    "totalRevenue": 21000
  }
}
```

---

## Users API

### Create User
```
POST /api/v2/users
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "countryCode": "+974",
  "dateOfBirth": "1990-01-01",
  "clerkId": "clerk_xxx"
}
```

### Search Users
```
GET /api/v2/users?[query]
```

**Query Parameters:**
- `q`: Search by name or email
- `role`: Filter by role (GUEST, HOST, ADMIN)
- `verifiedHosts=true`: Get verified hosts only
- `inactive=true&days=90`: Get inactive users

### Get User by ID
```
GET /api/v2/users/:id
```

### Update User
```
PATCH /api/v2/users/:id
```

**Update Profile:**
```json
{
  "action": "update-profile",
  "firstName": "John",
  "lastName": "Doe",
  "avatar": "https://...",
  "bio": "Hello!",
  "language": "en",
  "currency": "QAR"
}
```

**Become Host:**
```json
{
  "action": "become-host"
}
```

**Verify Email:**
```json
{
  "action": "verify-email"
}
```

**Verify Phone:**
```json
{
  "action": "verify-phone"
}
```

**Complete ID Verification:**
```json
{
  "action": "verify-id"
}
```

**Suspend User:**
```json
{
  "action": "suspend",
  "reason": "Violation of terms"
}
```

**Deactivate/Reactivate:**
```json
{
  "action": "deactivate"
}
```
```json
{
  "action": "reactivate"
}
```

**Update Host Profile:**
```json
{
  "action": "update-host-profile",
  "bio": "Experienced host...",
  "responseTime": 60,
  "acceptanceRate": 95,
  "isSuperhost": true
}
```

### Delete User
```
DELETE /api/v2/users/:id
```

### Get User Dashboard
```
GET /api/v2/users/:id/dashboard?role=host|guest
```

**Response (Host Dashboard):**
```json
{
  "success": true,
  "data": {
    "user": { /* User object */ },
    "properties": 5,
    "publishedProperties": 4,
    "totalBookings": 42,
    "pendingBookings": 3,
    "upcomingBookings": 8,
    "totalEarnings": 21000,
    "averageRating": 4.8
  }
}
```

**Response (Guest Dashboard):**
```json
{
  "success": true,
  "data": {
    "user": { /* User object */ },
    "upcomingTrips": 2,
    "currentTrips": 1,
    "pastTrips": 5,
    "favoriteProperties": 12
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data or business logic error
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Using the API

### Example: Create a Booking

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

const result = await response.json();

if (result.success) {
  console.log('Booking created:', result.data);
} else {
  console.error('Error:', result.error);
}
```

### Example: Search Properties

```typescript
const params = new URLSearchParams({
  location: 'Doha',
  minPrice: '200',
  maxPrice: '1000',
  minGuests: '2',
  bedrooms: '2',
  startDate: '2025-12-01',
  endDate: '2025-12-05',
});

const response = await fetch(`/api/v2/properties?${params}`);
const result = await response.json();

if (result.success) {
  console.log('Found properties:', result.data);
}
```

### Example: Update Booking (Confirm)

```typescript
const response = await fetch(`/api/v2/bookings/booking_123`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'confirm',
    hostId: 'host_789',
  }),
});

const result = await response.json();

if (result.success) {
  console.log('Booking confirmed:', result.data);
}
```

---

## Architecture Benefits

### 1. Type Safety
All API responses are type-safe through TypeScript.

### 2. Business Logic Validation
The service layer validates all business rules before database operations.

### 3. Reusability
Services can be used from any part of the application (API routes, server components, etc.).

### 4. Testability
Services and repositories can be easily mocked for testing.

### 5. Maintainability
Clear separation of concerns makes the codebase easier to maintain.

---

## Next Steps

1. Migrate existing pages to use v2 APIs
2. Add authentication middleware to v2 routes
3. Add rate limiting
4. Add API versioning strategy
5. Write comprehensive tests for all endpoints
6. Add API documentation (Swagger/OpenAPI)
7. Add monitoring and logging

---

## Related Documentation

- [OOP_ARCHITECTURE.md](./OOP_ARCHITECTURE.md) - Detailed architecture guide
- [OOP_IMPLEMENTATION_GUIDE.md](./OOP_IMPLEMENTATION_GUIDE.md) - Usage guide
- Domain Entities: `src/domain/entities/`
- Services: `src/application/services/`
- Repositories: `src/infrastructure/repositories/`
- DI Container: `src/infrastructure/di/Container.ts`
