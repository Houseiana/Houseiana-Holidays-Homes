'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PropertyAPI } from '@/lib/api/backend-api';

// Types
export interface PropertyHost {
  id: string;
  name: string;
  avatar: string;
  joinDate: string;
  verified: boolean;
}

export interface PropertyDetail {
  id: string;
  title: string;
  type: string;
  location: string;
  latitude?: number;
  longitude?: number;
  price: number;
  priceWithoutDiscount: number;
  rating: number;
  reviews: number;
  images: string[];
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  guests: number;
  host: PropertyHost;
  description: string;
  isRareFind: boolean;
  guestFavorite: boolean;
  perks?: string[];
  // New pricing fields
  weeklyDiscount?: number;
  smallBookingDiscount?: number;
  bookingsCount?: number;
}



export interface PropertyBookingForm {
  checkIn: string;
  checkOut: string;
  guests: number;
}

interface UsePropertyDetailReturn {
  // Data
  property: PropertyDetail | null;
  loading: boolean;

  // UI state
  isLiked: boolean;
  setIsLiked: (liked: boolean) => void;
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  showLightbox: boolean;
  setShowLightbox: (show: boolean) => void;

  // Booking form
  bookingForm: PropertyBookingForm;
  setBookingForm: React.Dispatch<React.SetStateAction<PropertyBookingForm>>;

  // Actions
  updateGuests: (change: number) => void;
  shareProperty: () => void;
  prevImage: () => void;
  nextImage: () => void;

  // Computed
  calculateNights: () => number;
  calculateTotal: () => { base: number; total: number; service: number; cleaning: number; discount: number };
  isNewListing: boolean;
  reviewLabel: string;
  ratingLabel: string;

  // Navigation helper
  getBookingUrl: (bookingId?: string) => string;

  // Availability
  isDateBlocked: (date: Date) => boolean;
  bookedDates: { from: string; to: string }[];
}

