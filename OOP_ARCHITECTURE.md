# OOP Architecture - Houseiana Platform

## Overview

This document describes the new Object-Oriented architecture being built in parallel to the existing codebase. This allows for gradual migration without breaking the running application.

## Architecture Layers

```
src/
├── domain/              # Domain Layer (Business Logic)
│   ├── entities/        # Domain Entities (rich objects with behavior)
│   ├── value-objects/   # Value Objects (immutable, validated data)
│   ├── services/        # Domain Services (complex business logic)
│   └── events/          # Domain Events (decoupling)
│
├── application/         # Application Layer (Use Cases)
│   ├── services/        # Application Services (orchestration)
│   ├── commands/        # Commands (write operations)
│   ├── queries/         # Queries (read operations)
│   └── dtos/            # Data Transfer Objects
│
├── infrastructure/      # Infrastructure Layer (Technical Details)
│   ├── persistence/     # Database, Repositories
│   ├── http/            # HTTP Client abstraction
│   ├── messaging/       # Email, SMS, Push notifications
│   └── caching/         # Cache abstraction
│
└── presentation/        # Presentation Layer (UI)
    ├── components/      # React components (UI only!)
    └── hooks/           # React hooks (UI state only!)
```

---

## 1. Value Objects Layer

### What are Value Objects?

Value Objects are **immutable objects** that represent concepts with **no identity**, only defined by their values. They contain:
- ✅ Validation logic
- ✅ Business rules
- ✅ Formatting methods
- ✅ Comparison methods
- ❌ NO database ID
- ❌ NO mutable state

### Created Value Objects

#### 1.1 Money
**Location:** `src/domain/value-objects/Money.ts`

**Purpose:** Encapsulates monetary values with currency handling

**OOP Principles Demonstrated:**
- **Encapsulation:** Private fields, public getters
- **Immutability:** All operations return new instances
- **Validation:** Ensures amounts are never negative
- **Business Logic:** add(), subtract(), multiply(), divide()

**Usage Example:**
```typescript
import { Money } from '@/domain/value-objects';

// ✅ GOOD: Using Money value object
const price = Money.create(500, 'QAR');
const discount = Money.create(50, 'QAR');
const finalPrice = price.subtract(discount); // 450 QAR

// Formatting
console.log(finalPrice.format('en-QA')); // "QAR 450.00"

// Business logic
if (finalPrice.isGreaterThan(Money.create(400, 'QAR'))) {
  console.log('Above threshold');
}

// ❌ BAD: Old way (primitive obsession)
const oldPrice = 500; // What currency? Can be negative? No validation!
const oldDiscount = 50;
const oldFinal = oldPrice - oldDiscount; // Error-prone
```

#### 1.2 Email
**Location:** `src/domain/value-objects/Email.ts`

**Purpose:** Encapsulates email validation and formatting

**OOP Principles:**
- **Validation:** Regex validation, length checks
- **Normalization:** Automatic lowercase and trim
- **Domain Logic:** Extract domain, local part

**Usage Example:**
```typescript
import { Email } from '@/domain/value-objects';

// ✅ GOOD: Validated email
try {
  const email = Email.create('user@example.com');
  console.log(email.domain); // 'example.com'
  console.log(email.localPart); // 'user'
} catch (error) {
  console.error('Invalid email'); // Validation failed
}

// ❌ BAD: Old way
const oldEmail = 'USER@EXAMPLE.COM  '; // Inconsistent, not validated
```

#### 1.3 PhoneNumber
**Location:** `src/domain/value-objects/PhoneNumber.ts`

**Purpose:** Phone number validation and international formatting

**Usage Example:**
```typescript
import { PhoneNumber } from '@/domain/value-objects';

const phone = PhoneNumber.create('12345678', '+974');
console.log(phone.format('international')); // '+974 12345678'
console.log(phone.format('national')); // '123-45678'
```

#### 1.4 DateRange
**Location:** `src/domain/value-objects/DateRange.ts`

