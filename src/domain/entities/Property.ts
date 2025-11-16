/**
 * Property Entity
 * Rich domain entity with availability and pricing logic
 * Demonstrates OOP principles: Encapsulation, Abstraction, Inheritance
 */
import { BaseEntity } from './BaseEntity';
import { Money } from '../value-objects/Money';
import { Address } from '../value-objects/Address';
import { DateRange } from '../value-objects/DateRange';

export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  VILLA = 'VILLA',
  STUDIO = 'STUDIO',
  CONDO = 'CONDO',
  TOWNHOUSE = 'TOWNHOUSE',
}

export enum PropertyStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  UNLISTED = 'UNLISTED',
  SUSPENDED = 'SUSPENDED',
}

export interface Amenity {
  id: string;
  name: string;
  category: 'essential' | 'feature' | 'safety';
}

export interface PropertyRules {
  checkInTime: string; // e.g., "15:00"
  checkOutTime: string; // e.g., "11:00"
  petsAllowed: boolean;
  smokingAllowed: boolean;
  partiesAllowed: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  additionalRules?: string[];
}

interface PropertyProps {
  id: string;
  hostId: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  address: Address;
  basePrice: Money;
  cleaningFee?: Money;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  amenities: Amenity[];
  rules: PropertyRules;
  images: string[];
  minimumStay: number;
  maximumStay?: number;
  instantBooking: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  publishedAt?: Date;
}

export class Property extends BaseEntity {
  private _hostId: string;
  private _title: string;
  private _description: string;
  private _type: PropertyType;
  private _status: PropertyStatus;
  private _address: Address;
  private _basePrice: Money;
  private _cleaningFee?: Money;
  private _maxGuests: number;
  private _bedrooms: number;
  private _bathrooms: number;
  private _beds: number;
  private _amenities: Amenity[];
  private _rules: PropertyRules;
  private _images: string[];
  private _minimumStay: number;
  private _maximumStay?: number;
  private _instantBooking: boolean;
  private _publishedAt?: Date;

  private constructor(props: PropertyProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._hostId = props.hostId;
    this._title = props.title;
    this._description = props.description;
    this._type = props.type;
    this._status = props.status;
    this._address = props.address;
    this._basePrice = props.basePrice;
    this._cleaningFee = props.cleaningFee;
    this._maxGuests = props.maxGuests;
    this._bedrooms = props.bedrooms;
    this._bathrooms = props.bathrooms;
    this._beds = props.beds;
    this._amenities = props.amenities;
    this._rules = props.rules;
    this._images = props.images;
    this._minimumStay = props.minimumStay;
    this._maximumStay = props.maximumStay;
    this._instantBooking = props.instantBooking;
    this._publishedAt = props.publishedAt;
  }

  public static create(props: Omit<PropertyProps, 'id' | 'status'>): Property {
    const property = new Property({
      ...props,
      id: crypto.randomUUID(),
      status: PropertyStatus.DRAFT,
    });

    property.validate();
    return property;
  }

  public static reconstitute(props: PropertyProps): Property {
    return new Property(props);
  }

  // Getters
  public get hostId(): string {
    return this._hostId;
  }

  public get title(): string {
    return this._title;
  }

  public get description(): string {
    return this._description;
  }

  public get type(): PropertyType {
    return this._type;
  }

  public get status(): PropertyStatus {
    return this._status;
  }

  public get address(): Address {
    return this._address;
  }

  public get basePrice(): Money {
    return this._basePrice;
  }

  public get cleaningFee(): Money | undefined {
    return this._cleaningFee;
  }

  public get maxGuests(): number {
    return this._maxGuests;
  }

  public get bedrooms(): number {
    return this._bedrooms;
  }

  public get bathrooms(): number {
    return this._bathrooms;
  }

  public get beds(): number {
    return this._beds;
  }

  public get amenities(): Amenity[] {
    return [...this._amenities];
  }

  public get rules(): PropertyRules {
    return { ...this._rules };
  }

  public get images(): string[] {
    return [...this._images];
  }

  public get minimumStay(): number {
    return this._minimumStay;
  }

  public get maximumStay(): number | undefined {
    return this._maximumStay;
  }

  public get instantBooking(): boolean {
    return this._instantBooking;
  }

  public get publishedAt(): Date | undefined {
    return this._publishedAt ? new Date(this._publishedAt) : undefined;
  }

  // Business Logic Methods

