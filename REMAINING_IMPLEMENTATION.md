# Remaining OOP Implementation Tasks

## ✅ What's Already Complete

1. **Domain Layer**
   - ✅ All Value Objects (Money, Email, PhoneNumber, DateRange, Address)
   - ✅ All Entity Classes (BaseEntity, Booking, Property, User)
   - ✅ All Repository Interfaces (IBookingRepository, IPropertyRepository, IUserRepository)

2. **Application Layer**
   - ✅ BookingService (complete implementation)

3. **Infrastructure Layer**
   - ✅ BookingMapper
   - ✅ PrismaBookingRepository
   - ✅ PropertyMapper
   - ✅ DI Container (basic setup)

4. **Presentation Layer**
   - ✅ v2 Booking API routes

5. **Documentation**
   - ✅ OOP_ARCHITECTURE.md
   - ✅ OOP_IMPLEMENTATION_GUIDE.md

---

## 🔨 Tasks To Complete

### 1. Prisma Property Repository

**File:** `src/infrastructure/repositories/PrismaPropertyRepository.ts`

**Pattern to follow (same as PrismaBookingRepository):**
```typescript
import { PrismaClient } from '@prisma/client';
import { IPropertyRepository, PropertySearchCriteria } from '@/domain/repositories/IPropertyRepository';
import { Property, PropertyType, PropertyStatus } from '@/domain/entities/Property';
import { PropertyMapper } from '../mappers/PropertyMapper';
import { DateRange } from '@/domain/value-objects/DateRange';

export class PrismaPropertyRepository implements IPropertyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(property: Property): Promise<Property> {
    const prismaData = PropertyMapper.toPrisma(property);
    const created = await this.prisma.property.create({
      data: prismaData,
    });
    return PropertyMapper.toDomain(created);
  }

  async update(property: Property): Promise<Property> {
    const prismaData = PropertyMapper.toPrisma(property);
    const updated = await this.prisma.property.update({
      where: { id: property.id },
      data: prismaData,
    });
    return PropertyMapper.toDomain(updated);
  }

  async findById(id: string): Promise<Property | null> {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });
    return property ? PropertyMapper.toDomain(property) : null;
  }

  async findByHostId(hostId: string): Promise<Property[]> {
    const properties = await this.prisma.property.findMany({
      where: { hostId },
      orderBy: { createdAt: 'desc' },
    });
    return PropertyMapper.toDomainList(properties);
  }

  async findPublishedByHostId(hostId: string): Promise<Property[]> {
    const properties = await this.prisma.property.findMany({
      where: {
        hostId,
        status: 'PUBLISHED',
      },
      orderBy: { createdAt: 'desc' },
    });
    return PropertyMapper.toDomainList(properties);
  }

  async findByStatus(status: PropertyStatus): Promise<Property[]> {
    // Implement similar pattern
    // Map domain status to Prisma status
    // Query and return
  }

  async search(criteria: PropertySearchCriteria): Promise<Property[]> {
    const where: any = {};

    if (criteria.location) {
      where.OR = [
        { city: { contains: criteria.location, mode: 'insensitive' } },
        { country: { contains: criteria.location, mode: 'insensitive' } },
      ];
    }

    if (criteria.type) {
      where.propertyType = criteria.type;
    }

    if (criteria.minPrice || criteria.maxPrice) {
      where.pricePerNight = {};
      if (criteria.minPrice) where.pricePerNight.gte = criteria.minPrice;
      if (criteria.maxPrice) where.pricePerNight.lte = criteria.maxPrice;
    }

    if (criteria.guests) {
      where.guests = { gte: criteria.guests };
    }

    if (criteria.bedrooms) {
      where.bedrooms = { gte: criteria.bedrooms };
    }

    const properties = await this.prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return PropertyMapper.toDomainList(properties);
  }

  // Implement remaining methods following the same pattern...
  async findAvailable(dateRange: DateRange): Promise<Property[]> { /* ... */ }
  async findByAmenity(amenityId: string): Promise<Property[]> { /* ... */ }
  async findNearLocation(lat: number, lng: number, radiusKm: number): Promise<Property[]> { /* ... */ }
  async findFeatured(limit?: number): Promise<Property[]> { /* ... */ }
  async findRecent(limit?: number): Promise<Property[]> { /* ... */ }
  async count(): Promise<number> { /* ... */ }
  async countByHostId(hostId: string): Promise<number> { /* ... */ }
  async delete(id: string): Promise<void> { /* ... */ }
  async exists(id: string): Promise<boolean> { /* ... */ }

  // Implement the remaining repository interface methods
  async findByType(type: PropertyType): Promise<Property[]> { /*...*/ }
}
```

