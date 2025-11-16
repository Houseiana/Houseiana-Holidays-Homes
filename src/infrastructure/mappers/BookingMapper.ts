/**
 * Booking Mapper
 * Converts between Prisma models and Domain entities
 * Demonstrates: Data Transfer Object (DTO) Pattern, Separation of Concerns
 */
import { Booking as PrismaBooking, BookingStatus as PrismaBookingStatus } from '@prisma/client';
import { Booking, BookingStatus, CancellationPolicy } from '@/domain/entities/Booking';
import { DateRange } from '@/domain/value-objects/DateRange';
import { Money } from '@/domain/value-objects/Money';

export class BookingMapper {
  /**
   * Convert Prisma model to Domain entity
   */
  static toDomain(prisma: PrismaBooking & { property?: { hostId: string } }): Booking {
    // Map Prisma BookingStatus to Domain BookingStatus
    const status = this.mapStatusToDomain(prisma.status);

    // Create DateRange value object
    const dateRange = DateRange.create(prisma.checkIn, prisma.checkOut);

    // Create Money value objects
    const pricePerNight = Money.create(prisma.nightlyRate, 'QAR');
    const totalPrice = Money.create(prisma.totalPrice, 'QAR');

    // Determine hostId (from relation or need to fetch separately)
    const hostId = prisma.property?.hostId || 'unknown';

    // Reconstitute the booking entity
    return Booking.reconstitute({
      id: prisma.id,
      propertyId: prisma.propertyId,
      guestId: prisma.guestId,
      hostId: hostId,
      dateRange,
      pricePerNight,
      totalPrice,
      guestCount: prisma.guests,
      status,
      cancellationPolicy: CancellationPolicy.MODERATE, // Default, should be stored in DB
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
      confirmedAt: prisma.confirmedAt || undefined,
      cancelledAt: prisma.cancelledAt || undefined,
    });
  }

  /**
   * Convert Domain entity to Prisma model data (for create/update)
   */
  static toPrisma(domain: Booking): Omit<PrismaBooking, 'property' | 'guest'> {
    return {
      id: domain.id,
      propertyId: domain.propertyId,
      guestId: domain.guestId,
      checkIn: domain.dateRange.startDate,
      checkOut: domain.dateRange.endDate,
      nightlyRate: domain.pricePerNight.amount,
      numberOfNights: domain.dateRange.numberOfNights,
      subtotal: domain.totalPrice.amount - (domain.totalPrice.amount * 0.1), // Simplified
      cleaningFee: 0, // Should come from property
      serviceFee: domain.totalPrice.amount * 0.1, // 10% service fee
      totalPrice: domain.totalPrice.amount,
      guests: domain.guestCount,
      status: this.mapStatusToPrisma(domain.status),
      paymentStatus: 'PENDING' as any, // Default
      paymentMethod: null,
      transactionId: null,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      confirmedAt: domain.confirmedAt || null,
      cancelledAt: domain.cancelledAt || null,
    };
  }

  /**
   * Map Prisma status to Domain status
   */
  private static mapStatusToDomain(prismaStatus: PrismaBookingStatus): BookingStatus {
    const statusMap: Record<PrismaBookingStatus, BookingStatus> = {
      PENDING: BookingStatus.PENDING,
      CONFIRMED: BookingStatus.CONFIRMED,
      CANCELLED: BookingStatus.CANCELLED,
      COMPLETED: BookingStatus.COMPLETED,
      REJECTED: BookingStatus.REJECTED,
    };

    return statusMap[prismaStatus];
  }

  /**
   * Map Domain status to Prisma status
   */
  private static mapStatusToPrisma(domainStatus: BookingStatus): PrismaBookingStatus {
    const statusMap: Record<BookingStatus, PrismaBookingStatus> = {
      [BookingStatus.PENDING]: 'PENDING',
      [BookingStatus.CONFIRMED]: 'CONFIRMED',
      [BookingStatus.CANCELLED]: 'CANCELLED',
      [BookingStatus.COMPLETED]: 'COMPLETED',
      [BookingStatus.REJECTED]: 'REJECTED',
    };

    return statusMap[domainStatus];
  }

  /**
   * Convert array of Prisma models to Domain entities
   */
  static toDomainList(prismaList: (PrismaBooking & { property?: { hostId: string } })[]): Booking[] {
    return prismaList.map(prisma => this.toDomain(prisma));
  }
}
