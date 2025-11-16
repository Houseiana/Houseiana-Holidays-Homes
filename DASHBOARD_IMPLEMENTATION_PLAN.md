# Dashboard Implementation Plan - OOP Architecture

This document outlines the complete implementation plan for all dashboard pages following OOP principles and clean code practices.

## Architecture Overview

All dashboard pages follow this structure:
1. **Domain Layer**: Entities and Repository Interfaces
2. **Infrastructure Layer**: Prisma Repositories and Mappers
3. **Application Layer**: Services with Business Logic
4. **API Layer**: v2 RESTful Endpoints
5. **Presentation Layer**: React Pages and Components

## Dashboard Pages to Implement

### 1. My Trips (✓ Partially Done - Using Bookings)
**Route**: `/trips`
**API**: Already exists at `/api/v2/bookings?userId={id}&role=guest`
**Features**:
- View upcoming trips
- View current trips (checked-in)
- View past trips
- Cancel upcoming trips
- Leave reviews for past trips

### 2. Wishlist/Favorites
**Route**: `/wishlist`
**API**: `/api/v2/favorites?userId={id}`
**New Domain Entity**: `Favorite`
**Features**:
- View all favorited properties
- Remove from wishlist
- Add notes to favorites
- Quick book from wishlist

### 3. Explore
**Route**: `/explore`
**API**: `/api/v2/properties` (with search filters)
**Features**:
- Search properties by location, price, dates
- Filter by amenities, property type
- Map view with geospatial search
- Save to wishlist
- Instant booking

### 4. Messages
**Route**: `/messages`
**API**: `/api/v2/messages`
**New Domain Entity**: `Message`, `Conversation`
**Features**:
- View all conversations
- Send/receive messages
- Real-time updates (optional)
- Mark as read/unread
- Archive conversations

### 5. Payments
**Route**: `/payments`
**API**: `/api/v2/payments`
**New Domain Entity**: `Payment`, `PaymentMethod`
**Features**:
- View payment history
- Manage payment methods
- Download invoices
- Refund status
- Payment statistics

### 6. Profile
**Route**: `/profile`
**API**: `/api/v2/users/{id}` (already exists)
**Features**:
- Edit personal information
- Upload profile photo
- Manage verification (email, phone, ID)
- Switch to host mode
- Account settings

### 7. Support
**Route**: `/support`
**API**: `/api/v2/support/tickets`
**New Domain Entity**: `SupportTicket`
**Features**:
- Submit support tickets
- View ticket history
- Live chat (optional)
- FAQ section
- Help center articles

---

## Implementation Steps

### Phase 1: Core Infrastructure (Favorites/Wishlist)

#### 1.1 Create Domain Entity
File: `src/domain/entities/Favorite.ts` ✓ (Already created)

#### 1.2 Create Repository Interface
File: `src/domain/repositories/IFavoriteRepository.ts` ✓ (Already created)

#### 1.3 Create Prisma Repository
File: `src/infrastructure/repositories/PrismaFavoriteRepository.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { IFavoriteRepository } from '@/domain/repositories/IFavoriteRepository';
import { Favorite } from '@/domain/entities/Favorite';

export class PrismaFavoriteRepository implements IFavoriteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(favorite: Favorite): Promise<Favorite> {
    const created = await this.prisma.favorite.create({
      data: {
        id: favorite.id,
        userId: favorite.userId,
        propertyId: favorite.propertyId,
        notes: favorite.notes,
      },
    });
    return Favorite.reconstitute(created);
  }

  async findByUserId(userId: string): Promise<Favorite[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map(f => Favorite.reconstitute(f));
  }

  async deleteByUserIdAndPropertyId(userId: string, propertyId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({
      where: { userId, propertyId },
    });
  }

  async exists(userId: string, propertyId: string): Promise<boolean> {
    const count = await this.prisma.favorite.count({
      where: { userId, propertyId },
    });
    return count > 0;
  }

  // ... other methods
}
```

#### 1.4 Create Favorite Service
File: `src/application/services/FavoriteService.ts`