---

### 2. User Mapper

**File:** `src/infrastructure/mappers/UserMapper.ts`

```typescript
import { User as PrismaUser } from '@prisma/client';
import { User, UserRole, UserStatus, VerificationStatus } from '@/domain/entities/User';
import { Email } from '@/domain/value-objects/Email';
import { PhoneNumber } from '@/domain/value-objects/PhoneNumber';

export class UserMapper {
  static toDomain(prisma: PrismaUser): User {
    const email = Email.create(prisma.email || 'unknown@example.com');

    const phoneNumber = prisma.phone && prisma.countryCode
      ? PhoneNumber.create(prisma.phone, prisma.countryCode)
      : undefined;

    // Map roles
    const roles: UserRole[] = [];
    if (prisma.userType === 'GUEST' || !prisma.isHost) roles.push(UserRole.GUEST);
    if (prisma.isHost) roles.push(UserRole.HOST);
    if (prisma.isAdmin) roles.push(UserRole.ADMIN);

    // Map status
    const status = prisma.accountLockedUntil && prisma.accountLockedUntil > new Date()
      ? UserStatus.SUSPENDED
      : UserStatus.ACTIVE;

    // Map verification status
    let verificationStatus = VerificationStatus.UNVERIFIED;
    if (prisma.emailVerified && prisma.phoneVerified && prisma.kycCompleted) {
      verificationStatus = VerificationStatus.FULLY_VERIFIED;
    } else if (prisma.emailVerified && prisma.phoneVerified) {
      verificationStatus = VerificationStatus.PHONE_VERIFIED;
    } else if (prisma.emailVerified) {
      verificationStatus = VerificationStatus.EMAIL_VERIFIED;
    }

    return User.reconstitute({
      id: prisma.id,
      email,
      phoneNumber,
      roles,
      status,
      verificationStatus,
      profile: {
        firstName: prisma.firstName,
        lastName: prisma.lastName,
        bio: undefined,
        avatarUrl: prisma.profilePhoto || undefined,
        dateOfBirth: prisma.birthDate ? new Date(prisma.birthDate) : undefined,
        languages: undefined,
        occupation: undefined,
        location: undefined,
      },
      hostProfile: prisma.isHost ? {
        responseRate: 0,
        responseTime: 24,
        isSuperhost: false,
        totalListings: 0,
        totalBookings: 0,
        totalRevenue: 0,
      } : undefined,
      clerkId: prisma.id, // Using Prisma ID as Clerk ID for now
      lastLoginAt: prisma.lastLoginAt || undefined,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  static toPrisma(domain: User): any {
    // Convert domain User to Prisma User structure
    return {
      id: domain.id,
      firstName: domain.profile.firstName,
      lastName: domain.profile.lastName,
      email: domain.email.value,
      phone: domain.phoneNumber?.value,
      countryCode: domain.phoneNumber?.countryCode,
      profilePhoto: domain.profile.avatarUrl,
      isHost: domain.isHost(),
      isAdmin: domain.isAdmin(),
      emailVerified: domain.verificationStatus !== VerificationStatus.UNVERIFIED,
      phoneVerified: domain.verificationStatus === VerificationStatus.PHONE_VERIFIED ||
                     domain.verificationStatus === VerificationStatus.FULLY_VERIFIED,
      kycCompleted: domain.verificationStatus === VerificationStatus.FULLY_VERIFIED,
      lastLoginAt: domain.lastLoginAt,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  static toDomainList(prismaList: PrismaUser[]): User[] {
    return prismaList.map(prisma => this.toDomain(prisma));
  }
}
```