  /**
   * Update property details
   */
  public updateDetails(updates: {
    title?: string;
    description?: string;
    basePrice?: Money;
    cleaningFee?: Money;
    maxGuests?: number;
    minimumStay?: number;
    maximumStay?: number;
  }): void {
    if (updates.title !== undefined) {
      if (!updates.title.trim()) {
        throw new Error('Title cannot be empty');
      }
      this._title = updates.title;
    }

    if (updates.description !== undefined) {
      if (!updates.description.trim()) {
        throw new Error('Description cannot be empty');
      }
      this._description = updates.description;
    }

    if (updates.basePrice !== undefined) {
      this._basePrice = updates.basePrice;
    }

    if (updates.cleaningFee !== undefined) {
      this._cleaningFee = updates.cleaningFee;
    }

    if (updates.maxGuests !== undefined) {
      if (updates.maxGuests < 1) {
        throw new Error('Maximum guests must be at least 1');
      }
      this._maxGuests = updates.maxGuests;
    }

    if (updates.minimumStay !== undefined) {
      if (updates.minimumStay < 1) {
        throw new Error('Minimum stay must be at least 1 night');
      }
      this._minimumStay = updates.minimumStay;
    }

    if (updates.maximumStay !== undefined) {
      if (updates.maximumStay < this._minimumStay) {
        throw new Error('Maximum stay must be greater than minimum stay');
      }
      this._maximumStay = updates.maximumStay;
    }

    this.touch();
  }

  /**
   * Add amenity to property
   */
  public addAmenity(amenity: Amenity): void {
    if (this._amenities.some(a => a.id === amenity.id)) {
      throw new Error('Amenity already exists');
    }
    this._amenities.push(amenity);
    this.touch();
  }

  /**
   * Remove amenity from property
   */
  public removeAmenity(amenityId: string): void {
    const initialLength = this._amenities.length;
    this._amenities = this._amenities.filter(a => a.id !== amenityId);

    if (this._amenities.length === initialLength) {
      throw new Error('Amenity not found');
    }
    this.touch();
  }

  /**
   * Add image to property
   */
  public addImage(imageUrl: string): void {
    if (!imageUrl.trim()) {
      throw new Error('Image URL cannot be empty');
    }

    if (this._images.includes(imageUrl)) {
      throw new Error('Image already exists');
    }

    this._images.push(imageUrl);
    this.touch();
  }

  /**
   * Remove image from property
   */
  public removeImage(imageUrl: string): void {
    const initialLength = this._images.length;
    this._images = this._images.filter(img => img !== imageUrl);

    if (this._images.length === initialLength) {
      throw new Error('Image not found');
    }

    if (this._images.length === 0 && this._status === PropertyStatus.PUBLISHED) {
      throw new Error('Published property must have at least one image');
    }

    this.touch();
  }

  /**
   * Update property rules
   */
  public updateRules(rules: Partial<PropertyRules>): void {
    this._rules = {
      ...this._rules,
      ...rules,
    };
    this.touch();
  }

  /**
   * Publish the property (make it available for booking)
   */
  public publish(): void {
    if (this._status === PropertyStatus.PUBLISHED) {
      throw new Error('Property is already published');
    }

    if (this._status === PropertyStatus.SUSPENDED) {
      throw new Error('Cannot publish suspended property');
    }

    // Validate property is ready to be published
    if (this._images.length === 0) {
      throw new Error('Property must have at least one image to be published');
    }

    if (this._description.length < 50) {
      throw new Error('Description must be at least 50 characters to publish');
    }

    this._status = PropertyStatus.PUBLISHED;
    this._publishedAt = new Date();
    this.touch();
  }

  /**
   * Unlist the property (make it unavailable for new bookings)
   */
  public unlist(): void {
    if (this._status !== PropertyStatus.PUBLISHED) {
      throw new Error('Only published properties can be unlisted');
    }

    this._status = PropertyStatus.UNLISTED;
    this.touch();
  }

  /**
   * Suspend the property (admin action)
   */
  public suspend(reason: string): void {
    if (!reason?.trim()) {
      throw new Error('Suspension reason is required');
    }

    this._status = PropertyStatus.SUSPENDED;
    this.touch();
  }

