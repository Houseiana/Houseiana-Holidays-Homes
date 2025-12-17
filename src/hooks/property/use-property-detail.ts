'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// Types
export interface PropertyHost {
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
  calculateTotal: () => { base: number; total: number; service: number; cleaning: number };
  isNewListing: boolean;
  reviewLabel: string;
  ratingLabel: string;

  // Navigation helper
  getBookingUrl: () => string;
}

export function usePropertyDetail(propertyId: string): UsePropertyDetailReturn {
  // Data state
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);

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
      const response = await fetch('/api/properties/' + id);
      const data = await response.json();

      if (data.success && data.property) {
        const mappedProperty: PropertyDetail = {
          id: data.property.id,
          title: data.property.title,
          type: data.property.type,
          location: data.property.location,
          latitude: data.property.latitude,
          longitude: data.property.longitude,
          price: data.property.price,
          rating: data.property.rating,
          reviews: data.property.reviews,
          images: data.property.images.length > 0
            ? data.property.images
            : ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
          amenities: data.property.amenities,
          bedrooms: data.property.bedrooms,
          bathrooms: data.property.bathrooms,
          guests: data.property.guests,
          host: data.property.host || {
            name: 'Host',
            avatar: '',
            joinDate: 'Recently joined',
            verified: false,
          },
          description: data.property.description,
          isRareFind: data.property.isRareFind || false,
          guestFavorite: data.property.guestFavorite || false,
          perks: ['Flexible check-in', 'Self check-in'],
        };

        setProperty(mappedProperty);
      } else {
        console.error('Failed to load property:', data.error);
      }
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set default dates
  const setDefaultDates = useCallback(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2);

    setBookingForm({
      checkIn: today.toISOString().split('T')[0],
      checkOut: tomorrow.toISOString().split('T')[0],
      guests: 1,
    });
  }, []);

  // Initial load
  useEffect(() => {
    if (propertyId) {
      loadProperty(propertyId);
      setDefaultDates();
    }
  }, [propertyId, loadProperty, setDefaultDates]);

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
    if (!nights || !property) return { base: 0, total: 0, service: 0, cleaning: 0 };
    const base = property.price * nights;
    const service = Math.round(base * 0.08);
    const cleaning = 35;
    const total = base + service + cleaning;
    return { base, service, cleaning, total };
  }, [calculateNights, property]);

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
  const getBookingUrl = useCallback(() => {
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
  };
}
