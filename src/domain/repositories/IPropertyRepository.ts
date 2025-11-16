/**
 * Property Repository Interface
 * Defines contract for property data access (Repository Pattern)
 * Demonstrates: Dependency Inversion Principle, Interface Segregation
 */
import { Property, PropertyType, PropertyStatus } from '../entities/Property';
import { DateRange } from '../value-objects/DateRange';

export interface PropertySearchCriteria {
  location?: string;
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  bedrooms?: number;
  amenities?: string[];
  instantBooking?: boolean;
  dateRange?: DateRange;
}

export interface IPropertyRepository {
  /**
   * Save a new property
   */
  create(property: Property): Promise<Property>;

  /**
   * Update an existing property
   */
  update(property: Property): Promise<Property>;

  /**
   * Find property by ID
   */
  findById(id: string): Promise<Property | null>;

  /**
   * Find all properties by host ID
   */
  findByHostId(hostId: string): Promise<Property[]>;

  /**
   * Find published properties by host ID
   */
  findPublishedByHostId(hostId: string): Promise<Property[]>;

  /**
   * Find properties by status
   */
  findByStatus(status: PropertyStatus): Promise<Property[]>;

  /**
   * Find properties by type
   */
  findByType(type: PropertyType): Promise<Property[]>;

  /**
   * Search properties with criteria
   */
  search(criteria: PropertySearchCriteria): Promise<Property[]>;

  /**
   * Find available properties in date range
   */
  findAvailable(dateRange: DateRange): Promise<Property[]>;

  /**
   * Find properties with specific amenity
   */
  findByAmenity(amenityId: string): Promise<Property[]>;

  /**
   * Find properties near coordinates (geocoding)
   */
  findNearLocation(
    lat: number,
    lng: number,
    radiusKm: number
  ): Promise<Property[]>;

  /**
   * Get featured/recommended properties
   */
  findFeatured(limit?: number): Promise<Property[]>;

  /**
   * Get recently added properties
   */
  findRecent(limit?: number): Promise<Property[]>;

  /**
   * Count total properties
   */
  count(): Promise<number>;

  /**
   * Count properties by host ID
   */
  countByHostId(hostId: string): Promise<number>;

  /**
   * Delete a property (soft delete recommended)
   */
  delete(id: string): Promise<void>;

  /**
   * Check if property exists
   */
  exists(id: string): Promise<boolean>;
}