**Purpose:** Booking date ranges with business logic

**Business Logic Methods:**
- `numberOfDays()` / `numberOfNights()` - Duration calculation
- `overlaps(other)` - Check for booking conflicts
- `contains(date)` - Check if date is in range
- `isInPast()` / `isInFuture()` / `isCurrent()` - Time checks

**Usage Example:**
```typescript
import { DateRange } from '@/domain/value-objects';

const booking1 = DateRange.create('2024-01-01', '2024-01-05');
const booking2 = DateRange.create('2024-01-04', '2024-01-08');

// Business logic in the value object!
if (booking1.overlaps(booking2)) {
  throw new Error('Booking conflict detected');
}

console.log(booking1.numberOfNights); // 4 nights
console.log(booking1.isInFuture()); // true/false
```

#### 1.5 Address
**Location:** `src/domain/value-objects/Address.ts`

**Purpose:** Complete address with geocoding support

**Usage Example:**
```typescript
import { Address } from '@/domain/value-objects';

const address = Address.create({
  street: '123 Main St',
  city: 'Doha',
  state: '',
  country: 'Qatar',
  postalCode: '12345',
  coordinates: { lat: 25.2854, lng: 51.5310 }
});

console.log(address.format('short')); // 'Doha, Qatar'
console.log(address.format('full')); // '123 Main St, Doha, 12345, Qatar'
```

---

## 2. OOP Principles Applied

### Encapsulation
**Definition:** Bundling data and methods, hiding internal implementation

**How we implement it:**
```typescript
export class Money {
  // ✅ Private fields - cannot be accessed directly
  private readonly _amount: number;
  private readonly _currency: string;

  // ✅ Controlled access through getters
  public get amount(): number {
    return this._amount;
  }

  // ✅ Validation in constructor
  private constructor(amount: number, currency: string) {
    this._amount = amount;
    this._currency = currency;
  }

  // ✅ Factory method for creation with validation
  public static create(amount: number, currency: string): Money {
    if (amount < 0) throw new Error('Amount cannot be negative');
    return new Money(amount, currency);
  }
}
```

### Abstraction
**Definition:** Hiding complex implementation, exposing only essential features

**How we implement it:**
```typescript
// User sees simple interface
const price = Money.create(100, 'QAR');
const total = price.multiply(5); // Don't need to know HOW it multiplies

// Complex logic hidden inside
private ensureSameCurrency(other: Money): void {
  if (this._currency !== other._currency) {
    throw new Error('Currency mismatch');
  }
}
```

### Immutability (Key OOP Practice)
**Definition:** Objects cannot be changed after creation

**Why it matters:**
- ✅ Thread-safe
- ✅ Prevents bugs from unexpected mutations
- ✅ Easier to reason about
- ✅ Can be safely shared

**How we implement it:**
```typescript
export class Money {
  // readonly - cannot be reassigned
  private readonly _amount: number;

  // All operations return NEW instances
  public add(other: Money): Money {
    return new Money(this._amount + other._amount, this._currency);
    // ❌ NOT: this._amount += other._amount; (mutation!)
  }
}
```

---

## 3. Migration Guide

### How to Start Using the New Architecture

#### Step 1: Replace Primitives with Value Objects

**Before (Primitive Obsession):**
```typescript
interface BookingData {
  startDate: string;
  endDate: string;
  totalPrice: number;
  currency: string;
  guestEmail: string;
}

function calculateTotal(price: number, nights: number): number {
  return price * nights; // No validation!
}
```

**After (Value Objects):**
```typescript
import { DateRange, Money, Email } from '@/domain/value-objects';

interface BookingData {
  dates: DateRange;
  totalPrice: Money;
  guestEmail: Email;
}

function calculateTotal(pricePerNight: Money, dates: DateRange): Money {
  return pricePerNight.multiply(dates.numberOfNights); // Validated, type-safe!
}
```

#### Step 2: Gradual Migration Strategy

