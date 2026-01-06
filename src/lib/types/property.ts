export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  address: Address;
  pricing: PropertyPricing;
  amenities: string[];
  photos: PropertyPhoto[];
  rules: PropertyRules;
  availability: PropertyAvailability;
  createdAt: Date;
  updatedAt: Date;
  hostId: string;
  ratings: PropertyRatings;
  bookingCount: number;
  totalEarnings: number;
  bedrooms: number;
  bathrooms: number;
}

export interface PropertyPhoto {
  id: string;
  url: string;
  caption?: string;
  isMain: boolean;
  order: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface PropertyPricing {
  basePrice: number;
  currency: string;
  cleaningFee: number;
  serviceFee: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  minimumNights: number;
  maximumNights: number;
}

export interface PropertyRules {
  checkIn: string;
  checkOut: string;
  maxGuests: number;
  allowPets: boolean;
  allowSmoking: boolean;
  allowParties: boolean;
  quietHours: {
    start: string;
    end: string;
  };
}

export interface PropertyAvailability {
  calendar: AvailabilitySlot[];
  blockedDates: Date[];
  minimumAdvanceNotice: number;
  preparationTime: number;
}

export interface AvailabilitySlot {
  date: Date;
  available: boolean;
  price?: number;
  minimumStay?: number;
}

export interface PropertyRatings {
  overall: number;
  cleanliness: number;
  accuracy: number;
  communication: number;
  location: number;
  checkIn: number;
  value: number;
  totalReviews: number;
}

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  VILLA = 'villa',
  CONDO = 'condo',
  TOWNHOUSE = 'townhouse',
  STUDIO = 'studio',
  LOFT = 'loft',
  CABIN = 'cabin',
  COTTAGE = 'cottage',
  HOTEL_ROOM = 'hotel_room'
}

export enum PropertyStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_REVIEW = 'under_review',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived'
}

export interface CreatePropertyRequest {
  title: string;
  description: string;
  type: PropertyType;
  address: Address;
  pricing: PropertyPricing;
  amenities: string[];
  rules: PropertyRules;
  bedrooms: number;
  bathrooms: number;
}

export interface UpdatePropertyRequest {
  id: string;
  updates: Partial<Property>;
}

export interface PropertyListingStats {
  totalViews: number;
  totalBookings: number;
  occupancyRate: number;
  averageRating: number;
  totalEarnings: number;
  monthlyEarnings: number;
  pendingBookings: number;
  activeBookings: number;
}

export interface FilterOptionsResponse {
  propertyTypes: PropertyType[];
  priceRange: {
    min: number;
    max: number;
  };
  amenities: string[];
}