  /**
   * Calculate total price for a stay
   */
  public calculateTotalPrice(dateRange: DateRange, guestCount: number): {
    nightsPrice: Money;
    cleaningFee: Money;
    totalPrice: Money;
    breakdown: {
      numberOfNights: number;
      pricePerNight: Money;
      guestCount: number;
    };
  } {
    if (guestCount > this._maxGuests) {
      throw new Error(`Guest count exceeds maximum of ${this._maxGuests}`);
    }

    if (guestCount < 1) {
      throw new Error('Guest count must be at least 1');
    }

    const nights = dateRange.numberOfNights;

    if (nights < this._minimumStay) {
      throw new Error(`Minimum stay is ${this._minimumStay} night(s)`);
    }

    if (this._maximumStay && nights > this._maximumStay) {
      throw new Error(`Maximum stay is ${this._maximumStay} nights`);
    }

    const nightsPrice = this._basePrice.multiply(nights);
    const cleaningFee = this._cleaningFee || Money.create(0, this._basePrice.currency);
    const totalPrice = nightsPrice.add(cleaningFee);

    return {
      nightsPrice,
      cleaningFee,
      totalPrice,
      breakdown: {
        numberOfNights: nights,
        pricePerNight: this._basePrice,
        guestCount,
      },
    };
  }

  /**
   * Check if property can accommodate guest count
   */
  public canAccommodate(guestCount: number): boolean {
    return guestCount > 0 && guestCount <= this._maxGuests;
  }

  /**
   * Check if property has specific amenity
   */
  public hasAmenity(amenityId: string): boolean {
    return this._amenities.some(a => a.id === amenityId);
  }

  /**
   * Get amenities by category
   */
  public getAmenitiesByCategory(category: 'essential' | 'feature' | 'safety'): Amenity[] {
    return this._amenities.filter(a => a.category === category);
  }

  /**
   * Check if property is available for booking
   */
  public isAvailableForBooking(): boolean {
    return this._status === PropertyStatus.PUBLISHED;
  }

  /**
   * Check if property is owned by specific host
   */
  public isOwnedBy(hostId: string): boolean {
    return this._hostId === hostId;
  }

  /**
   * Get property summary for search results
   */
  public getSummary(): string {
    return `${this._type} - ${this._bedrooms} bed, ${this._bathrooms} bath - ${this._address.format('short')} - ${this._basePrice.format()}/night`;
  }

  /**
   * Validate property business rules
   */
  public validate(): void {
    if (!this._hostId?.trim()) {
      throw new Error('Host ID is required');
    }

    if (!this._title?.trim()) {
      throw new Error('Title is required');
    }

    if (this._title.length > 100) {
      throw new Error('Title cannot exceed 100 characters');
    }

    if (!this._description?.trim()) {
      throw new Error('Description is required');
    }

    if (this._description.length > 5000) {
      throw new Error('Description cannot exceed 5000 characters');
    }

    if (this._maxGuests < 1) {
      throw new Error('Maximum guests must be at least 1');
    }

    if (this._maxGuests > 50) {
      throw new Error('Maximum guests cannot exceed 50');
    }

    if (this._bedrooms < 0) {
      throw new Error('Bedrooms cannot be negative');
    }

    if (this._bathrooms < 0) {
      throw new Error('Bathrooms cannot be negative');
    }

    if (this._beds < 0) {
      throw new Error('Beds cannot be negative');
    }

    if (this._minimumStay < 1) {
      throw new Error('Minimum stay must be at least 1 night');
    }

    if (this._maximumStay && this._maximumStay < this._minimumStay) {
      throw new Error('Maximum stay must be greater than minimum stay');
    }

    // Validate check-in/check-out times
    if (!this.isValidTime(this._rules.checkInTime)) {
      throw new Error('Invalid check-in time format');
    }

    if (!this.isValidTime(this._rules.checkOutTime)) {
      throw new Error('Invalid check-out time format');
    }
  }

  /**
   * Validate time format (HH:MM)
   */
  private isValidTime(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Serialize to JSON
   */
  public toJSON(): Record<string, any> {
    return {
      id: this._id,
      hostId: this._hostId,
      title: this._title,
      description: this._description,
      type: this._type,
      status: this._status,
      address: this._address.toJSON(),
      basePrice: this._basePrice.toJSON(),
      cleaningFee: this._cleaningFee?.toJSON(),
      maxGuests: this._maxGuests,
      bedrooms: this._bedrooms,
      bathrooms: this._bathrooms,
      beds: this._beds,
      amenities: this._amenities,
      rules: this._rules,
      images: this._images,
      minimumStay: this._minimumStay,
      maximumStay: this._maximumStay,
      instantBooking: this._instantBooking,
      publishedAt: this._publishedAt?.toISOString(),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