```typescript
import { Favorite } from '@/domain/entities/Favorite';
import { IFavoriteRepository } from '@/domain/repositories/IFavoriteRepository';
import { IPropertyRepository } from '@/domain/repositories/IPropertyRepository';

export class FavoriteService {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly propertyRepository: IPropertyRepository
  ) {}

  async addToWishlist(userId: string, propertyId: string, notes?: string): Promise<Favorite> {
    // Check if property exists
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Check if already in wishlist
    const exists = await this.favoriteRepository.exists(userId, propertyId);
    if (exists) {
      throw new Error('Property already in wishlist');
    }

    const favorite = Favorite.create({ userId, propertyId, notes });
    return await this.favoriteRepository.create(favorite);
  }

  async removeFromWishlist(userId: string, propertyId: string): Promise<void> {
    await this.favoriteRepository.deleteByUserIdAndPropertyId(userId, propertyId);
  }

  async getWishlist(userId: string): Promise<Favorite[]> {
    return await this.favoriteRepository.findByUserId(userId);
  }

  async updateNotes(favoriteId: string, userId: string, notes: string): Promise<Favorite> {
    const favorite = await this.favoriteRepository.findById(favoriteId);
    if (!favorite) {
      throw new Error('Favorite not found');
    }

    if (!favorite.belongsTo(userId)) {
      throw new Error('Unauthorized');
    }

    favorite.updateNotes(notes);
    return await this.favoriteRepository.update(favorite);
  }
}
```

#### 1.5 Update DI Container
File: `src/infrastructure/di/Container.ts`

```typescript
// Add to container
private _favoriteRepository?: IFavoriteRepository;
private _favoriteService?: FavoriteService;

public getFavoriteRepository(): IFavoriteRepository {
  if (!this._favoriteRepository) {
    this._favoriteRepository = new PrismaFavoriteRepository(this.prisma);
  }
  return this._favoriteRepository;
}

public getFavoriteService(): FavoriteService {
  if (!this._favoriteService) {
    this._favoriteService = new FavoriteService(
      this.getFavoriteRepository(),
      this.getPropertyRepository()
    );
  }
  return this._favoriteService;
}

// Export
export const getFavoriteService = () => container.getFavoriteService();
```

#### 1.6 Create API Route
File: `src/app/api/v2/favorites/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getFavoriteService } from '@/infrastructure/di/Container';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }

    const service = getFavoriteService();
    const favorites = await service.getWishlist(userId);

    return NextResponse.json({
      success: true,
      data: favorites.map(f => f.toJSON()),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch wishlist'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, propertyId, notes } = await request.json();

    const service = getFavoriteService();
    const favorite = await service.addToWishlist(userId, propertyId, notes);

    return NextResponse.json({
      success: true,
      data: favorite.toJSON(),
      message: 'Added to wishlist'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add to wishlist'
    }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, propertyId } = await request.json();

    const service = getFavoriteService();
    await service.removeFromWishlist(userId, propertyId);

    return NextResponse.json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove from wishlist'
    }, { status: 400 });
  }
}
```

---

### Phase 2: Dashboard Pages

#### 2.1 Dashboard Layout Component
File: `src/components/dashboard/DashboardLayout.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const guestMenuItems = [
  { href: '/trips', label: 'My Trips', icon: '✈️' },
  { href: '/wishlist', label: 'Wishlist', icon: '❤️' },
  { href: '/explore', label: 'Explore', icon: '🔍' },
  { href: '/messages', label: 'Messages', icon: '💬' },
  { href: '/payments', label: 'Payments', icon: '💳' },
  { href: '/profile', label: 'Profile', icon: '👤' },
  { href: '/support', label: 'Support', icon: '🆘' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-gray-600">Welcome, {user?.firstName}</p>
        </div>

        <nav className="mt-6">
          {guestMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                pathname === item.href ? 'bg-blue-50 border-r-4 border-blue-600' : ''
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
```