---

### 3. Prisma User Repository

**File:** `src/infrastructure/repositories/PrismaUserRepository.ts`

Follow the same pattern as `PrismaBookingRepository` and `PrismaPropertyRepository`.

```typescript
import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User, UserRole, UserStatus } from '@/domain/entities/User';
import { Email } from '@/domain/value-objects/Email';
import { UserMapper } from '../mappers/UserMapper';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(user: User): Promise<User> {
    const prismaData = UserMapper.toPrisma(user);
    const created = await this.prisma.user.create({
      data: prismaData,
    });
    return UserMapper.toDomain(created);
  }

  async update(user: User): Promise<User> {
    const prismaData = UserMapper.toPrisma(user);
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: prismaData,
    });
    return UserMapper.toDomain(updated);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.value },
    });
    return user ? UserMapper.toDomain(user) : null;
  }

  // Implement all other interface methods...
}
```

---

### 4. Property Service

**File:** `src/application/services/PropertyService.ts`

```typescript
import { Property, PropertyType, PropertyStatus } from '@/domain/entities/Property';
import { IPropertyRepository, PropertySearchCriteria } from '@/domain/repositories/IPropertyRepository';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IBookingRepository } from '@/domain/repositories/IBookingRepository';
import { Money } from '@/domain/value-objects/Money';
import { Address } from '@/domain/value-objects/Address';
import { DateRange } from '@/domain/value-objects/DateRange';

export interface CreatePropertyDTO {
  hostId: string;
  title: string;
  description: string;
  type: PropertyType;
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
    coordinates?: { lat: number; lng: number };
  };
  pricePerNight: number;
  cleaningFee?: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  amenities: string[];
  images: string[];
  rules: {
    checkInTime: string;
    checkOutTime: string;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    partiesAllowed: boolean;
  };
  minimumStay?: number;
  instantBooking?: boolean;
}

export class PropertyService {
  constructor(
    private readonly propertyRepository: IPropertyRepository,
    private readonly userRepository: IUserRepository,
    private readonly bookingRepository: IBookingRepository
  ) {}

  async createProperty(dto: CreatePropertyDTO): Promise<Property> {
    // Validate host exists and can list properties
    const host = await this.userRepository.findById(dto.hostId);
    if (!host) {
      throw new Error('Host not found');
    }

    if (!host.canListProperties()) {
      throw new Error('Host is not verified to list properties');
    }

    // Create value objects
    const address = Address.create(dto.address);
    const basePrice = Money.create(dto.pricePerNight, 'QAR');
    const cleaningFee = dto.cleaningFee ? Money.create(dto.cleaningFee, 'QAR') : undefined;

    // Map amenities to Amenity objects
    const amenities = dto.amenities.map((name, index) => ({
      id: `amenity_${index}`,
      name,
      category: 'feature' as const,
    }));

    // Create property entity
    const property = Property.create({
      hostId: dto.hostId,
      title: dto.title,
      description: dto.description,
      type: dto.type,
      address,
      basePrice,
      cleaningFee,
      maxGuests: dto.maxGuests,
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      beds: dto.beds,
      amenities,
      rules: dto.rules,
      images: dto.images,
      minimumStay: dto.minimumStay || 1,
      instantBooking: dto.instantBooking || false,
    });

    // Save property
    return await this.propertyRepository.create(property);
  }

  async publishProperty(propertyId: string, hostId: string): Promise<Property> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    if (!property.isOwnedBy(hostId)) {
      throw new Error('Unauthorized: You do not own this property');
    }

    property.publish();
    return await this.propertyRepository.update(property);
  }

  async searchProperties(criteria: PropertySearchCriteria): Promise<Property[]> {
    let properties = await this.propertyRepository.search(criteria);

    // Filter by availability if date range provided
    if (criteria.dateRange) {
      properties = await this.filterAvailableProperties(properties, criteria.dateRange);
    }

    return properties;
  }

  private async filterAvailableProperties(
    properties: Property[],
    dateRange: DateRange
  ): Promise<Property[]> {
    const availableProperties: Property[] = [];

    for (const property of properties) {
      const isAvailable = await this.bookingRepository.isPropertyAvailable(
        property.id,
        dateRange
      );
      if (isAvailable) {
        availableProperties.push(property);
      }
    }

    return availableProperties;
  }

  async getPropertyById(id: string): Promise<Property | null> {
    return await this.propertyRepository.findById(id);
  }

  async getHostProperties(hostId: string): Promise<Property[]> {
    return await this.propertyRepository.findByHostId(hostId);
  }

  async updateProperty(property: Property, hostId: string): Promise<Property> {
    if (!property.isOwnedBy(hostId)) {
      throw new Error('Unauthorized: You do not own this property');
    }
    return await this.propertyRepository.update(property);
  }

  // Add more service methods as needed...
}
```

