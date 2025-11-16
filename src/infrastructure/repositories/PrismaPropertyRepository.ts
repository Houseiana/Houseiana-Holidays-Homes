/**
 * Prisma Property Repository
 * Concrete implementation of IPropertyRepository using Prisma
 */
import { PrismaClient } from '@prisma/client';
import { IPropertyRepository, PropertySearchCriteria } from '@/domain/repositories/IPropertyRepository';
import { Property, PropertyType, PropertyStatus } from '@/domain/entities/Property';
import { DateRange } from '@/domain/value-objects/DateRange';
import { PropertyMapper } from '../mappers/PropertyMapper';

export class PrismaPropertyRepository implements IPropertyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(property: Property): Promise<Property> {
    const prismaData = PropertyMapper.toPrisma(property);
    const created = await this.prisma.property.create({
      data: prismaData,
    });
    return PropertyMapper.toDomain(created);
  }

  async update(property: Property): Promise<Property> {
    const prismaData = PropertyMapper.toPrisma(property);
    const updated = await this.prisma.property.update({
      where: { id: property.id },
      data: prismaData,
    });
    return PropertyMapper.toDomain(updated);
  }

  async findById(id: string): Promise<Property | null> {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });
    return property ? PropertyMapper.toDomain(property) : null;
  }

  async findByHostId(hostId: string): Promise<Property[]> {
    const properties = await this.prisma.property.findMany({
      where: { hostId },
      orderBy: { createdAt: 'desc' },
    });
    return PropertyMapper.toDomainList(properties);
  }

  async findPublishedByHostId(hostId: string): Promise<Property[]> {
    const properties = await this.prisma.property.findMany({
      where: {
        hostId,
        status: 'PUBLISHED',
      },
      orderBy: { createdAt: 'desc' },
    });
    return PropertyMapper.toDomainList(properties);
  }

  async findByStatus(status: PropertyStatus): Promise<Property[]> {
    const prismaStatus = this.mapStatusToPrisma(status);
    const properties = await this.prisma.property.findMany({
      where: { status: prismaStatus },
      orderBy: { createdAt: 'desc' },
    });
    return PropertyMapper.toDomainList(properties);
  }

  async findByType(type: PropertyType): Promise<Property[]> {
    const prismaType = this.mapTypeToPrisma(type);
    const properties = await this.prisma.property.findMany({
      where: { propertyType: prismaType },
      orderBy: { createdAt: 'desc' },
    });
    return PropertyMapper.toDomainList(properties);
  }

  async search(criteria: PropertySearchCriteria): Promise<Property[]> {
    const where: any = { status: 'PUBLISHED' };

    if (criteria.location) {
      where.OR = [
        { city: { contains: criteria.location, mode: 'insensitive' } },
        { country: { contains: criteria.location, mode: 'insensitive' } },
        { address: { contains: criteria.location, mode: 'insensitive' } },
      ];
    }

    if (criteria.type) {
      where.propertyType = this.mapTypeToPrisma(criteria.type);
    }

    if (criteria.minPrice !== undefined || criteria.maxPrice !== undefined) {
      where.pricePerNight = {};
      if (criteria.minPrice !== undefined) {
        where.pricePerNight.gte = criteria.minPrice;
      }
      if (criteria.maxPrice !== undefined) {
        where.pricePerNight.lte = criteria.maxPrice;
      }
    }

    if (criteria.guests) {
      where.guests = { gte: criteria.guests };
    }

    if (criteria.bedrooms) {
      where.bedrooms = { gte: criteria.bedrooms };
    }

    if (criteria.instantBooking !== undefined) {
      where.instantBook = criteria.instantBooking;
    }

    const properties = await this.prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit results
    });

    return PropertyMapper.toDomainList(properties);
  }

  async findAvailable(dateRange: DateRange): Promise<Property[]> {
    // Get all published properties
    const properties = await this.prisma.property.findMany({
      where: { status: 'PUBLISHED' },
    });

    // Filter out properties with overlapping bookings
    const availableProperties: Property[] = [];

    for (const property of properties) {
      const overlappingBookings = await this.prisma.booking.findMany({
        where: {
          propertyId: property.id,
          status: { in: ['PENDING', 'CONFIRMED'] },
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
                { checkIn: { lte: dateRange.startDate } },
                { checkOut: { gte: dateRange.endDate } },
              ],
            },
          ],
        },
      });

      if (overlappingBookings.length === 0) {
        availableProperties.push(PropertyMapper.toDomain(property));
      }
    }

    return availableProperties;
  }

  async findByAmenity(amenityId: string): Promise<Property[]> {
    // Amenities are stored as JSON array, search within it
    const properties = await this.prisma.property.findMany({
      where: {
        status: 'PUBLISHED',
        // Note: This is a simplified search, may need adjustment based on amenity structure
      },
    });

    // Filter in-memory for amenities
    const filtered = properties.filter(p => {
      const amenities = Array.isArray(p.amenities) ? p.amenities : [];
      return amenities.some((a: any) =>
        typeof a === 'string' ? a.includes(amenityId) : a.id === amenityId
      );
    });

    return PropertyMapper.toDomainList(filtered);
  }

  async findNearLocation(
    lat: number,
    lng: number,
    radiusKm: number
  ): Promise<Property[]> {
    // Simple bounding box search
    // For production, use PostGIS or a proper geospatial query
    const latDelta = radiusKm / 111; // 1 degree latitude ≈ 111 km
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const properties = await this.prisma.property.findMany({
      where: {
        status: 'PUBLISHED',
        latitude: {
          gte: lat - latDelta,
          lte: lat + latDelta,
        },
        longitude: {
          gte: lng - lngDelta,
          lte: lng + lngDelta,
        },
      },
    });

    // Calculate actual distance and filter
    const filtered = properties.filter(p => {
      if (!p.latitude || !p.longitude) return false;

      const distance = this.calculateDistance(
        lat,
        lng,
        p.latitude,
        p.longitude
      );
      return distance <= radiusKm;
    });

    return PropertyMapper.toDomainList(filtered);
  }

  async findFeatured(limit: number = 10): Promise<Property[]> {
    const properties = await this.prisma.property.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: [
        { averageRating: 'desc' },
        { bookingCount: 'desc' },
      ],
      take: limit,
    });

    return PropertyMapper.toDomainList(properties);
  }

  async findRecent(limit: number = 10): Promise<Property[]> {
    const properties = await this.prisma.property.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return PropertyMapper.toDomainList(properties);
  }

  async count(): Promise<number> {
    return await this.prisma.property.count();
  }

  async countByHostId(hostId: string): Promise<number> {
    return await this.prisma.property.count({
      where: { hostId },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.property.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.property.count({
      where: { id },
    });
    return count > 0;
  }

  // Helper methods

  private mapStatusToPrisma(status: PropertyStatus): string {
    const map: Record<PropertyStatus, string> = {
      [PropertyStatus.DRAFT]: 'DRAFT',
      [PropertyStatus.PUBLISHED]: 'PUBLISHED',
      [PropertyStatus.UNLISTED]: 'UNLISTED',
      [PropertyStatus.SUSPENDED]: 'SUSPENDED',
    };
    return map[status];
  }

  private mapTypeToPrisma(type: PropertyType): string {
    const map: Record<PropertyType, string> = {
      [PropertyType.HOUSE]: 'HOUSE',
      [PropertyType.APARTMENT]: 'APARTMENT',
      [PropertyType.VILLA]: 'VILLA',
      [PropertyType.CONDO]: 'CONDO',
      [PropertyType.TOWNHOUSE]: 'TOWNHOUSE',
      [PropertyType.STUDIO]: 'STUDIO',
    };
    return map[type];
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
