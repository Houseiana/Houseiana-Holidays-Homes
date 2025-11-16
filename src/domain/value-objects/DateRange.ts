/**
 * DateRange Value Object
 * Encapsulates date range logic for bookings
 * Demonstrates business logic in value objects
 */
export class DateRange {
  private readonly _startDate: Date;
  private readonly _endDate: Date;

  private constructor(startDate: Date, endDate: Date) {
    this._startDate = startDate;
    this._endDate = endDate;
  }

  public static create(startDate: Date | string, endDate: Date | string): DateRange {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    if (isNaN(start.getTime())) {
      throw new Error('Invalid start date');
    }

    if (isNaN(end.getTime())) {
      throw new Error('Invalid end date');
    }

    if (start >= end) {
      throw new Error('Start date must be before end date');
    }

    return new DateRange(start, end);
  }

  public get startDate(): Date {
    return new Date(this._startDate); // Return copy for immutability
  }

  public get endDate(): Date {
    return new Date(this._endDate);
  }

  public get numberOfDays(): number {
    const diff = this._endDate.getTime() - this._startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  public get numberOfNights(): number {
    return this.numberOfDays;
  }

  public overlaps(other: DateRange): boolean {
    return this._startDate < other._endDate && this._endDate > other._startDate;
  }

  public contains(date: Date): boolean {
    return date >= this._startDate && date <= this._endDate;
  }

  public containsRange(other: DateRange): boolean {
    return this._startDate <= other._startDate && this._endDate >= other._endDate;
  }

  public isInPast(): boolean {
    return this._endDate < new Date();
  }

  public isInFuture(): boolean {
    return this._startDate > new Date();
  }

  public isCurrent(): boolean {
    const now = new Date();
    return this._startDate <= now && this._endDate >= now;
  }

  public equals(other: DateRange): boolean {
    return (
      this._startDate.getTime() === other._startDate.getTime() &&
      this._endDate.getTime() === other._endDate.getTime()
    );
  }

  public toString(): string {
    return `${this._startDate.toISOString()} - ${this._endDate.toISOString()}`;
  }

  public toJSON(): { startDate: string; endDate: string; nights: number } {
    return {
      startDate: this._startDate.toISOString(),
      endDate: this._endDate.toISOString(),
      nights: this.numberOfNights,
    };
  }
}