---

### 5. User Service

**File:** `src/application/services/UserService.ts`

```typescript
import { User, UserRole } from '@/domain/entities/User';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { Email } from '@/domain/value-objects/Email';
import { PhoneNumber } from '@/domain/value-objects/PhoneNumber';

export interface CreateUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  countryCode?: string;
  clerkId: string;
}

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async createUser(dto: CreateUserDTO): Promise<User> {
    // Check if user already exists
    const email = Email.create(dto.email);
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create phone number if provided
    const phoneNumber = dto.phone && dto.countryCode
      ? PhoneNumber.create(dto.phone, dto.countryCode)
      : undefined;

    // Create user entity
    const user = User.create({
      email,
      phoneNumber,
      profile: {
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      clerkId: dto.clerkId,
    });

    // Save user
    return await this.userRepository.create(user);
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const emailVO = Email.create(email);
    return await this.userRepository.findByEmail(emailVO);
  }

  async becomeHost(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isVerified()) {
      throw new Error('User must be verified before becoming a host');
    }

    user.addRole(UserRole.HOST);
    return await this.userRepository.update(user);
  }

  async verifyEmail(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.verifyEmail();
    return await this.userRepository.update(user);
  }

  async verifyPhone(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.verifyPhone();
    return await this.userRepository.update(user);
  }

  // Add more service methods...
}
```

---

### 6. Update DI Container

**File:** `src/infrastructure/di/Container.ts`

Add the new repositories and services:

```typescript
import { PrismaPropertyRepository } from '../repositories/PrismaPropertyRepository';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { PropertyService } from '@/application/services/PropertyService';
import { UserService } from '@/application/services/UserService';

// In the ServiceContainer class, add:

private _propertyRepository?: IPropertyRepository;
private _userRepository?: IUserRepository;
private _propertyService?: PropertyService;
private _userService?: UserService;

public getPropertyRepository(): IPropertyRepository {
  if (!this._propertyRepository) {
    this._propertyRepository = new PrismaPropertyRepository(this.prisma);
  }
  return this._propertyRepository;
}

public getUserRepository(): IUserRepository {
  if (!this._userRepository) {
    this._userRepository = new PrismaUserRepository(this.prisma);
  }
  return this._userRepository;
}

public getPropertyService(): PropertyService {
  if (!this._propertyService) {
    this._propertyService = new PropertyService(
      this.getPropertyRepository(),
      this.getUserRepository(),
      this.getBookingRepository()
    );
  }
  return this._propertyService;
}

public getUserService(): UserService {
  if (!this._userService) {
    this._userService = new UserService(
      this.getUserRepository()
    );
  }
  return this._userService;
}

// Export convenience functions:
export const getPropertyService = () => container.getPropertyService();
export const getUserService = () => container.getUserService();
```

