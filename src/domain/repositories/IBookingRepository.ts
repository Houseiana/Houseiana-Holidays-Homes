/**
 * Booking Repository Interface
 * Defines contract for booking data access (Repository Pattern)
 * Demonstrates: Dependency Inversion Principle, Interface Segregation
 */
import { Booking, BookingStatus } from '../entities/Booking';
import { DateRange } from '../value-objects/DateRange';

export interface IBookingRepository {
  /**
   * Save a new booking
   */
  create(booking: Booking): Promise<Booking>;

  /**
   * Update an existing booking
   */
  update(booking: Booking): Promise<Booking>;

  /**
   * Find booking by ID
   */
  findById(id: string): Promise<Booking | null>;

  /**
   * Find bookings by property ID
   */
  findByPropertyId(propertyId: string): Promise<Booking[]>;

  /**
   * Find bookings by guest ID
   */
  findByGuestId(guestId: string): Promise<Booking[]>;

  /**
   * Find bookings by host ID
   */
  findByHostId(hostId: string): Promise<Booking[]>;

  /**
   * Find bookings by status
   */
  findByStatus(status: BookingStatus): Promise<Booking[]>;

  /**
   * Find overlapping bookings for a property in a date range
   */
  findOverlappingBookings(
    propertyId: string,
    dateRange: DateRange
  ): Promise<Booking[]>;

  /**
   * Find upcoming bookings for a guest
   */
  findUpcomingBookingsByGuestId(guestId: string): Promise<Booking[]>;

  /**
   * Find current bookings (in progress) for a guest
   */
  findCurrentBookingsByGuestId(guestId: string): Promise<Booking[]>;

  /**
   * Find past bookings for a guest
   */
  findPastBookingsByGuestId(guestId: string): Promise<Booking[]>;

  /**
   * Count total bookings for a property
   */
  countByPropertyId(propertyId: string): Promise<number>;

  /**
   * Count total bookings for a host
   */
  countByHostId(hostId: string): Promise<number>;

  /**
   * Delete a booking (soft delete recommended)
   */
  delete(id: string): Promise<void>;

  /**
   * Check if property is available for booking in date range
   */
  isPropertyAvailable(
    propertyId: string,
    dateRange: DateRange,
    excludeBookingId?: string
  ): Promise<boolean>;
}
