/**
 * Booking Service
 * Application layer service for booking business logic
 * Demonstrates: Dependency Injection, Service Layer Pattern, Business Logic Orchestration
 */
import { Booking, BookingStatus, CancellationPolicy } from '@/domain/entities/Booking';
import { IBookingRepository } from '@/domain/repositories/IBookingRepository';
import { IPropertyRepository } from '@/domain/repositories/IPropertyRepository';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { DateRange } from '@/domain/value-objects/DateRange';
import { Money } from '@/domain/value-objects/Money';

export interface CreateBookingDTO {
  propertyId: string;
  guestId: string;
  startDate: Date | string;
  endDate: Date | string;
  guestCount: number;
}

export interface BookingServiceDependencies {
  bookingRepository: IBookingRepository;
  propertyRepository: IPropertyRepository;
  userRepository: IUserRepository;
}

export class BookingService {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly propertyRepository: IPropertyRepository,
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Create a new booking
   * Orchestrates business logic across multiple entities
   */
  async createBooking(dto: CreateBookingDTO): Promise<Booking> {
    // 1. Validate guest exists and can book
    const guest = await this.userRepository.findById(dto.guestId);
    if (!guest) {
      throw new Error('Guest not found');
    }

    if (!guest.canBook()) {
      throw new Error('Guest is not allowed to make bookings');
    }

    // 2. Validate property exists and is available
    const property = await this.propertyRepository.findById(dto.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    if (!property.isAvailableForBooking()) {
      throw new Error('Property is not available for booking');
    }

    // 3. Validate guest count
    if (!property.canAccommodate(dto.guestCount)) {
      throw new Error(`Property can only accommodate up to ${property.maxGuests} guests`);
    }

    // 4. Create date range and validate
    const dateRange = DateRange.create(dto.startDate, dto.endDate);

    // 5. Check availability in database
    const isAvailable = await this.bookingRepository.isPropertyAvailable(
      dto.propertyId,
      dateRange
    );

    if (!isAvailable) {
      throw new Error('Property is not available for the selected dates');
    }

    // 6. Calculate pricing
    const pricing = property.calculateTotalPrice(dateRange, dto.guestCount);

    // 7. Create booking entity
    const booking = Booking.create({
      propertyId: dto.propertyId,
      guestId: dto.guestId,
      hostId: property.hostId,
      dateRange,
      pricePerNight: pricing.breakdown.pricePerNight,
      guestCount: dto.guestCount,
      cancellationPolicy: CancellationPolicy.MODERATE, // Could be configurable per property
    });

    // 8. Save booking
    const savedBooking = await this.bookingRepository.create(booking);

    return savedBooking;
  }

  /**
   * Confirm a booking
   */
  async confirmBooking(bookingId: string, hostId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Verify host owns the property
    const property = await this.propertyRepository.findById(booking.propertyId);
    if (!property || !property.isOwnedBy(hostId)) {
      throw new Error('Unauthorized: You do not own this property');
    }

    // Confirm the booking using domain logic
    booking.confirm();

    // Save updated booking
    return await this.bookingRepository.update(booking);
  }

  /**
   * Reject a booking
   */
  async rejectBooking(
    bookingId: string,
    hostId: string,
    reason: string
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Verify host owns the property
    const property = await this.propertyRepository.findById(booking.propertyId);
    if (!property || !property.isOwnedBy(hostId)) {
      throw new Error('Unauthorized: You do not own this property');
    }

    // Reject the booking using domain logic
    booking.reject(reason);

    // Save updated booking
    return await this.bookingRepository.update(booking);
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(
    bookingId: string,
    userId: string,
    reason: string
  ): Promise<{ booking: Booking; refundAmount: Money; refundPercentage: number }> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Determine who is cancelling
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let cancelledBy: 'guest' | 'host';

    if (booking.guestId === userId) {
      cancelledBy = 'guest';
    } else {
      // Verify user is the host
      const property = await this.propertyRepository.findById(booking.propertyId);
      if (!property || !property.isOwnedBy(userId)) {
        throw new Error('Unauthorized: You cannot cancel this booking');
      }
      cancelledBy = 'host';
    }

    // Cancel the booking using domain logic
    const { refundAmount, refundPercentage } = booking.cancel(reason, cancelledBy);

    // Save updated booking
    const updatedBooking = await this.bookingRepository.update(booking);

    // TODO: Process refund through payment service

    return {
      booking: updatedBooking,
      refundAmount,
      refundPercentage,
    };
  }

  /**
   * Complete a booking (called after check-out date passes)
   */
  async completeBooking(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Complete the booking using domain logic
    booking.complete();

    // Save updated booking
    const updatedBooking = await this.bookingRepository.update(booking);

    // TODO: Trigger payout to host
    // TODO: Request review from guest

    return updatedBooking;
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<Booking | null> {
    return await this.bookingRepository.findById(bookingId);
  }

  /**
   * Get all bookings for a guest
   */
  async getGuestBookings(guestId: string): Promise<{
    upcoming: Booking[];
    current: Booking[];
    past: Booking[];
  }> {
    const [upcoming, current, past] = await Promise.all([
      this.bookingRepository.findUpcomingBookingsByGuestId(guestId),
      this.bookingRepository.findCurrentBookingsByGuestId(guestId),
      this.bookingRepository.findPastBookingsByGuestId(guestId),
    ]);

    return { upcoming, current, past };
  }

  /**
   * Get all bookings for a host
   */
  async getHostBookings(hostId: string): Promise<Booking[]> {
    return await this.bookingRepository.findByHostId(hostId);
  }

  /**
   * Get bookings for a specific property
   */
  async getPropertyBookings(propertyId: string): Promise<Booking[]> {
    return await this.bookingRepository.findByPropertyId(propertyId);
  }

  /**
   * Check if property is available for booking
   */
  async checkAvailability(
    propertyId: string,
    startDate: Date | string,
    endDate: Date | string
  ): Promise<boolean> {
    const dateRange = DateRange.create(startDate, endDate);
    return await this.bookingRepository.isPropertyAvailable(propertyId, dateRange);
  }

  /**
   * Get overlapping bookings (for calendar view)
   */
  async getOverlappingBookings(
    propertyId: string,
    startDate: Date | string,
    endDate: Date | string
  ): Promise<Booking[]> {
    const dateRange = DateRange.create(startDate, endDate);
    return await this.bookingRepository.findOverlappingBookings(propertyId, dateRange);
  }

  /**
   * Get pending bookings (requiring host action)
   */
  async getPendingBookings(hostId: string): Promise<Booking[]> {
    const allBookings = await this.bookingRepository.findByHostId(hostId);
    return allBookings.filter(booking => booking.status === BookingStatus.PENDING);
  }

  /**
   * Get host statistics
   */
  async getHostStatistics(hostId: string): Promise<{
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    completedBookings: number;
  }> {
    const bookings = await this.bookingRepository.findByHostId(hostId);

    return {
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
      cancelledBookings: bookings.filter(b => b.status === BookingStatus.CANCELLED).length,
      completedBookings: bookings.filter(b => b.status === BookingStatus.COMPLETED).length,
    };
  }

  /**
   * Delete a booking permanently
   * Only allowed for cancelled or rejected bookings
   */
  async deleteBooking(bookingId: string): Promise<void> {
    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Only allow deletion of cancelled or rejected bookings
    const allowedStatuses = [BookingStatus.CANCELLED, BookingStatus.REJECTED];
    if (!allowedStatuses.includes(booking.status)) {
      throw new Error('Only cancelled or rejected bookings can be deleted. Please cancel the booking first.');
    }

    // Permanently delete from database
    await this.bookingRepository.delete(bookingId);
  }
}
