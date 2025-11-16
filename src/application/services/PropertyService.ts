/**
 * Property Service
 * Application layer service for property business logic
 * Demonstrates: Dependency Injection, Service Layer Pattern
 */
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

export interface UpdatePropertyDTO {
  title?: string;
  description?: string;
  pricePerNight?: number;
  cleaningFee?: number;
  maxGuests?: number;
  minimumStay?: number;
  maximumStay?: number;
}

export class PropertyService {
  constructor(
    private readonly propertyRepository: IPropertyRepository,
    private readonly userRepository: IUserRepository,
    private readonly bookingRepository: IBookingRepository
  ) {}

  /**
   * Create a new property listing
   */
  async createProperty(dto: CreatePropertyDTO): Promise<Property> {
    // Validate host exists and can list properties
    const host = await this.userRepository.findById(dto.hostId);
    if (!host) {
      throw new Error('Host not found');
    }

    if (!host.canListProperties()) {
      throw new Error('Host must be verified to list properties');
    }

    // Create value objects
    const address = Address.create(dto.address);
    const basePrice = Money.create(dto.pricePerNight, 'QAR');
    const cleaningFee = dto.cleaningFee ? Money.create(dto.cleaningFee, 'QAR') : undefined;

    // Map amenities to Amenity objects
    const amenities = dto.amenities.map((name, index) => ({
      id: `amenity_${index}_${Date.now()}`,
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
    const savedProperty = await this.propertyRepository.create(property);

    // Update host metrics
    host.updateHostMetrics({
      totalListings: (await this.propertyRepository.countByHostId(dto.hostId)),
    });
    await this.userRepository.update(host);

    return savedProperty;
  }

  /**
   * Update property details
   */
  async updateProperty(
    propertyId: string,
    hostId: string,
    updates: UpdatePropertyDTO
  ): Promise<Property> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    if (!property.isOwnedBy(hostId)) {
      throw new Error('Unauthorized: You do not own this property');
    }

    // Apply updates using domain logic
    const updateData: any = {};

    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.pricePerNight) updateData.basePrice = Money.create(updates.pricePerNight, 'QAR');
    if (updates.cleaningFee !== undefined) {
      updateData.cleaningFee = updates.cleaningFee ? Money.create(updates.cleaningFee, 'QAR') : undefined;
    }
    if (updates.maxGuests) updateData.maxGuests = updates.maxGuests;
    if (updates.minimumStay) updateData.minimumStay = updates.minimumStay;
    if (updates.maximumStay !== undefined) updateData.maximumStay = updates.maximumStay;

    property.updateDetails(updateData);

    return await this.propertyRepository.update(property);
  }

  /**
   * Publish a property
   */
  async publishProperty(propertyId: string, hostId: string): Promise<Property> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    if (!property.isOwnedBy(hostId)) {
      throw new Error('Unauthorized: You do not own this property');
    }

    // Publish using domain logic (includes validation)
    property.publish();

    return await this.propertyRepository.update(property);
  }

  /**
   * Unlist a property
   */
  async unlistProperty(propertyId: string, hostId: string): Promise<Property> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    if (!property.isOwnedBy(hostId)) {
      throw new Error('Unauthorized: You do not own this property');
    }

    property.unlist();

    return await this.propertyRepository.update(property);
  }

  /**
   * Search properties with criteria
   */
  async searchProperties(criteria: PropertySearchCriteria): Promise<Property[]> {
    let properties = await this.propertyRepository.search(criteria);

    // Filter by availability if date range provided
    if (criteria.dateRange) {
      properties = await this.filterAvailableProperties(properties, criteria.dateRange);
    }

    return properties;
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id: string): Promise<Property | null> {
    return await this.propertyRepository.findById(id);
  }

  /**
   * Get all properties for a host
   */
  async getHostProperties(hostId: string): Promise<Property[]> {
    return await this.propertyRepository.findByHostId(hostId);
  }

  /**
   * Get published properties for a host
   */
  async getHostPublishedProperties(hostId: string): Promise<Property[]> {
    return await this.propertyRepository.findPublishedByHostId(hostId);
  }

  /**
   * Get featured properties
   */
  async getFeaturedProperties(limit: number = 10): Promise<Property[]> {
    return await this.propertyRepository.findFeatured(limit);
  }

  /**
   * Get recently added properties
   */
  async getRecentProperties(limit: number = 10): Promise<Property[]> {
    return await this.propertyRepository.findRecent(limit);
  }

  /**
   * Check property availability for date range
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
   * Add amenity to property
   */
  async addAmenity(propertyId: string, hostId: string, amenity: string): Promise<Property> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    if (!property.isOwnedBy(hostId)) {
      throw new Error('Unauthorized: You do not own this property');
    }

    const amenityObj = {
      id: `amenity_${Date.now()}`,
      name: amenity,
      category: 'feature' as const,
    };

    property.addAmenity(amenityObj);

    return await this.propertyRepository.update(property);
  }

  /**
   * Add image to property
   */
  async addImage(propertyId: string, hostId: string, imageUrl: string): Promise<Property> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    if (!property.isOwnedBy(hostId)) {
      throw new Error('Unauthorized: You do not own this property');
    }

    property.addImage(imageUrl);

    return await this.propertyRepository.update(property);
  }

  /**
   * Get property statistics for host dashboard
   */
  async getPropertyStats(propertyId: string, hostId: string): Promise<{
    totalBookings: number;
    upcomingBookings: number;
    totalRevenue: number;
  }> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    if (!property.isOwnedBy(hostId)) {
      throw new Error('Unauthorized: You do not own this property');
    }

    const bookings = await this.bookingRepository.findByPropertyId(propertyId);

    const totalBookings = bookings.length;
    const upcomingBookings = bookings.filter(b => b.isUpcoming()).length;
    const totalRevenue = bookings
      .filter(b => b.status === 'COMPLETED' as any)
      .reduce((sum, b) => sum + b.totalPrice.amount, 0);

    return {
      totalBookings,
      upcomingBookings,
      totalRevenue,
    };
  }

  /**
   * Delete property (soft delete recommended)
   */
  async deleteProperty(propertyId: string, hostId: string): Promise<void> {
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    if (!property.isOwnedBy(hostId)) {
      throw new Error('Unauthorized: You do not own this property');
    }

    // Check for active bookings
    const bookings = await this.bookingRepository.findByPropertyId(propertyId);
    const hasActiveBookings = bookings.some(b => b.isActive());

    if (hasActiveBookings) {
      throw new Error('Cannot delete property with active bookings');
    }

    await this.propertyRepository.delete(propertyId);
  }

  /**
   * Filter properties by availability
   */
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
}