---

### 7. Create Property API Routes

**File:** `src/app/api/v2/properties/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getPropertyService } from '@/infrastructure/di/Container';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get('location');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const guests = searchParams.get('guests');

    const propertyService = getPropertyService();
    const properties = await propertyService.searchProperties({
      location: location || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      guests: guests ? parseInt(guests) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: properties.map(p => p.toJSON()),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to search properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const propertyService = getPropertyService();
    const property = await propertyService.createProperty(body);

    return NextResponse.json({
      success: true,
      data: property.toJSON(),
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create property' },
      { status: 400 }
    );
  }
}
```

---

### 8. Create Example React Component

**File:** `src/components/examples/BookingFormExample.tsx`

```typescript
'use client';

import { useState } from 'react';

interface BookingFormProps {
  propertyId: string;
  guestId: string;
  pricePerNight: number;
}

export function BookingFormExample({ propertyId, guestId, pricePerNight }: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const checkIn = formData.get('checkIn') as string;
    const checkOut = formData.get('checkOut') as string;
    const guests = parseInt(formData.get('guests') as string);

    try {
      // Call the v2 API using OOP architecture
      const response = await fetch('/api/v2/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          guestId,
          startDate: checkIn,
          endDate: checkOut,
          guestCount: guests,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        console.log('Booking created:', result.data);
        // Redirect or show success message
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to create booking');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-green-100 text-green-800 rounded">
        Booking created successfully!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Check-in Date</label>
        <input
          type="date"
          name="checkIn"
          required
          className="mt-1 block w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Check-out Date</label>
        <input
          type="date"
          name="checkOut"
          required
          className="mt-1 block w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Number of Guests</label>
        <input
          type="number"
          name="guests"
          min="1"
          required
          className="mt-1 block w-full rounded border p-2"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating Booking...' : `Book Now - QAR ${pricePerNight}/night`}
      </button>
    </form>
  );
}
```

---

## 📋 Implementation Checklist

Use this checklist to track your progress:

- [x] Domain entities created
- [x] Value objects created
- [x] Repository interfaces defined
- [x] BookingService implemented
- [x] BookingMapper implemented
- [x] PrismaBookingRepository implemented
- [x] PropertyMapper implemented
- [x] Booking API routes (v2) created
- [x] DI Container basic setup
- [x] Documentation created

**Remaining:**

- [ ] Complete PrismaPropertyRepository (follow BookingRepository pattern)
- [ ] Complete UserMapper
- [ ] Complete PrismaUserRepository
- [ ] Complete PropertyService
- [ ] Complete UserService
- [ ] Update DI Container with new services
- [ ] Create Property API routes (v2)
- [ ] Create User API routes (v2)
- [ ] Create example React components
- [ ] Write integration tests
- [ ] Migrate existing components to use v2 APIs

---

## 🎓 Key Patterns

All implementations follow these patterns:

1. **Mapper Pattern**: Prisma ↔ Domain
2. **Repository Pattern**: Interface → Prisma implementation
3. **Service Pattern**: Orchestrates business logic
4. **DI Pattern**: Container manages dependencies
5. **API Pattern**: Route → Service → Repository → Database

---

## ⚡ Quick Commands

```bash
# Start development server
npm run dev

# Generate Prisma client
npx prisma generate

# View database
npx prisma studio
```

---

## 📚 Reference Files

- Implementation patterns: See `PrismaBookingRepository.ts`
- Mapper patterns: See `BookingMapper.ts`
- Service patterns: See `BookingService.ts`
- API patterns: See `src/app/api/v2/bookings/route.ts`

Follow these exact patterns for the remaining implementations!