#### 2.2 My Trips Page
File: `src/app/(dashboard)/trips/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function TripsPage() {
  const { user } = useUser();
  const [trips, setTrips] = useState({ upcoming: [], current: [], past: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);

  const loadTrips = async () => {
    try {
      const response = await fetch(`/api/v2/bookings?userId=${user?.id}&role=guest`);
      const result = await response.json();
      if (result.success) {
        setTrips(result.data);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTrip = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this trip?')) return;

    try {
      const response = await fetch(`/api/v2/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          userId: user?.id,
          reason: 'User requested cancellation',
        }),
      });

      if (response.ok) {
        loadTrips(); // Reload trips
      }
    } catch (error) {
      console.error('Error cancelling trip:', error);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">My Trips</h1>

        {/* Upcoming Trips */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Trips</h2>
          <div className="grid gap-4">
            {trips.upcoming.map((trip: any) => (
              <div key={trip.id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg">{trip.propertyTitle}</h3>
                <p className="text-gray-600">{trip.dateRange.start} - {trip.dateRange.end}</p>
                <p className="text-lg font-bold mt-2">QAR {trip.totalPrice.amount}</p>
                <button
                  onClick={() => handleCancelTrip(trip.id)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Cancel Trip
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Current Trips */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Current Trips</h2>
          {/* Similar structure */}
        </section>

        {/* Past Trips */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Past Trips</h2>
          {/* Similar structure */}
        </section>
      </div>
    </DashboardLayout>
  );
}
```

#### 2.3 Wishlist Page
File: `src/app/(dashboard)/wishlist/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function WishlistPage() {
  const { user } = useUser();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const response = await fetch(`/api/v2/favorites?userId=${user?.id}`);
      const result = await response.json();
      if (result.success) {
        setFavorites(result.data);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/v2/favorites`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, propertyId }),
      });

      if (response.ok) {
        loadWishlist();
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav: any) => (
            <div key={fav.id} className="bg-white rounded-lg shadow overflow-hidden">
              <img
                src={fav.property?.images[0] || '/placeholder.jpg'}
                alt={fav.property?.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{fav.property?.title}</h3>
                <p className="text-gray-600">{fav.property?.address.city}</p>
                <p className="text-lg font-bold mt-2">
                  QAR {fav.property?.basePrice.amount} / night
                </p>
                <button
                  onClick={() => handleRemove(fav.propertyId)}
                  className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove from Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
```

---

## Next Steps

1. **Create Prisma Favorite Repository** - Complete implementation
2. **Create Favorite Service** - Business logic
3. **Update DI Container** - Add favorite service
4. **Create Favorite API Routes** - RESTful endpoints
5. **Create all Dashboard Pages** - Following the structure above
6. **Create Dashboard Layout** - Shared sidebar navigation
7. **Add authentication** - Protect all dashboard routes
8. **Add real-time updates** - WebSockets for messages (optional)
9. **Add tests** - Unit and integration tests

## File Structure

```
src/
├── domain/
│   ├── entities/
│   │   └── Favorite.ts ✓
│   └── repositories/
│       └── IFavoriteRepository.ts ✓
├── infrastructure/
│   ├── repositories/
│   │   └── PrismaFavoriteRepository.ts (TODO)
│   └── di/
│       └── Container.ts (UPDATE)
├── application/
│   └── services/
│       └── FavoriteService.ts (TODO)
├── app/
│   ├── api/v2/
│   │   └── favorites/
│   │       └── route.ts (TODO)
│   └── (dashboard)/
│       ├── trips/
│       │   └── page.tsx (TODO)
│       ├── wishlist/
│       │   └── page.tsx (TODO)
│       ├── explore/
│       │   └── page.tsx (TODO)
│       ├── messages/
│       │   └── page.tsx (TODO)
│       ├── payments/
│       │   └── page.tsx (TODO)
│       ├── profile/
│       │   └── page.tsx (TODO)
│       └── support/
│           └── page.tsx (TODO)
└── components/
    └── dashboard/
        └── DashboardLayout.tsx (TODO)
```

This plan provides a complete roadmap for implementing all dashboard functionality with OOP principles and clean code practices.
