# 🏠 Property Listing Process - Complete Guide

## Overview

Complete step-by-step guide for hosts to list properties on Houseiana platform with Google Maps integration.

---

## 🎯 Live Demo

**Production URL**: https://houseiana.net/host-dashboard/add-listing

**Local Development**: http://localhost:3000/host-dashboard/add-listing

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Listing Process (10 Steps)](#listing-process)
3. [Google Maps Integration](#google-maps-integration)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [GitHub Links](#github-links)

---

## Prerequisites

### For Hosts:
1. **Create Account** at https://houseiana.net/sign-up
2. **Login** at https://houseiana.net/sign-in
3. **Navigate to Host Dashboard** at https://houseiana.net/host-dashboard
4. Click **"Create listing"** or go to https://houseiana.net/host-dashboard/add-listing

### For Developers:
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (`.env.local`):
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Database
   DATABASE_URL=postgresql://...
   DIRECT_URL=postgresql://...

   # Google Maps API
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
   ```
4. Push database schema: `npx prisma db push`
5. Run development server: `npm run dev`

---

## 🚀 Listing Process

### Step 0: Property Type Selection

Choose the type of property you're listing:

| Type | Icon | Description |
|------|------|-------------|
| 🏠 House | Home | Single-family house |
| 🏢 Apartment | Building2 | Multi-unit apartment |
| 🏰 Villa | Castle | Luxury villa |
| 🏙️ Condo | Building | Condominium |
| 🏘️ Townhouse | Home | Townhouse |
| 🌲 Cabin | TreePine | Mountain/forest cabin |
| ⛵ Boat | Ship | Houseboat |
| 🏨 Hotel | Hotel | Hotel room |
| 🏕️ Tent | Tent | Camping tent |
| 🏭 Warehouse | Warehouse | Converted warehouse |

**UI Features:**
- Grid layout with hover effects
- Icon-based selection
- Visual feedback on selection
- Mobile responsive

---

### Step 1: Place Type

Select what guests will have access to:

- **Entire place** - Guests have the whole place to themselves
- **Private room** - Guests have their own room in a shared property
- **Shared room** - Guests share a room with others

---

### Step 2: Location (With Google Maps Integration) ⭐

**NEW: Interactive Google Maps with draggable marker**

#### Address Input Options:

**Option 1: Google Places Autocomplete (Recommended)**
1. Start typing your address in the search bar
2. Select from dropdown suggestions
3. All fields auto-populate
4. Map updates automatically
5. Drag the red marker to adjust exact location

**Option 2: Manual Entry**
- Country / Region (dropdown: Qatar, UAE, Saudi Arabia, Kuwait, Bahrain, Oman)
- Street address
- Apt, suite, etc. (optional)
- City
- Postal code

**Interactive Map Features:**
- ✅ Draggable red marker
- ✅ Click anywhere on map to reposition
- ✅ Reverse geocoding updates address fields
- ✅ Live coordinates display (latitude, longitude)
- ✅ Zoom controls
- ✅ Drop animation on marker placement

**Technical Implementation:**
- Google Maps JavaScript API
- Google Places Autocomplete API
- Google Geocoding API (reverse geocoding)
- Real-time coordinate tracking
- Address component parsing

---

### Step 3: Basics

Set up basic property information:

**Capacity Counters:**
- **Guests** (1-16) - Maximum number of guests
- **Bedrooms** (1-10) - Number of bedrooms
- **Beds** (1-20) - Number of beds
- **Bathrooms** (1-10) - Number of bathrooms

Each counter has:
- Minus button (decreases by 1)
- Current value display
- Plus button (increases by 1)
- Minimum value of 1

---

### Step 4: Amenities

Select all amenities your property offers:

| Category | Amenities |
|----------|-----------|
| **Connectivity** | WiFi, TV |
| **Climate Control** | AC, Heating, Fan |
| **Kitchen** | Full Kitchen, Coffee Maker, Microwave |
| **Laundry** | Washer, Dryer, Iron |
| **Outdoor** | Pool, Hot Tub, BBQ Grill, Private Garden, Rooftop Access, Swing |
| **Facilities** | Gym, Parking |
| **Workspace** | Dedicated Workspace |
| **Security** | Security Cameras |

**UI Features:**
- Multi-select checkboxes
- Icon representation for each amenity
- Visual feedback on selection (teal background)
- Grid layout

---

### Step 5: Photos

Upload property images:

**Features:**
- Drag & drop file upload
- Click to browse files
- Multiple file selection
- Image preview grid
- Remove individual photos
- Up to 20 photos supported

**Supported Formats:**
- JPG/JPEG
- PNG
- WebP

**Recommendations:**
- High resolution (at least 1024x768)
- Good lighting
- Multiple angles
- Show key features
- First photo becomes cover photo

---

### Step 6: Title & Description

**Title:**
- Short, catchy title (max 100 characters)
- Highlight unique features
- Example: "Luxury Waterfront Villa with Private Pool"

**Description:**
- Detailed property description
- Mention nearby attractions
- Highlight special features
- Describe the neighborhood
- 500-2000 characters recommended

---

### Step 7: Pricing

Set your nightly rate and fees:

**Pricing Fields:**
- **Base Price** ($/night) - Your nightly rate
- **Cleaning Fee** ($) - One-time cleaning fee
- **Service Fee** ($) - Platform service fee

**Total Calculation:**
- Automatically calculates per-night total
- Shows breakdown to guests
- QAR currency support

**Example:**
```
Base Price: $200/night
Cleaning Fee: $50
Service Fee: $25
────────────────────
Total: $275/night (for 1 night)
```

---

### Step 8: House Rules

Set rules and policies for your property:

**Check-in/Check-out:**
- Check-in time (default: 3:00 PM)
- Check-out time (default: 11:00 AM)
- Custom times available

**Policies (Toggle):**
- 🐾 Allow Pets
- 🚬 Allow Smoking
- 🎉 Allow Parties/Events
- 🔫 Weapons Allowed

**Additional Rules:**
- Minimum nights (default: 1)
- Maximum nights (optional)
- Instant booking (toggle)
- Additional house rules (text area)

---

### Step 9: Availability

Set your property calendar:

**Features:**
- Calendar date picker
- Block specific dates
- Set available date ranges
- Recurring availability patterns
- Sync with external calendars

---

### Step 10: Review & Publish

**Final Review Screen:**

Shows a beautiful preview card with:
- Cover photo
- Property title
- Location (city, country)
- Property type & capacity
  - X guests
  - X bedrooms
  - X beds
  - X bathrooms
- Amenities count
- Price breakdown
- House rules summary

**Actions:**
- **Save as Draft** - Save without publishing
- **Publish Listing** - Make live on platform

**On Success:**
- ✅ Success message displayed
- 📧 Confirmation email sent
- ↪️ Redirect to host dashboard
- 🎉 Property appears in "My Listings"

---

## 🗺️ Google Maps Integration

### Features Implemented:

1. **Google Places Autocomplete**
   - Type-ahead address search
   - Auto-populates all address fields
   - Supports international addresses

2. **Interactive Map Display**
   - 15x zoom level
   - Teal-colored marker
   - Zoom controls enabled
   - No map type controls (cleaner UI)

3. **Draggable Marker**
   - Drag marker to adjust location
   - Drop animation on placement
   - Updates coordinates in real-time

4. **Click-to-Place**
   - Click anywhere on map
   - Marker moves to clicked location
   - Reverse geocoding updates address

5. **Reverse Geocoding**
   - Converts coordinates to address
   - Updates all address fields automatically
   - Handles incomplete addresses gracefully

6. **Live Coordinates Display**
   - Shows latitude with 6 decimal precision
   - Shows longitude with 6 decimal precision
   - Updates on every marker move

### Technical Details:

**Libraries Used:**
```typescript
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
const libraries: ("places")[] = ["places"];
```

**Map Configuration:**
```typescript
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};
```

**Address Parsing:**
- `street_number` + `route` → Street address
- `locality` → City
- `administrative_area_level_1` → State
- `postal_code` → Postal code
- `country` → Country

**Files:**
- [app/host-dashboard/add-listing/page.tsx](https://github.com/Houseiana/Houseiana-Holidays-Homes/blob/main/app/host-dashboard/add-listing/page.tsx) (Lines 107-255)

---

## 🔌 API Endpoints

### Property Management API

**Base URL**: `https://houseiana.net/api/v2/properties`

#### 1. Create Property (POST)

```typescript
POST /api/v2/properties
Headers: {
  'Authorization': 'Bearer <clerk_jwt_token>',
  'Content-Type': 'application/json'
}

Body: {
  propertyType: "VILLA",
  placeType: "ENTIRE_PLACE",
  country: "Qatar",
  street: "123 Corniche Road",
  apt: "Building 12",
  city: "Doha",
  state: "Al Dafna",
  postalCode: "12345",
  latitude: 25.2854,
  longitude: 51.5310,
  guests: 6,
  bedrooms: 3,
  beds: 3,
  bathrooms: 2,
  amenities: ["wifi", "pool", "parking", "gym"],
  photos: [
    "https://cloudinary.com/image1.jpg",
    "https://cloudinary.com/image2.jpg"
  ],
  title: "Luxury Villa in Doha",
  description: "Beautiful 3-bedroom villa with stunning views...",
  pricePerNight: 500,
  cleaningFee: 50,
  serviceFee: 25,
  checkInTime: "15:00",
  checkOutTime: "11:00",
  allowPets: false,
  allowSmoking: false,
  allowParties: false,
  weapons: false
}

Response 201:
{
  "success": true,
  "message": "Property created successfully",
  "property": {
    "id": "prop_abc123",
    "hostId": "user_xyz789",
    "title": "Luxury Villa in Doha",
    "status": "DRAFT",
    "createdAt": "2024-11-28T...",
    ...
  }
}
```

#### 2. Get All Properties (GET)

```typescript
GET /api/v2/properties
Optional Query Parameters:
  ?hostId=user_xyz789
  &city=Doha
  &propertyType=VILLA
  &status=PUBLISHED
  &minPrice=100
  &maxPrice=1000
  &guests=4

Response 200:
{
  "success": true,
  "count": 15,
  "properties": [
    {
      "id": "prop_abc123",
      "title": "Luxury Villa in Doha",
      "city": "Doha",
      "pricePerNight": 500,
      "coverPhoto": "https://...",
      "averageRating": 4.8,
      "reviewCount": 24,
      ...
    }
  ]
}
```

#### 3. Get Single Property (GET)

```typescript
GET /api/v2/properties/:id

Response 200:
{
  "success": true,
  "property": {
    "id": "prop_abc123",
    "host": {
      "id": "user_xyz789",
      "firstName": "Ahmed",
      "lastName": "Al-Mansoori",
      "profileImage": "https://...",
      "joinedDate": "2024-01-15"
    },
    "title": "Luxury Villa in Doha",
    "description": "...",
    "bookings": [...],
    "reviews": [...],
    ...
  }
}
```

#### 4. Update Property (PUT)

```typescript
PUT /api/v2/properties/:id
Headers: {
  'Authorization': 'Bearer <clerk_jwt_token>',
  'Content-Type': 'application/json'
}

Body: {
  pricePerNight: 550,  // Updated price
  status: "PUBLISHED"   // Publish the property
}

Response 200:
{
  "success": true,
  "message": "Property updated successfully",
  "property": { ... }
}
```

#### 5. Delete Property (DELETE)

```typescript
DELETE /api/v2/properties/:id
Headers: {
  'Authorization': 'Bearer <clerk_jwt_token>'
}

Response 200:
{
  "success": true,
  "message": "Property deleted successfully"
}
```

---

## 💾 Database Schema

### Property Model (Prisma)

```prisma
model Property {
  id          String   @id @default(cuid())
  clerkUserId String   // Clerk user ID (host)

  // Basic Info
  propertyType String  // HOUSE, APARTMENT, VILLA, etc.
  placeType    String  // ENTIRE_PLACE, PRIVATE_ROOM, SHARED_ROOM
  title        String
  description  String  @db.Text

  // Location
  country     String
  street      String
  apt         String?
  city        String
  state       String?
  postalCode  String?
  latitude    Float
  longitude   Float

  // Capacity
  guests      Int
  bedrooms    Int
  beds        Int
  bathrooms   Int

  // Features
  amenities   Json    // Array of amenity strings
  photos      Json    // Array of photo URLs
  coverPhoto  String?

  // Pricing
  pricePerNight Decimal @db.Decimal(10, 2)
  cleaningFee   Decimal @db.Decimal(10, 2)
  serviceFee    Decimal @db.Decimal(10, 2)

  // Rules
  checkInTime   String
  checkOutTime  String
  allowPets     Boolean @default(false)
  allowSmoking  Boolean @default(false)
  allowParties  Boolean @default(false)
  weapons       Boolean @default(false)

  // Status
  status        String  @default("DRAFT") // DRAFT, PENDING_REVIEW, PUBLISHED, UNLISTED, SUSPENDED
  isActive      Boolean @default(true)

  // Stats
  viewCount     Int     @default(0)
  bookingCount  Int     @default(0)
  averageRating Float?

  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  bookings  Booking[]
  reviews   Review[]
  favorites Favorite[]

  @@index([clerkUserId])
  @@index([city])
  @@index([propertyType])
  @@index([status])
}
```

### Property Status Flow

```
DRAFT
  ↓
PENDING_REVIEW (Host submits for approval)
  ↓
PUBLISHED (Admin approves - visible to guests)
  ↓
UNLISTED (Host temporarily hides)
  ↓
SUSPENDED (Admin blocks property)
```

---

## 📂 GitHub Links

### Main Repository
**Repository URL**: https://github.com/Houseiana/Houseiana-Holidays-Homes

### Key Files

#### Frontend (Next.js)

**Property Listing Form:**
- [app/host-dashboard/add-listing/page.tsx](https://github.com/Houseiana/Houseiana-Holidays-Homes/blob/main/app/host-dashboard/add-listing/page.tsx)
  - Complete 10-step wizard
  - Google Maps integration
  - Form validation
  - 1,500+ lines of code

**Host Dashboard:**
- [app/host-dashboard/page.tsx](https://github.com/Houseiana/Houseiana-Holidays-Homes/blob/main/app/host-dashboard/page.tsx)
  - Airbnb-style horizontal navigation
  - Today, Calendar, Listings, Inbox tabs
  - Property management interface

#### Backend API

**Properties API:**
- [app/api/v2/properties/route.ts](https://github.com/Houseiana/Houseiana-Holidays-Homes/blob/main/app/api/v2/properties/route.ts)
  - GET - List all properties
  - POST - Create property
  - PUT - Update property
  - DELETE - Delete property

**Single Property API:**
- [app/api/v2/properties/[id]/route.ts](https://github.com/Houseiana/Houseiana-Holidays-Homes/blob/main/app/api/v2/properties/%5Bid%5D/route.ts)
  - GET - Get single property details
  - Includes host info, bookings, reviews

#### Database

**Prisma Schema:**
- [prisma/schema.prisma](https://github.com/Houseiana/Houseiana-Holidays-Homes/blob/main/prisma/schema.prisma)
  - Property model (line 100+)
  - Booking model
  - Review model
  - Favorite model

#### Documentation

**Complete Documentation:**
- [docs/PROPERTY_LISTING_SYSTEM.md](https://github.com/Houseiana/Houseiana-Holidays-Homes/blob/main/docs/PROPERTY_LISTING_SYSTEM.md)
  - Detailed implementation guide
  - API usage examples
  - Testing instructions

**Property Listing Flow:**
- [PROPERTY_LISTING_FLOW.md](https://github.com/Houseiana/Houseiana-Holidays-Homes/blob/main/PROPERTY_LISTING_FLOW.md)
  - This file
  - Step-by-step user guide

#### Inventory Management Subsystem

**Complete Inventory System:**
- [inventory-management/](https://github.com/Houseiana/Houseiana-Holidays-Homes/tree/main/inventory-management)
  - Property approval workflow
  - Compliance document tracking
  - Financial analytics
  - 10 administrative panels

**Inventory Dashboard:**
- [inventory-management/app/dashboard/page.tsx](https://github.com/Houseiana/Houseiana-Holidays-Homes/blob/main/inventory-management/app/dashboard/page.tsx)
  - Approvals & Moderation
  - Inventory & Lifecycle
  - Calendar & Blocking
  - And 7 more panels

**Inventory README:**
- [inventory-management/README.md](https://github.com/Houseiana/Houseiana-Holidays-Homes/blob/main/inventory-management/README.md)
  - Complete feature overview
  - API endpoints
  - Deployment guide

---

## 🎨 UI Preview

### Step 2: Google Maps Integration

```
┌─────────────────────────────────────────────────────────┐
│  Search for your address                                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Start typing your address...                       │ │
│  └────────────────────────────────────────────────────┘ │
│  ℹ️ Select your address from the dropdown to auto-fill  │
│                                                          │
│  Or enter manually:                                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Country / Region:  [Qatar ▼]                       │ │
│  │ Street address:    [_________________________]     │ │
│  │ Apt, suite:        [_________________________]     │ │
│  │ City:              [________]  Postal: [_____]     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  📍 Confirm your address on the map                     │
│  ℹ️ Drag the red pin or click on the map               │
│  ┌────────────────────────────────────────────────────┐ │
│  │                                                     │ │
│  │              🗺️  GOOGLE MAP                        │ │
│  │                                                     │ │
│  │                     📍                              │ │
│  │                                                     │ │
│  └────────────────────────────────────────────────────┘ │
│  ✅ Location: 123 Corniche Road, Doha, Qatar            │
│  Coordinates: 25.285400, 51.531000                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing the Complete Flow

### 1. Local Testing

```bash
# Start the development server
cd "H User Fullstack/houseiana-nextjs"
npm run dev

# Open in browser
open http://localhost:3000/host-dashboard/add-listing

# Login with Clerk
# Complete all 10 steps
# Submit the form
# Check Prisma Studio
npx prisma studio
```

### 2. Production Testing

```bash
# Open production site
open https://houseiana.net/sign-in

# Login with your account
# Navigate to host dashboard
open https://houseiana.net/host-dashboard

# Click "Create listing"
# Complete the 10-step form
# Verify property appears in dashboard
```

---

## 🔒 Security Features

1. **Clerk Authentication**
   - JWT token validation
   - User session management
   - Automatic token refresh

2. **Authorization**
   - Host-only access to create properties
   - Owner-only edit/delete permissions
   - Admin override capabilities

3. **Input Validation**
   - Client-side validation (React)
   - Server-side validation (API)
   - Prisma schema constraints
   - SQL injection protection

4. **Data Protection**
   - HTTPS encryption (production)
   - Environment variable security
   - Secure cookie handling
   - CORS configuration

---

## 📊 Property Statistics

Once properties are created, hosts can view:

- **Total Views** - How many times property was viewed
- **Booking Count** - Number of completed bookings
- **Average Rating** - Average guest rating (1-5 stars)
- **Review Count** - Total number of reviews
- **Revenue** - Total earnings from property
- **Occupancy Rate** - Percentage of booked nights

---

## 🎯 Next Steps

### For Hosts:
1. ✅ Complete your profile
2. ✅ Add your first property
3. ✅ Upload high-quality photos
4. ✅ Set competitive pricing
5. ✅ Respond to guest inquiries promptly
6. ✅ Maintain 5-star ratings

### For Developers:
1. 🔄 Implement photo upload to Cloudinary/S3
2. 🔄 Add property editing functionality
3. 🔄 Create property management dashboard
4. 🔄 Add calendar sync (Google Calendar, iCal)
5. 🔄 Implement instant booking flow
6. 🔄 Add cancellation policy options
7. 🔄 Create property analytics dashboard

---

## 🤝 Support

**For Hosts:**
- Support Email: support@houseiana.net
- Phone: +974 4444 4444
- Help Center: https://houseiana.net/support

**For Developers:**
- GitHub Issues: https://github.com/Houseiana/Houseiana-Holidays-Homes/issues
- Documentation: https://github.com/Houseiana/Houseiana-Holidays-Homes/tree/main/docs

---

## 📄 License

© 2024 Houseiana, Inc. All rights reserved.

---

**Built with:**
- Next.js 14
- TypeScript
- Tailwind CSS
- Clerk Authentication
- Prisma ORM
- PostgreSQL
- Google Maps API
- Vercel Deployment
