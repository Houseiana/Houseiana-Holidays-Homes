/**
 * Property Mapper
 * Converts between Prisma models and Domain entities
 */
import { Property as PrismaProperty, PropertyStatus as PrismaPropertyStatus, PropertyType as PrismaPropertyType } from '@prisma/client';
import { Property, PropertyType, PropertyStatus, Amenity, PropertyRules } from '@/domain/entities/Property';
import { Money } from '@/domain/value-objects/Money';
import { Address } from '@/domain/value-objects/Address';

export class PropertyMapper {
  static toDomain(prisma: PrismaProperty): Property {
    // Map Prisma types to Domain types
    const type = this.mapTypeToDomain(prisma.propertyType);
    const status = this.mapStatusToDomain(prisma.status);

    // Create Address value object
    const address = Address.create({
      street: prisma.address,
      city: prisma.city,
      state: prisma.state || '',
      country: prisma.country,
      postalCode: prisma.zipCode || '',
      coordinates: prisma.latitude && prisma.longitude
        ? { lat: prisma.latitude, lng: prisma.longitude }
        : undefined,
    });

    // Create Money value objects
    const basePrice = Money.create(prisma.pricePerNight, 'QAR');
    const cleaningFee = prisma.cleaningFee ? Money.create(prisma.cleaningFee, 'QAR') : undefined;

    // Parse amenities from JSON
    const amenities: Amenity[] = Array.isArray(prisma.amenities)
      ? (prisma.amenities as any[]).map((name: string, index: number) => ({
          id: `amenity_${index}`,
          name,
          category: 'feature' as const,
        }))
      : [];

    // Parse images from JSON
    const images: string[] = Array.isArray(prisma.photos)
      ? (prisma.photos as string[])
      : [];

    // Create rules object
    const rules: PropertyRules = {
      checkInTime: prisma.checkInTime || '15:00',
      checkOutTime: prisma.checkOutTime || '11:00',
      petsAllowed: prisma.allowPets,
      smokingAllowed: prisma.allowSmoking,
      partiesAllowed: prisma.allowEvents,
    };

    // Reconstitute Property entity
    return Property.reconstitute({
      id: prisma.id,
      hostId: prisma.hostId,
      title: prisma.title,
      description: prisma.description,
      type,
      status,
      address,
      basePrice,
      cleaningFee,
      maxGuests: prisma.guests,
      bedrooms: prisma.bedrooms,
      bathrooms: prisma.bathrooms,
      beds: prisma.beds,
      amenities,
      rules,
      images,
      minimumStay: prisma.minNights,
      maximumStay: prisma.maxNights || undefined,
      instantBooking: prisma.instantBook,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
      publishedAt: prisma.publishedAt || undefined,
    });
  }

  static toPrisma(domain: Property): Omit<PrismaProperty, 'host' | 'bookings' | 'reviews' | 'favorites'> {
    const amenityNames = domain.amenities.map(a => a.name);

    return {
      id: domain.id,
      hostId: domain.hostId,
      title: domain.title,
      description: domain.description,
      propertyType: this.mapTypeToPrisma(domain.type),
      roomType: 'ENTIRE_PLACE' as any, // Default
      country: domain.address.country,
      city: domain.address.city,
      state: domain.address.state || null,
      address: domain.address.street,
      zipCode: domain.address.postalCode || null,
      latitude: domain.address.coordinates?.lat || null,
      longitude: domain.address.coordinates?.lng || null,
      guests: domain.maxGuests,
      bedrooms: domain.bedrooms,
      beds: domain.beds,
      bathrooms: domain.bathrooms,
      pricePerNight: domain.basePrice.amount,
      cleaningFee: domain.cleaningFee?.amount || null,
      serviceFee: null,
      weeklyDiscount: null,
      monthlyDiscount: null,
      amenities: amenityNames as any,
      photos: domain.images as any,
      coverPhoto: domain.images[0] || null,
      checkInTime: domain.rules.checkInTime || null,
      checkOutTime: domain.rules.checkOutTime || null,
      minNights: domain.minimumStay,
      maxNights: domain.maximumStay || null,
      instantBook: domain.instantBooking,
      allowPets: domain.rules.petsAllowed,
      allowSmoking: domain.rules.smokingAllowed,
      allowEvents: domain.rules.partiesAllowed,
      status: this.mapStatusToPrisma(domain.status),
      isActive: domain.status === PropertyStatus.PUBLISHED,
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null,
      rejectionReason: null,
      viewCount: 0,
      bookingCount: 0,
      averageRating: null,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      publishedAt: domain.publishedAt || null,
      submittedForReviewAt: null,
    };
  }

  private static mapTypeToDomain(prismaType: PrismaPropertyType): PropertyType {
    const typeMap: Record<string, PropertyType> = {
      HOUSE: PropertyType.HOUSE,
      APARTMENT: PropertyType.APARTMENT,
      VILLA: PropertyType.VILLA,
      CONDO: PropertyType.CONDO,
      TOWNHOUSE: PropertyType.TOWNHOUSE,
      STUDIO: PropertyType.STUDIO,
    };
    return typeMap[prismaType] || PropertyType.APARTMENT;
  }

  private static mapTypeToPrisma(domainType: PropertyType): PrismaPropertyType {
    const typeMap: Record<PropertyType, PrismaPropertyType> = {
      [PropertyType.HOUSE]: 'HOUSE',
      [PropertyType.APARTMENT]: 'APARTMENT',
      [PropertyType.VILLA]: 'VILLA',
      [PropertyType.CONDO]: 'CONDO',
      [PropertyType.TOWNHOUSE]: 'TOWNHOUSE',
      [PropertyType.STUDIO]: 'STUDIO',
    };
    return typeMap[domainType];
  }

  private static mapStatusToDomain(prismaStatus: PrismaPropertyStatus): PropertyStatus {
    const statusMap: Record<PrismaPropertyStatus, PropertyStatus> = {
      DRAFT: PropertyStatus.DRAFT,
      PENDING_REVIEW: PropertyStatus.DRAFT,
      PUBLISHED: PropertyStatus.PUBLISHED,
      UNLISTED: PropertyStatus.UNLISTED,
      SUSPENDED: PropertyStatus.SUSPENDED,
    };
    return statusMap[prismaStatus];
  }

  private static mapStatusToPrisma(domainStatus: PropertyStatus): PrismaPropertyStatus {
    const statusMap: Record<PropertyStatus, PrismaPropertyStatus> = {
      [PropertyStatus.DRAFT]: 'DRAFT',
      [PropertyStatus.PUBLISHED]: 'PUBLISHED',
      [PropertyStatus.UNLISTED]: 'UNLISTED',
      [PropertyStatus.SUSPENDED]: 'SUSPENDED',
    };
    return statusMap[domainStatus];
  }

  static toDomainList(prismaList: PrismaProperty[]): Property[] {
    return prismaList.map(prisma => this.toDomain(prisma));
  }
}
