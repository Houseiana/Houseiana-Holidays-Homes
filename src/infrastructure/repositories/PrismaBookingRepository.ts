/**
 * Prisma Booking Repository
 * Concrete implementation of IBookingRepository using Prisma
 * Demonstrates: Repository Pattern, Dependency Inversion Principle
 */
import { PrismaClient } from '@prisma/client';
import { IBookingRepository } from '@/domain/repositories/IBookingRepository';
import { Booking, BookingStatus } from '@/domain/entities/Booking';
import { DateRange } from '@/domain/value-objects/DateRange';
import { BookingMapper } from '../mappers/BookingMapper';

export class PrismaBookingRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Helper method to get base where clause that excludes soft-deleted records
   */
  private getBaseWhereClause() {
    return {
      deletedAt: null,
    };
  }

  async create(booking: Booking): Promise<Booking> {
    const prismaData = BookingMapper.toPrisma(booking);

    const created = await this.prisma.booking.create({
      data: prismaData,
      include: {
        property: {
          select: {
            hostId: true,
          },
        },
      },
    });

    return BookingMapper.toDomain(created);
  }

  async update(booking: Booking): Promise<Booking> {
    const prismaData = BookingMapper.toPrisma(booking);

    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: prismaData,
      include: {
        property: {
          select: {
            hostId: true,
          },
        },
      },
    });

    return BookingMapper.toDomain(updated);
  }

  async findById(id: string): Promise<Booking | null> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id,
        ...this.getBaseWhereClause(),
      },
      include: {
        property: {
          select: {
            hostId: true,
          },
        },
      },
    });

    if (!booking) return null;

    return BookingMapper.toDomain(booking);
  }

  async findByPropertyId(propertyId: string): Promise<Booking[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        propertyId,
        ...this.getBaseWhereClause(),
      },
      include: {
        property: {
          select: {
            hostId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return BookingMapper.toDomainList(bookings);
  }

  async findByGuestId(guestId: string): Promise<Booking[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        guestId,
        ...this.getBaseWhereClause(),
      },
      include: {
        property: {
          select: {
            hostId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return BookingMapper.toDomainList(bookings);
  }

  async findByHostId(hostId: string): Promise<Booking[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        ...this.getBaseWhereClause(),
        property: {
          hostId,
        },
      },
      include: {
        property: {
          select: {
            hostId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return BookingMapper.toDomainList(bookings);
  }

  async findByStatus(status: BookingStatus): Promise<Booking[]> {
    const prismaStatus = this.mapStatusToPrisma(status);

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: prismaStatus,
        ...this.getBaseWhereClause(),
      },
      include: {
        property: {
          select: {
            hostId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return BookingMapper.toDomainList(bookings);
  }

  async findOverlappingBookings(
    propertyId: string,
    dateRange: DateRange
  ): Promise<Booking[]> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        propertyId,
        ...this.getBaseWhereClause(),
        status: {
          in: ['PENDING', 'CONFIRMED', 'COMPLETED'],
        },
        OR: [
          {
            // Booking starts within the date range
            checkIn: {
              gte: dateRange.startDate,
              lt: dateRange.endDate,
            },
          },
          {
            // Booking ends within the date range
            checkOut: {
              gt: dateRange.startDate,
              lte: dateRange.endDate,
            },
          },
          {
            // Booking completely contains the date range
            AND: [
              {
                checkIn: {
                  lte: dateRange.startDate,
                },
              },
              {
                checkOut: {
                  gte: dateRange.endDate,
                },
              },
            ],
          },
        ],
      },
      include: {
        property: {
          select: {
            hostId: true,
          },
        },
      },
    });

    return BookingMapper.toDomainList(bookings);
  }

  async findUpcomingBookingsByGuestId(guestId: string): Promise<Booking[]> {
    const now = new Date();

    const bookings = await this.prisma.booking.findMany({
      where: {
        guestId,
        ...this.getBaseWhereClause(),
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        checkIn: {
          gt: now,
        },
      },
      include: {
        property: {
          select: {
            hostId: true,
          },
        },
      },
      orderBy: { checkIn: 'asc' },
    });

    return BookingMapper.toDomainList(bookings);
  }

  async findCurrentBookingsByGuestId(guestId: string): Promise<Booking[]> {
    const now = new Date();

    const bookings = await this.prisma.booking.findMany({
      where: {
        guestId,
        ...this.getBaseWhereClause(),
        status: 'CONFIRMED',
        checkIn: {
          lte: now,
        },
        checkOut: {
          gte: now,
        },
      },
      include: {
        property: {
          select: {
            hostId: true,
          },
        },
      },
    });

    return BookingMapper.toDomainList(bookings);
  }

  async findPastBookingsByGuestId(guestId: string): Promise<Booking[]> {
    const now = new Date();

    const bookings = await this.prisma.booking.findMany({
      where: {
        guestId,
        ...this.getBaseWhereClause(),
        checkOut: {
          lt: now,
        },
      },
      include: {
        property: {
          select: {
            hostId: true,
          },
        },
      },
      orderBy: { checkOut: 'desc' },
    });

    return BookingMapper.toDomainList(bookings);
  }

  async countByPropertyId(propertyId: string): Promise<number> {
    return await this.prisma.booking.count({
      where: {
        propertyId,
        ...this.getBaseWhereClause(),
      },
    });
  }

  async countByHostId(hostId: string): Promise<number> {
    return await this.prisma.booking.count({
      where: {
        ...this.getBaseWhereClause(),
        property: {
          hostId,
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    // Soft delete: Set deletedAt timestamp instead of permanent deletion
    await this.prisma.booking.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async isPropertyAvailable(
    propertyId: string,
    dateRange: DateRange,
    excludeBookingId?: string
  ): Promise<boolean> {
    const overlappingBookings = await this.prisma.booking.findMany({
      where: {
        propertyId,
        ...this.getBaseWhereClause(),
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        status: {
          in: ['PENDING', 'CONFIRMED', 'COMPLETED'],
        },
        OR: [
          {
            checkIn: {
              gte: dateRange.startDate,
              lt: dateRange.endDate,
            },
          },
          {
            checkOut: {
              gt: dateRange.startDate,
              lte: dateRange.endDate,
            },
          },
          {
            AND: [
              {
                checkIn: {
                  lte: dateRange.startDate,
                },
              },
              {
                checkOut: {
                  gte: dateRange.endDate,
                },
              },
            ],
          },
        ],
      },
    });

    return overlappingBookings.length === 0;
  }

  /**
   * Helper method to map domain status to Prisma status
   */
  private mapStatusToPrisma(status: BookingStatus): string {
    const statusMap: Record<BookingStatus, string> = {
      [BookingStatus.PENDING]: 'PENDING',
      [BookingStatus.CONFIRMED]: 'CONFIRMED',
      [BookingStatus.CANCELLED]: 'CANCELLED',
      [BookingStatus.COMPLETED]: 'COMPLETED',
      [BookingStatus.REJECTED]: 'REJECTED',
    };

    return statusMap[status];
  }
}