export function usePropertyDetail(propertyId: string , userId?: string): UsePropertyDetailReturn {
  // Data state
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookedDates, setBookedDates] = useState<{ from: string; to: string }[]>([]);

  // UI state
  const [isLiked, setIsLiked] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // Booking form state
  const [bookingForm, setBookingForm] = useState<PropertyBookingForm>({
    checkIn: '',
    checkOut: '',
    guests: 1,
  });

  // Load property
  const loadProperty = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const [propertyResponse, bookedDatesResponse] = await Promise.all([
        PropertyAPI.getPropertyById(id , userId),
        PropertyAPI.getBookedDates(id)
      ]);

      if (propertyResponse.success && propertyResponse.data) {
        // Cast to any to handle potential backend wrapper mismatch
        const p = (propertyResponse.data as any).data || propertyResponse.data as any;
        // Map backend property to UI model
        const mappedProperty: PropertyDetail = {
          id: p.id,
          title: p.title,
          type: p.type,
          location: p.location,
          latitude: p.latitude,
          longitude: p.longitude,
          price: p.pricePerNight || p.price,
          priceWithoutDiscount: p.priceWithoutDiscount,
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          images: p.images && p.images.length > 0
            ? p.images
            : ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
          amenities: Array.isArray(p.amenities) 
            ? p.amenities 
            : (typeof p.amenities === 'string' ? tryParseJSON(p.amenities) : []),
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          guests: p.guests,
          host: {
            id: p.host?.id || '',
            name: p.host?.firstName + ' ' + p.host?.lastName || 'Host',
            avatar: p.host?.avatar || '',
            joinDate: 'Recently joined',
            verified: p.host?.verified || false,
          },
          description: p.description,
          isRareFind: false, // Not in API yet
          guestFavorite: false, // Not in API yet
          perks: ['Flexible check-in', 'Self check-in'],
          weeklyDiscount: p.weeklyDiscount || 0,
          smallBookingDiscount: p.smallBookingDiscount || 0,
          bookingsCount: p.bookingsCount || 0,
        };

        setProperty(mappedProperty);
      } else {
        console.error('Failed to load property:', propertyResponse.error);
      }

      if (bookedDatesResponse.success && bookedDatesResponse.data) {
          const dates = (bookedDatesResponse.data as any).booked_Ranges || [];
          setBookedDates(dates);
      }

    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if date is blocked
  const isDateBlocked = useCallback((date: Date) => {
      const dateString = date.toISOString().split('T')[0];
      return bookedDates.some(range => {
          return dateString >= range.from && dateString <= range.to;
      });
  }, [bookedDates]);

  // Set default dates
  const setDefaultDates = useCallback(() => {
    // Find next available 2-night slot
    const today = new Date();
    let checkIn = new Date(today);
    
    // Simple lookahead for 30 days
    for (let i = 0; i < 30; i++) {
        if (!isDateBlocked(checkIn)) {
            const nextDay = new Date(checkIn);
            nextDay.setDate(nextDay.getDate() + 1);
            if (!isDateBlocked(nextDay)) {
                // Found a slot
                break;
            }
        }
        checkIn.setDate(checkIn.getDate() + 1);
    }
    
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 1);

    setBookingForm({
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      guests: 1,
    });
  }, [isDateBlocked]);

  // Initial load
  useEffect(() => {
    if (propertyId) {
      loadProperty(propertyId);
    }
  }, [propertyId, loadProperty]);
  
  // Set default dates ONLY after booked dates are loaded
  useEffect(() => {
      if (bookedDates.length > 0 || !loading) {
          setDefaultDates();
      }
  }, [bookedDates, loading, setDefaultDates]);

  // Calculate nights
  const calculateNights = useCallback(() => {
    if (!bookingForm.checkIn || !bookingForm.checkOut) return 0;
    const checkIn = new Date(bookingForm.checkIn);
    const checkOut = new Date(bookingForm.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }, [bookingForm.checkIn, bookingForm.checkOut]);

  // Calculate total
  const calculateTotal = useCallback(() => {
    const nights = calculateNights();
    if (!nights || !property) return { base: 0, total: 0, service: 0, cleaning: 0, discount: 0 };
    
    const price = Number(property.price) || 0;
    const priceWithoutDiscount = Number(property.priceWithoutDiscount) || 0;
    const guests = bookingForm.guests;
    
    // Base is price * nights * guests
    const base = priceWithoutDiscount * nights;
    
    // --- Pricing Logic Start ---
    let discountAmount = 0;
    // @ts-ignore
    const { weeklyDiscount, smallBookingDiscount } = property;

    let activeDiscountPercentage = 0;

    // 1. Weekly Discount: Applies if booking is 7 days or more
    if (nights === 7 && weeklyDiscount && weeklyDiscount > 0) {
      activeDiscountPercentage = weeklyDiscount;
    } 
    // 2. Small Booking Discount: Applies generic discount if exists (fallback)
    else if (smallBookingDiscount && smallBookingDiscount > 0) {
      activeDiscountPercentage = smallBookingDiscount;
    }

    if (activeDiscountPercentage > 0) {
      discountAmount = (base * activeDiscountPercentage) / 100;
    }
    // --- Pricing Logic End ---

    const service = Math.round((base - discountAmount) * 0.10); // Service fee (10%)
    const cleaning = 35;
    const total = base - discountAmount + service + cleaning;
    
    return { base, service, cleaning, total, discount: discountAmount };
  }, [calculateNights, property, bookingForm.guests]);

  // Update guests
  const updateGuests = useCallback((change: number) => {
    const maxGuests = property?.guests || 8;
    const newCount = Math.max(1, Math.min(maxGuests, bookingForm.guests + change));
    setBookingForm(prev => ({ ...prev, guests: newCount }));
  }, [property?.guests, bookingForm.guests]);

  // Share property
  const shareProperty = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: 'Check out this amazing property on Houseiana',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }, [property?.title]);

  // Image navigation
  const prevImage = useCallback(() => {
    const maxIndex = (property?.images.length || 1) - 1;
    setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
  }, [property?.images.length]);

  const nextImage = useCallback(() => {
    const maxIndex = (property?.images.length || 1) - 1;
    setSelectedImageIndex(prev => (prev < maxIndex ? prev + 1 : 0));
  }, [property?.images.length]);

  // Computed values
  const isNewListing = useMemo(() => (property?.reviews || 0) < 5, [property?.reviews]);
  
  const reviewLabel = useMemo(() => {
    return isNewListing ? 'New listing · be among the first guests' : (property?.reviews || 0) + ' reviews';
  }, [isNewListing, property?.reviews]);

  const ratingLabel = useMemo(() => {
    return isNewListing ? 'New on Houseiana' : (property?.rating || 0) + ' • ' + reviewLabel;
  }, [isNewListing, property?.rating, reviewLabel]);

  // Get booking URL
  const getBookingUrl = useCallback((bookingId?: string) => {
    if (!property) return '';
    const params = new URLSearchParams({
      propertyId: property.id,
      checkIn: bookingForm.checkIn,
      checkOut: bookingForm.checkOut,
      guests: bookingForm.guests.toString(),
      adults: bookingForm.guests.toString(),
      children: '0',
      infants: '0',
    });
    if (bookingId) {
      params.append('bookingId', bookingId);
    }
    return '/booking/confirm?' + params.toString();
  }, [property, bookingForm]);

  return {
    // Data
    property,
    loading,

    // UI state
    isLiked,
    setIsLiked,
    selectedImageIndex,
    setSelectedImageIndex,
    showLightbox,
    setShowLightbox,

    // Booking form
    bookingForm,
    setBookingForm,

    // Actions
    updateGuests,
    shareProperty,
    prevImage,
    nextImage,

    // Computed
    calculateNights,
    calculateTotal,
    isNewListing,
    reviewLabel,
    ratingLabel,

    // Navigation helper
    getBookingUrl,
    
    // Availability
    isDateBlocked,
    bookedDates,
  };
}

function tryParseJSON(jsonString: string) {
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}
