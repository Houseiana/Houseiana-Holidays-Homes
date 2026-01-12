export interface PropertyFormData {
  propertyType: string;
  country: string;
  street: string;
  apt: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: number[];
  safetyItems: number[];
  guestFavorites: number[];
  photos: File[];
  title: string;
  description: string;
  highlights: number[];
  cleaningFee: number;
  basePrice: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  newListingDiscount: number;
  instantBook: boolean;
  securityCamera: boolean;
  noiseMonitor: boolean;
  weapons: boolean;
  allowPets: boolean;
  allowSmoking: boolean;
  allowParties: boolean;
  checkInTime: string;
  checkOutTime: string;
  stars?: number;
  CancellationPolicy: {
    PolicyType: 'FLEXIBLE' | 'MODERATE' | 'FIXED';
    FreeCancellationHours?: any;
    FreeCancellationDays?: any;
  };
  documentOfProperty: {
    PrpopertyDocoument: File | null;
    HostId: File | null;
    PowerOfAttorney: File | null;
  };
}
