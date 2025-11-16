/**
 * Booking Entity
 * Rich domain entity with state machine and business logic
 * Demonstrates OOP principles: Encapsulation, Inheritance, Polymorphism
 */
import { BaseEntity } from './BaseEntity';
import { Money } from '../value-objects/Money';
import { DateRange } from '../value-objects/DateRange';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum CancellationPolicy {
  FLEXIBLE = 'FLEXIBLE',
  MODERATE = 'MODERATE',
  STRICT = 'STRICT',
}

interface BookingProps {
  id: string;
  propertyId: string;
  guestId: string;
  hostId: string;
  dateRange: DateRange;
  pricePerNight: Money;
  totalPrice: Money;
  guestCount: number;
  status: BookingStatus;
  cancellationPolicy: CancellationPolicy;
  createdAt?: Date;
  updatedAt?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export class Booking extends BaseEntity {
  private _propertyId: string;
  private _guestId: string;
  private _hostId: string;
  private _dateRange: DateRange;
  private _pricePerNight: Money;
  private _totalPrice: Money;
  private _guestCount: number;
  private _status: BookingStatus;
  private _cancellationPolicy: CancellationPolicy;
  private _confirmedAt?: Date;
  private _cancelledAt?: Date;
  private _cancellationReason?: string;

  private constructor(props: BookingProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._propertyId = props.propertyId;
    this._guestId = props.guestId;
    this._hostId = props.hostId;
    this._dateRange = props.dateRange;
    this._pricePerNight = props.pricePerNight;
    this._totalPrice = props.totalPrice;
    this._guestCount = props.guestCount;
    this._status = props.status;
    this._cancellationPolicy = props.cancellationPolicy;
    this._confirmedAt = props.confirmedAt;
    this._cancelledAt = props.cancelledAt;
    this._cancellationReason = props.cancellationReason;
  }

  public static create(props: Omit<BookingProps, 'id' | 'status' | 'totalPrice'>): Booking {
    const totalPrice = props.pricePerNight.multiply(props.dateRange.numberOfNights);

    const booking = new Booking({
      ...props,
      id: crypto.randomUUID(),
      status: BookingStatus.PENDING,
      totalPrice,
    });

    booking.validate();
    return booking;
  }

  public static reconstitute(props: BookingProps): Booking {
    return new Booking(props);
  }

  // Getters (Encapsulation)
  public get propertyId(): string {
    return this._propertyId;
  }

  public get guestId(): string {
    return this._guestId;
  }

  public get hostId(): string {
    return this._hostId;
  }

  public get dateRange(): DateRange {
    return this._dateRange;
  }

  public get pricePerNight(): Money {
    return this._pricePerNight;
  }

  public get totalPrice(): Money {
    return this._totalPrice;
  }

  public get guestCount(): number {
    return this._guestCount;
  }

  public get status(): BookingStatus {
    return this._status;
  }

  public get cancellationPolicy(): CancellationPolicy {
    return this._cancellationPolicy;
  }

  public get confirmedAt(): Date | undefined {
    return this._confirmedAt ? new Date(this._confirmedAt) : undefined;
  }

  public get cancelledAt(): Date | undefined {
    return this._cancelledAt ? new Date(this._cancelledAt) : undefined;
  }

  public get cancellationReason(): string | undefined {
    return this._cancellationReason;
  }

  // Business Logic Methods (Rich Domain Model)

  /**
   * Confirm the booking
   * State transition: PENDING -> CONFIRMED
   */
  public confirm(): void {
    if (this._status !== BookingStatus.PENDING) {
      throw new Error('Only pending bookings can be confirmed');
    }

    if (this._dateRange.isInPast()) {
      throw new Error('Cannot confirm booking with past dates');
    }

    this._status = BookingStatus.CONFIRMED;
    this._confirmedAt = new Date();
    this.touch();
  }

  /**
   * Reject the booking
   * State transition: PENDING -> REJECTED
   */
  public reject(reason: string): void {
    if (this._status !== BookingStatus.PENDING) {
      throw new Error('Only pending bookings can be rejected');
    }

    if (!reason?.trim()) {
      throw new Error('Rejection reason is required');
    }

    this._status = BookingStatus.REJECTED;
    this._cancellationReason = reason;
    this.touch();
  }

  /**
   * Cancel the booking with refund calculation
   * State transition: PENDING/CONFIRMED -> CANCELLED
   */
  public cancel(reason: string, cancelledBy: 'guest' | 'host'): {
    refundAmount: Money;
    refundPercentage: number;
  } {
    if (!this.canBeCancelled()) {
      throw new Error(`Booking cannot be cancelled in ${this._status} status`);
    }

    if (!reason?.trim()) {
      throw new Error('Cancellation reason is required');
    }

    const refundPercentage = this.calculateRefundPercentage(cancelledBy);
    const refundAmount = this._totalPrice.multiply(refundPercentage / 100);

    this._status = BookingStatus.CANCELLED;
    this._cancelledAt = new Date();
    this._cancellationReason = reason;
    this.touch();

    return {
      refundAmount,
      refundPercentage,
    };
  }

  /**
   * Complete the booking
   * State transition: CONFIRMED -> COMPLETED
   */
  public complete(): void {
    if (this._status !== BookingStatus.CONFIRMED) {
      throw new Error('Only confirmed bookings can be completed');
    }

    if (!this._dateRange.isInPast()) {
      throw new Error('Cannot complete booking before end date');
    }

    this._status = BookingStatus.COMPLETED;
    this.touch();
  }

  /**
   * Check if booking can be cancelled based on current status
   */
  public canBeCancelled(): boolean {
    return (
      this._status === BookingStatus.PENDING || this._status === BookingStatus.CONFIRMED
    );
  }

  /**
   * Check if booking can be modified
   */
  public canBeModified(): boolean {
    return this._status === BookingStatus.PENDING && this._dateRange.isInFuture();
  }

  /**
   * Calculate refund percentage based on cancellation policy and timing
   */
  private calculateRefundPercentage(cancelledBy: 'guest' | 'host'): number {
    // Host cancellations always give full refund
    if (cancelledBy === 'host') {
      return 100;
    }

    const daysUntilCheckIn = this.getDaysUntilCheckIn();

    switch (this._cancellationPolicy) {
      case CancellationPolicy.FLEXIBLE:
        // Full refund if cancelled 24+ hours before check-in
        return daysUntilCheckIn >= 1 ? 100 : 0;

      case CancellationPolicy.MODERATE:
        // Full refund if cancelled 5+ days before
        // 50% refund if cancelled 1-4 days before
        if (daysUntilCheckIn >= 5) return 100;
        if (daysUntilCheckIn >= 1) return 50;
        return 0;

      case CancellationPolicy.STRICT:
        // Full refund if cancelled 14+ days before
        // 50% refund if cancelled 7-13 days before
        // No refund if cancelled less than 7 days before
        if (daysUntilCheckIn >= 14) return 100;
        if (daysUntilCheckIn >= 7) return 50;
        return 0;

      default:
        return 0;
    }
  }

  /**
   * Get days until check-in date
   */
  private getDaysUntilCheckIn(): number {
    const now = new Date();
    const checkIn = this._dateRange.startDate;
    const diff = checkIn.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if booking overlaps with another booking's date range
   */
  public overlaps(other: Booking): boolean {
    // Only check if both bookings are for the same property
    if (this._propertyId !== other._propertyId) {
      return false;
    }

    // Only check active bookings (not cancelled or rejected)
    const activeStatuses = [
      BookingStatus.PENDING,
      BookingStatus.CONFIRMED,
      BookingStatus.COMPLETED,
    ];

    if (!activeStatuses.includes(this._status) || !activeStatuses.includes(other._status)) {
      return false;
    }

    return this._dateRange.overlaps(other._dateRange);
  }

  /**
   * Validate booking business rules
   */
  public validate(): void {
    if (!this._propertyId?.trim()) {
      throw new Error('Property ID is required');
    }

    if (!this._guestId?.trim()) {
      throw new Error('Guest ID is required');
    }

    if (!this._hostId?.trim()) {
      throw new Error('Host ID is required');
    }

    if (this._guestCount < 1) {
      throw new Error('Guest count must be at least 1');
    }

    if (this._guestCount > 50) {
      throw new Error('Guest count cannot exceed 50');
    }

    if (!this._dateRange.isInFuture()) {
      throw new Error('Booking dates must be in the future');
    }

    // Minimum stay of 1 night
    if (this._dateRange.numberOfNights < 1) {
      throw new Error('Minimum stay is 1 night');
    }

    // Maximum advance booking of 2 years
    const maxDaysInAdvance = 730; // 2 years
    const daysUntilCheckIn = this.getDaysUntilCheckIn();
    if (daysUntilCheckIn > maxDaysInAdvance) {
      throw new Error('Cannot book more than 2 years in advance');
    }
  }

  /**
   * Get booking summary for display
   */
  public getSummary(): string {
    const nights = this._dateRange.numberOfNights;
    const nightText = nights === 1 ? 'night' : 'nights';
    return `${nights} ${nightText} for ${this._guestCount} guest(s) - ${this._totalPrice.format()}`;
  }

  /**
   * Check if booking is active (not cancelled/rejected/completed)
   */
  public isActive(): boolean {
    return (
      this._status === BookingStatus.PENDING || this._status === BookingStatus.CONFIRMED
    );
  }

  /**
   * Check if booking is upcoming
   */
  public isUpcoming(): boolean {
    return this.isActive() && this._dateRange.isInFuture();
  }

  /**
   * Check if booking is current (in progress)
   */
  public isCurrent(): boolean {
    return this._status === BookingStatus.CONFIRMED && this._dateRange.isCurrent();
  }

  /**
   * Serialize to JSON
   */
  public toJSON(): Record<string, any> {
    return {
      id: this._id,
      propertyId: this._propertyId,
      guestId: this._guestId,
      hostId: this._hostId,
      dateRange: this._dateRange.toJSON(),
      pricePerNight: this._pricePerNight.toJSON(),
      totalPrice: this._totalPrice.toJSON(),
      guestCount: this._guestCount,
      status: this._status,
      cancellationPolicy: this._cancellationPolicy,
      confirmedAt: this._confirmedAt?.toISOString(),
      cancelledAt: this._cancelledAt?.toISOString(),
      cancellationReason: this._cancellationReason,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