1. **Start with new features** - Use value objects for all new code
2. **Refactor hot paths** - Replace primitives in frequently-used code
3. **Create adapters** - Convert between old and new representations
4. **Update incrementally** - One module at a time

**Example Adapter:**
```typescript
// Adapter to convert old data to new value objects
export class BookingAdapter {
  static toValueObjects(oldBooking: any) {
    return {
      dates: DateRange.create(oldBooking.startDate, oldBooking.endDate),
      totalPrice: Money.create(oldBooking.totalPrice, oldBooking.currency),
      guestEmail: Email.create(oldBooking.guestEmail),
    };
  }

  static fromValueObjects(booking: BookingData) {
    return {
      startDate: booking.dates.startDate.toISOString(),
      endDate: booking.dates.endDate.toISOString(),
      totalPrice: booking.totalPrice.amount,
      currency: booking.totalPrice.currency,
      guestEmail: booking.guestEmail.value,
    };
  }
}
```

---

## 4. Benefits Already Achieved

### Before (Procedural Code)
```typescript
// ❌ Scattered validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ❌ Duplicated logic
function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// ❌ No type safety
const price = 500; // Can be negative, no currency!
const discount = 50;
const final = price - discount; // Error prone
```

### After (OOP Architecture)
```typescript
// ✅ Centralized validation
const email = Email.create('user@example.com'); // Validated once

// ✅ Reusable behavior
const price = Money.create(500, 'QAR');
console.log(price.format()); // Format method in one place

// ✅ Type safety and business rules
const discount = Money.create(50, 'QAR');
const final = price.subtract(discount); // Type-safe, validated!
```

---

## 5. SOLID Principles Being Applied

### S - Single Responsibility Principle
**Each value object has ONE reason to change**
- `Money` - Only changes if money handling rules change
- `Email` - Only changes if email validation rules change
- `DateRange` - Only changes if date range logic changes

### O - Open/Closed Principle
**Open for extension, closed for modification**
```typescript
// Can extend Money for specialized currencies without modifying Money class
export class CryptoCurrency extends Money {
  // Extended behavior for crypto
}
```

### L - Liskov Substitution Principle
**Subtypes must be substitutable for their base types**
- All value objects can be used wherever their interface is expected

### I - Interface Segregation Principle
**Clients shouldn't depend on methods they don't use**
- Each value object has focused, cohesive methods
- No bloated interfaces

### D - Dependency Inversion Principle
**Depend on abstractions, not concretions**
- Value objects are used through their public interfaces
- Internal implementation can change without affecting users

---

## 6. Next Steps

### Completed ✅
1. Value Objects (Money, Email, PhoneNumber, DateRange, Address)
2. Value Object barrel exports
3. Architecture documentation

### In Progress 🔄
4. Domain Entities (Property, Booking, User)
5. Service Layer

### To Do ⏳
6. Repository Pattern
7. Dependency Injection
8. Application Services (Use Cases)
9. DTOs and Mappers
10. Complete migration guide

---

## 7. FAQs

**Q: Will this break my existing code?**
A: No! This is a parallel architecture. Old code continues to work.

**Q: Do I have to refactor everything at once?**
A: No! Start with new features, then gradually migrate old code.

**Q: Isn't this over-engineering?**
A: For simple projects, yes. For growing platforms like Houseiana with complex business rules, this investment pays off through:
- Reduced bugs
- Easier testing
- Better maintainability
- Faster feature development (long-term)

**Q: How do I use these in my components?**
A: Import and use them like any TypeScript class:
```typescript
import { Money, DateRange } from '@/domain/value-objects';

function PropertyCard() {
  const price = Money.create(500, 'QAR');
  return <div>{price.format()}</div>;
}
```

---

## 8. Resources

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Value Objects - Martin Fowler](https://martinfowler.com/bliki/ValueObject.html)

---

**Last Updated:** 2024
**Status:** Foundation Complete, Building Domain Layer
