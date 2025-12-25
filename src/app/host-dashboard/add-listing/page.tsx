'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import {
  Home, ChevronLeft, ChevronRight, X, Upload, Plus, Minus, Wifi, Tv, Car, Utensils, Wind, Waves, Dumbbell, PawPrint, Coffee, Flame, Shirt, Snowflake, MapPin, Camera, DollarSign, Calendar, Check, Building, Castle, TreePine, Tent, Ship, Warehouse, Hotel, Home as HomeIcon, Users, Bed, Bath, Star, Shield, Clock, AlertCircle, Mountain, Palmtree, Building2, Landmark, Briefcase, Droplets, Fan, Lock, Sun, Cigarette, PartyPopper, Info
} from 'lucide-react';

const libraries: ("places")[] = ["places"];

interface PropertyFormData {
  // Step 0: Property Type
  propertyType: string;

  // Place Type (default: entire)
  placeType: string;

  // Step 1: Location
  country: string;
  street: string;
  apt: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;

  // Step 2: Basics
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;

  // Step 3: Amenities
  amenities: string[];

  // Step 4: Photos
  photos: File[];

  // Step 5: Title
  title: string;

  // Step 6: Description
  description: string;
  highlights: string[];

  // Step 7: Pricing
  basePrice: number;

  // Step 8: Discounts
  weeklyDiscount: number;
  monthlyDiscount: number;
  newListingDiscount: number;

  // Step 9: Legal
  instantBook: boolean;
  securityCamera: boolean;
  noiseMonitor: boolean;
  weapons: boolean;

  // Step 10: House Rules
  allowPets: boolean;
  allowSmoking: boolean;
  allowParties: boolean;
  checkInTime: string;
  checkOutTime: string;
}

export default function AddListingPage() {
  const router = useRouter();
  const { getToken, userId, isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();

  const [currentStep, setCurrentStep] = useState(0);
  const [listing, setListing] = useState<PropertyFormData>({
    propertyType: '',
    placeType: 'entire',
    country: 'Qatar',
    street: '',
    apt: '',
    city: '',
    state: '',
    postalCode: '',
    latitude: 25.2854, // Default: Doha, Qatar
    longitude: 51.5310,
    guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: [],
    photos: [],
    title: '',
    description: '',
    highlights: [],
    basePrice: 100,
    weeklyDiscount: 0,
    monthlyDiscount: 0,
    newListingDiscount: 0,
    instantBook: true,
    securityCamera: false,
    noiseMonitor: false,
    weapons: false,
    allowPets: false,
    allowSmoking: false,
    allowParties: false,
    checkInTime: '3:00 PM',
    checkOutTime: '11:00 AM',
  });

  // Google Maps
  const { isLoaded: isMapLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (isMapLoaded && addressInputRef.current && !autocompleteRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        fields: ['address_components', 'formatted_address', 'geometry'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          // Parse address components
          let street = '';
          let city = '';
          let state = '';
          let postalCode = '';
          let country = '';

          place.address_components?.forEach((component) => {
            const types = component.types;

            if (types.includes('street_number')) {
              street = component.long_name + ' ';
            }
            if (types.includes('route')) {
              street += component.long_name;
            }
            if (types.includes('locality')) {
              city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (types.includes('postal_code')) {
              postalCode = component.long_name;
            }
            if (types.includes('country')) {
              country = component.long_name;
            }
          });

          setListing(prev => ({
            ...prev,
            street: street.trim(),
            city,
            state,
            postalCode,
            country: country || prev.country,
            latitude: lat,
            longitude: lng,
          }));
        }
      });

      autocompleteRef.current = autocomplete;
    }
  }, [isMapLoaded]);

  const mapCenter = {
    lat: listing.latitude,
    lng: listing.longitude,
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  };

  // Handle marker drag and map click to update coordinates
  const updateLocationFromCoordinates = (lat: number, lng: number) => {
    setListing(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

    // Reverse geocode to update address fields
    if (isMapLoaded) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          let street = '';
          let city = '';
          let state = '';
          let postalCode = '';
          let country = '';

          results[0].address_components?.forEach((component) => {
            const types = component.types;

            if (types.includes('street_number')) {
              street = component.long_name + ' ';
            }
            if (types.includes('route')) {
              street += component.long_name;
            }
            if (types.includes('locality')) {
              city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (types.includes('postal_code')) {
              postalCode = component.long_name;
            }
            if (types.includes('country')) {
              country = component.long_name;
            }
          });

          setListing(prev => ({
            ...prev,
            street: street.trim() || prev.street,
            city: city || prev.city,
            state: state || prev.state,
            postalCode: postalCode || prev.postalCode,
            country: country || prev.country,
          }));
        }
      });
    }
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      updateLocationFromCoordinates(e.latLng.lat(), e.latLng.lng());
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      updateLocationFromCoordinates(e.latLng.lat(), e.latLng.lng());
    }
  };

  const steps = [
    { id: 0, phase: 1, title: 'Tell us about your place', subtitle: 'Which of these best describes your place?' },
    { id: 1, phase: 1, title: "Where's your place located?", subtitle: 'Your address is only shared with guests after they book' },
    { id: 2, phase: 1, title: 'Share some basics about your place', subtitle: 'You\'ll add more details later, like bed types' },
    { id: 3, phase: 2, title: 'Tell guests what your place has to offer', subtitle: 'You can add more amenities after you publish' },
    { id: 4, phase: 2, title: 'Add some photos of your place', subtitle: 'You\'ll need 5 photos to get started. You can add more or make changes later' },
    { id: 5, phase: 3, title: "Now, let's give your place a title", subtitle: 'Short titles work best. Have fun with it—you can always change it later' },
    { id: 6, phase: 3, title: 'Create your description', subtitle: 'Share what makes your place special' },
    { id: 7, phase: 3, title: 'Now, set your price', subtitle: 'You can change it anytime' },
    { id: 8, phase: 3, title: 'Add discounts', subtitle: 'Help your place stand out to get booked faster and earn your first reviews' },
    { id: 9, phase: 3, title: 'Just a few last questions...', subtitle: 'These help us personalize your hosting experience' },
    { id: 10, phase: 3, title: 'Set your house rules', subtitle: 'Guests must agree to your rules before they book' },
    { id: 11, phase: 3, title: 'Review your listing', subtitle: 'Here\'s what we\'ll show to guests. Make sure everything looks good' },
  ];

  const phases = [
    { id: 1, title: 'Tell us about your place', steps: [0, 1, 2] },
    { id: 2, title: 'Make it stand out', steps: [3, 4] },
    { id: 3, title: 'Finish up and publish', steps: [5, 6, 7, 8, 9, 10, 11] },
  ];

  const propertyTypes = [
    { id: 'apartment_condo', icon: Building, label: 'Apartment / Condo' },
    { id: 'house', icon: HomeIcon, label: 'House' },
    { id: 'villa', icon: Castle, label: 'Villa' },
    { id: 'studio_loft', icon: Building2, label: 'Studio / Loft' },
    { id: 'townhouse', icon: Home, label: 'Townhouse' },
    { id: 'guesthouse_annex', icon: Home, label: 'Guesthouse / Annex' },
    { id: 'serviced_apartment', icon: Hotel, label: 'Serviced apartment' },
    { id: 'aparthotel', icon: Building, label: 'Hotel-style residence (aparthotel unit)' },
    { id: 'cabin_chalet', icon: TreePine, label: 'Cabin / Chalet' },
    { id: 'farm_stay', icon: TreePine, label: 'Farm stay' },
    { id: 'houseboat', icon: Ship, label: 'Houseboat' },
  ];

  const amenitiesList = {
    favorites: [
      { id: 'wifi', icon: Wifi, label: 'Wifi' },
      { id: 'tv', icon: Tv, label: 'TV' },
      { id: 'kitchen', icon: Utensils, label: 'Kitchen' },
      { id: 'washer', icon: Shirt, label: 'Washer' },
      { id: 'parking', icon: Car, label: 'Free parking on premises' },
      { id: 'ac', icon: Snowflake, label: 'Air conditioning' },
      { id: 'workspace', icon: Briefcase, label: 'Dedicated workspace' },
      { id: 'pool', icon: Waves, label: 'Pool' },
    ],
    standout: [
      { id: 'hottub', icon: Waves, label: 'Hot tub' },
      { id: 'patio', icon: Sun, label: 'Patio or balcony' },
      { id: 'bbq', icon: Flame, label: 'BBQ grill' },
      { id: 'firepit', icon: Flame, label: 'Fire pit' },
      { id: 'pooltable', icon: Star, label: 'Pool table' },
      { id: 'fireplace', icon: Flame, label: 'Indoor fireplace' },
      { id: 'piano', icon: Star, label: 'Piano' },
      { id: 'gym', icon: Dumbbell, label: 'Exercise equipment' },
      { id: 'lake', icon: Waves, label: 'Lake access' },
      { id: 'beach', icon: Palmtree, label: 'Beach access' },
      { id: 'ski', icon: Mountain, label: 'Ski-in/Ski-out' },
      { id: 'shower', icon: Droplets, label: 'Outdoor shower' },
    ],
    safety: [
      { id: 'smoke_alarm', icon: AlertCircle, label: 'Smoke alarm' },
      { id: 'first_aid', icon: Shield, label: 'First aid kit' },
      { id: 'fire_extinguisher', icon: Shield, label: 'Fire extinguisher' },
      { id: 'co_alarm', icon: AlertCircle, label: 'Carbon monoxide alarm' },
    ],
  };

  const highlights = [
    { id: 'peaceful', label: 'Peaceful' },
    { id: 'unique', label: 'Unique' },
    { id: 'familyfriendly', label: 'Family-friendly' },
    { id: 'stylish', label: 'Stylish' },
    { id: 'central', label: 'Central' },
    { id: 'spacious', label: 'Spacious' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleAmenity = (id: string) => {
    setListing({
      ...listing,
      amenities: listing.amenities.includes(id)
        ? listing.amenities.filter(a => a !== id)
        : [...listing.amenities, id]
    });
  };

  const toggleHighlight = (id: string) => {
    if (listing.highlights.includes(id)) {
      setListing({ ...listing, highlights: listing.highlights.filter(h => h !== id) });
    } else if (listing.highlights.length < 2) {
      setListing({ ...listing, highlights: [...listing.highlights, id] });
    }
  };

  const updateCounter = (field: keyof PropertyFormData, delta: number) => {
    const min = field === 'bathrooms' ? 0.5 : 1;
    const currentValue = listing[field] as number;
    const newValue = Math.max(min, currentValue + delta);
    setListing({ ...listing, [field]: newValue });
  };

  const handlePhotoUpload = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files);
      setListing(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos].slice(0, 20) // Max 20 photos
      }));
    }
  };

  const handleSubmit = async () => {
    if (!isLoaded || !isSignedIn || !userId) {
      alert('Please sign in to create a listing');
      router.push('/sign-in');
      return;
    }

    // Validation
    if (!listing.title || !listing.description) {
      alert('Please provide a title and description for your property');
      setCurrentStep(5);
      return;
    }

    if (!listing.propertyType) {
      alert('Please select a property type');
      setCurrentStep(0);
      return;
    }

    if (!listing.city || !listing.country) {
      alert('Please provide complete location information');
      setCurrentStep(1);
      return;
    }

    try {
      // Upload photos to Cloudinary (with automatic S3 backup)
      const uploadedPhotoUrls: string[] = [];
      const failedPhotos: string[] = [];

      if (listing.photos.length > 0) {
        alert(`Uploading ${listing.photos.length} photo(s)... This may take a moment.`);

        for (let i = 0; i < listing.photos.length; i++) {
          const photoFile = listing.photos[i];
          try {
            const formData = new FormData();
            formData.append('file', photoFile);
            formData.append('folder', 'properties');

            const uploadResponse = await fetch(`/api/upload-cloudinary`, {
              method: 'POST',
              body: formData,
            });

            const uploadResult = await uploadResponse.json();

            if (uploadResponse.ok && uploadResult.success) {
              uploadedPhotoUrls.push(uploadResult.url);
              console.log(`✅ Photo ${i + 1}/${listing.photos.length} uploaded to Cloudinary (S3 backup in progress)`);
            } else {
              const errorMsg = uploadResult.error || 'Unknown error';
              console.error(`❌ Photo ${i + 1} upload failed:`, errorMsg);
              failedPhotos.push(`Photo ${i + 1}: ${errorMsg}`);
            }
          } catch (uploadError: any) {
            console.error(`❌ Photo ${i + 1} upload error:`, uploadError);
            failedPhotos.push(`Photo ${i + 1}: ${uploadError.message || 'Network error'}`);
          }
        }

        // Show results
        if (failedPhotos.length > 0) {
          const message = `⚠️ ${uploadedPhotoUrls.length}/${listing.photos.length} photos uploaded successfully.\n\nFailed uploads:\n${failedPhotos.join('\n')}\n\nDo you want to continue creating the property without these photos?`;
          if (!confirm(message)) {
            return;
          }
        } else {
          console.log(`✅ All ${uploadedPhotoUrls.length} photos uploaded successfully!`);
        }
      }

      const propertyData = {
        title: listing.title,
        description: listing.description,
        propertyType: listing.propertyType.toUpperCase(),
        roomType: listing.placeType === 'entire' ? 'ENTIRE_PLACE' : listing.placeType === 'room' ? 'PRIVATE_ROOM' : 'SHARED_ROOM',
        country: listing.country,
        city: listing.city,
        state: listing.state || '',
        address: `${listing.street}, ${listing.apt}`.trim(),
        zipCode: listing.postalCode || null,
        latitude: null,
        longitude: null,
        guests: listing.guests,
        bedrooms: listing.bedrooms,
        beds: listing.beds,
        bathrooms: listing.bathrooms,
        pricePerNight: listing.basePrice,
        cleaningFee: 0,
        serviceFee: 0,
        weeklyDiscount: listing.weeklyDiscount,
        monthlyDiscount: listing.monthlyDiscount,
        amenities: listing.amenities,
        photos: uploadedPhotoUrls,
        coverPhoto: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls[0] : null,
        checkInTime: listing.checkInTime,
        checkOutTime: listing.checkOutTime,
        minNights: 1,
        maxNights: null,
        instantBook: listing.instantBook,
        allowPets: listing.allowPets,
        allowSmoking: listing.allowSmoking,
        allowEvents: listing.allowParties,
        status: 'DRAFT',
      };

      const clerkToken = await getToken();
      if (!clerkToken) {
        alert('Authentication failed. Please sign in again.');
        router.push('/sign-in');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${API_URL}/api/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clerkToken}`
        },
        credentials: 'include',
        body: JSON.stringify(propertyData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`✅ Property "${listing.title}" created successfully with ${uploadedPhotoUrls.length} photo(s)!`);
        router.push('/host-dashboard');
      } else {
        throw new Error(result.error || 'Failed to add property');
      }
    } catch (error: any) {
      console.error('Error submitting property:', error);
      alert(`Failed to add property: ${error.message}`);
    }
  };

  const Counter = ({ label, sublabel, value, field, min = 1, step = 1 }: any) => (
    <div className="flex items-center justify-between py-6 border-b border-gray-200 last:border-b-0">
      <div>
        <span className="text-lg text-gray-900">{label}</span>
        {sublabel && <p className="text-sm text-gray-500">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => updateCounter(field, -step)}
          disabled={value <= min}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
            value <= min
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-gray-400 text-gray-600 hover:border-gray-900 hover:text-gray-900'
          }`}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center text-lg">{value}</span>
        <button
          onClick={() => updateCounter(field, step)}
          className="w-8 h-8 rounded-full border border-gray-400 text-gray-600 hover:border-gray-900 hover:text-gray-900 flex items-center justify-center transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const currentPhase = phases.find(p => p.steps.includes(currentStep));
  const phaseProgress = currentPhase ? ((currentPhase.steps.indexOf(currentStep) + 1) / currentPhase.steps.length) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 lg:w-6 lg:h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">houseiana</span>
            </Link>

            <div className="flex items-center gap-3">
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900 underline underline-offset-2">
                Questions?
              </button>
              <button onClick={() => router.push('/host-dashboard')} className="px-4 py-2 text-sm font-medium text-gray-900 border border-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                Save & exit
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 lg:pt-10 pb-24">
        <div className="h-full flex flex-col lg:flex-row">
          {/* Left Side - Visual/Title (Desktop only) */}
          <div className="hidden lg:flex lg:w-1/2 bg-black text-white sticky top-20 h-[calc(100vh-5rem-6rem)] items-center justify-center p-12">
            <div className="max-w-md">
              {/* Phase indicator */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-gray-400">Step {currentStep + 1}</span>
                <div className="flex gap-1">
                  {phases.map((phase) => (
                    <div
                      key={phase.id}
                      className={`h-1 w-8 rounded-full ${
                        phase.id < (currentPhase?.id || 0) ? 'bg-white' :
                        phase.id === currentPhase?.id ? 'bg-white' : 'bg-gray-700'
                      }`}
                    >
                      {phase.id === currentPhase?.id && (
                        <div
                          className="h-full bg-teal-400 rounded-full transition-all duration-300"
                          style={{ width: `${phaseProgress}%` }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">
                {steps[currentStep].title}
              </h1>

              {/* Decorative element */}
              <div className="mt-16 opacity-20">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-white">
                  <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
                  <circle cx="60" cy="60" r="30" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 lg:w-1/2 overflow-y-auto">
            <div className="max-w-xl mx-auto px-6 py-8 lg:py-12">
              {/* Mobile Step Title */}
              <div className="lg:hidden mb-8">
                <div className="flex gap-1 mb-4">
                  {phases.map((phase) => (
                    <div
                      key={phase.id}
                      className={`h-1 flex-1 rounded-full ${
                        phase.id < (currentPhase?.id || 0) ? 'bg-gray-900' :
                        phase.id === currentPhase?.id ? 'bg-gray-300' : 'bg-gray-200'
                      }`}
                    >
                      {phase.id === currentPhase?.id && (
                        <div
                          className="h-full bg-gray-900 rounded-full transition-all duration-300"
                          style={{ width: `${phaseProgress}%` }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">{steps[currentStep].title}</h1>
                <p className="text-gray-500 mt-2">{steps[currentStep].subtitle}</p>
              </div>

              {/* Desktop subtitle */}
              <p className="hidden lg:block text-gray-500 mb-8">{steps[currentStep].subtitle}</p>

              {/* Step Content */}
              {/* Step 0: Property Type */}
              {currentStep === 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {propertyTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setListing({ ...listing, propertyType: type.id })}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-start gap-2 hover:border-gray-900 ${
                        listing.propertyType === type.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <type.icon className="w-8 h-8 text-gray-900" strokeWidth={1.5} />
                      <span className="text-sm font-medium text-gray-900">{type.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 1: Location */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search for your address
                      <span className="text-gray-400 text-xs ml-2">(Start typing to see suggestions)</span>
                    </label>
                    <input
                      ref={addressInputRef}
                      type="text"
                      placeholder="Start typing your address..."
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-lg"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      <Info className="w-3 h-3 inline mr-1" />
                      Select your address from the dropdown to auto-fill all fields
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Or enter manually:</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country / Region</label>
                        <select
                          value={listing.country}
                          onChange={(e) => setListing({ ...listing, country: e.target.value })}
                          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-lg"
                        >
                          <option value="Qatar">Qatar</option>
                          <option value="UAE">United Arab Emirates</option>
                          <option value="Saudi Arabia">Saudi Arabia</option>
                          <option value="Kuwait">Kuwait</option>
                          <option value="Bahrain">Bahrain</option>
                          <option value="Oman">Oman</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Street address</label>
                        <input
                          type="text"
                          value={listing.street}
                          onChange={(e) => setListing({ ...listing, street: e.target.value })}
                          placeholder="Enter your street address"
                          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Apt, suite, etc. (optional)</label>
                        <input
                          type="text"
                          value={listing.apt}
                          onChange={(e) => setListing({ ...listing, apt: e.target.value })}
                          placeholder="Apt, suite, unit, etc."
                          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-lg"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                          <input
                            type="text"
                            value={listing.city}
                            onChange={(e) => setListing({ ...listing, city: e.target.value })}
                            placeholder="City"
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Postal code</label>
                          <input
                            type="text"
                            value={listing.postalCode}
                            onChange={(e) => setListing({ ...listing, postalCode: e.target.value })}
                            placeholder="Postal code"
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Google Map */}
                  <div className="mt-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Confirm your address on the map
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      <Info className="w-3 h-3 inline mr-1" />
                      Drag the red pin or click on the map to adjust the exact location
                    </p>
                    <div className="h-80 bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-200">
                      {isMapLoaded ? (
                        <GoogleMap
                          mapContainerStyle={{ width: '100%', height: '100%' }}
                          center={mapCenter}
                          zoom={15}
                          options={mapOptions}
                          onClick={handleMapClick}
                        >
                          <Marker
                            position={mapCenter}
                            draggable={true}
                            onDragEnd={handleMarkerDragEnd}
                            animation={google.maps.Animation.DROP}
                          />
                        </GoogleMap>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-pulse">
                              <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-gray-600 font-medium">Loading map...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {listing.street && (
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Location: {listing.street}, {listing.city}, {listing.country}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Coordinates: {listing.latitude.toFixed(6)}, {listing.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Basics */}
              {currentStep === 2 && (
                <div>
                  <Counter label="Guests" value={listing.guests} field="guests" />
                  <Counter label="Bedrooms" value={listing.bedrooms} field="bedrooms" />
                  <Counter label="Beds" value={listing.beds} field="beds" />
                  <Counter label="Bathrooms" value={listing.bathrooms} field="bathrooms" min={0.5} step={0.5} />
                </div>
              )}

              {/* Step 3: Amenities */}
              {currentStep === 3 && (
                <div className="space-y-10">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">What about these guest favorites?</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {amenitiesList.favorites.map((amenity) => (
                        <button
                          key={amenity.id}
                          onClick={() => toggleAmenity(amenity.id)}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-start gap-2 hover:border-gray-900 ${
                            listing.amenities.includes(amenity.id)
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <amenity.icon className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
                          <span className="text-sm font-medium text-gray-900">{amenity.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Do you have any standout amenities?</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {amenitiesList.standout.map((amenity) => (
                        <button
                          key={amenity.id}
                          onClick={() => toggleAmenity(amenity.id)}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-start gap-2 hover:border-gray-900 ${
                            listing.amenities.includes(amenity.id)
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <amenity.icon className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
                          <span className="text-sm font-medium text-gray-900">{amenity.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Do you have any of these safety items?</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {amenitiesList.safety.map((amenity) => (
                        <button
                          key={amenity.id}
                          onClick={() => toggleAmenity(amenity.id)}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-start gap-2 hover:border-gray-900 ${
                            listing.amenities.includes(amenity.id)
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <amenity.icon className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
                          <span className="text-sm font-medium text-gray-900">{amenity.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Photos */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-gray-400 transition-colors cursor-pointer group">
                    <div className="flex flex-col items-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e.target.files)}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                          <Camera className="w-10 h-10 text-gray-500" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Drag your photos here</h3>
                        <p className="text-gray-500 mb-6">Add at least 5 photos</p>
                        <span className="px-6 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                          Upload from your device
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Photo grid */}
                  {listing.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {listing.photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Photo ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-xl"
                          />
                          <button
                            onClick={() => setListing({ ...listing, photos: listing.photos.filter((_, i) => i !== index) })}
                            className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <X className="w-5 h-5 text-gray-900" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Title */}
              {currentStep === 5 && (
                <div>
                  <textarea
                    value={listing.title}
                    onChange={(e) => setListing({ ...listing, title: e.target.value.slice(0, 32) })}
                    placeholder="Lovely 2-bedroom flat in Doha"
                    maxLength={32}
                    rows={3}
                    className="w-full px-0 py-0 border-0 focus:ring-0 outline-none text-3xl lg:text-4xl font-semibold placeholder-gray-300 resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-4">{listing.title.length}/32</p>
                </div>
              )}

              {/* Step 6: Description */}
              {currentStep === 6 && (
                <div className="space-y-8">
                  <div>
                    <textarea
                      value={listing.description}
                      onChange={(e) => setListing({ ...listing, description: e.target.value.slice(0, 500) })}
                      placeholder="You'll always remember your time at this unique place."
                      rows={6}
                      maxLength={500}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-lg resize-none"
                    />
                    <p className="text-sm text-gray-500 mt-2">{listing.description.length}/500</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Highlight what makes your place special</h3>
                    <p className="text-gray-500 mb-4">Choose up to 2 highlights</p>
                    <div className="flex flex-wrap gap-3">
                      {highlights.map((h) => (
                        <button
                          key={h.id}
                          onClick={() => toggleHighlight(h.id)}
                          className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                            listing.highlights.includes(h.id)
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-300 text-gray-700 hover:border-gray-900'
                          }`}
                        >
                          {h.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Pricing */}
              {currentStep === 7 && (
                <div className="space-y-8">
                  <div className="text-center py-8">
                    <div className="inline-flex items-center border-b-4 border-gray-900 pb-2">
                      <span className="text-5xl lg:text-6xl font-semibold">$</span>
                      <input
                        type="number"
                        value={listing.basePrice}
                        onChange={(e) => setListing({ ...listing, basePrice: parseInt(e.target.value) || 0 })}
                        className="text-5xl lg:text-6xl font-semibold w-32 text-center border-0 focus:ring-0 outline-none bg-transparent"
                      />
                    </div>
                    <p className="text-gray-500 mt-4">per night</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-700">Base price</span>
                      <span className="font-medium">${listing.basePrice}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-700">Guest service fee</span>
                      <span className="font-medium">${Math.round(listing.basePrice * 0.14)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                      <span className="text-gray-900 font-medium">Guest price before taxes</span>
                      <span className="font-semibold text-lg">${listing.basePrice + Math.round(listing.basePrice * 0.14)}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-500">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Places like yours in your area usually range from $50 to $150</p>
                  </div>
                </div>
              )}

              {/* Step 8: Discounts */}
              {currentStep === 8 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 mb-6">Select the discounts you want to offer. Click to select or deselect. All discounts are fixed at 20%.</p>

                  {/* New Listing Promotion */}
                  <div
                    className={`p-6 border-2 rounded-xl transition-all cursor-pointer ${
                      listing.newListingDiscount > 0
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onClick={() => setListing({
                      ...listing,
                      newListingDiscount: listing.newListingDiscount > 0 ? 0 : 20
                    })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
                          listing.newListingDiscount > 0 ? 'border-green-600 bg-green-600' : 'border-gray-400'
                        }`}>
                          {listing.newListingDiscount > 0 && (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">New listing promotion</h4>
                          <p className="text-gray-500 text-sm mt-1">Offer 20% off your first 3 bookings</p>
                        </div>
                      </div>
                      <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                        listing.newListingDiscount > 0 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        20%
                      </div>
                    </div>
                  </div>

                  {/* Weekly Discount */}
                  <div
                    className={`p-6 border-2 rounded-xl transition-all cursor-pointer ${
                      listing.weeklyDiscount > 0
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onClick={() => setListing({
                      ...listing,
                      weeklyDiscount: listing.weeklyDiscount > 0 ? 0 : 20
                    })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
                          listing.weeklyDiscount > 0 ? 'border-green-600 bg-green-600' : 'border-gray-400'
                        }`}>
                          {listing.weeklyDiscount > 0 && (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Weekly discount</h4>
                          <p className="text-gray-500 text-sm mt-1">For stays of 7 nights or more</p>
                        </div>
                      </div>
                      <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                        listing.weeklyDiscount > 0 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        20%
                      </div>
                    </div>
                  </div>

                  {/* Monthly Discount */}
                  <div
                    className={`p-6 border-2 rounded-xl transition-all cursor-pointer ${
                      listing.monthlyDiscount > 0
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onClick={() => setListing({
                      ...listing,
                      monthlyDiscount: listing.monthlyDiscount > 0 ? 0 : 20
                    })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
                          listing.monthlyDiscount > 0 ? 'border-green-600 bg-green-600' : 'border-gray-400'
                        }`}>
                          {listing.monthlyDiscount > 0 && (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Monthly discount</h4>
                          <p className="text-gray-500 text-sm mt-1">For stays of 28 nights or more</p>
                        </div>
                      </div>
                      <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                        listing.monthlyDiscount > 0 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        20%
                      </div>
                    </div>
                  </div>

                  {/* No discount info */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 text-center">
                      {listing.newListingDiscount === 0 && listing.weeklyDiscount === 0 && listing.monthlyDiscount === 0
                        ? "No discounts selected - your price will remain unchanged"
                        : `Selected discounts will reduce your price by 20% for applicable bookings`
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Step 9: Legal/Safety */}
              {currentStep === 9 && (
                <div className="space-y-6">
                  <div className="p-6 border border-gray-200 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Use Instant Book</h4>
                        <p className="text-gray-500 text-sm mt-1">Let guests book instantly without waiting for approval</p>
                      </div>
                      <button
                        onClick={() => setListing({ ...listing, instantBook: !listing.instantBook })}
                        className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
                          listing.instantBook ? 'bg-gray-900' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                          listing.instantBook ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-medium text-gray-900 mb-4">Does your place have any of these?</h3>

                    {[
                      { key: 'securityCamera', label: 'Security camera(s)', desc: 'Required to disclose and must never monitor indoor private spaces' },
                      { key: 'noiseMonitor', label: 'Noise decibel monitor(s)', desc: 'Required to disclose' },
                      { key: 'weapons', label: 'Weapons', desc: 'Must be properly secured' },
                    ].map((item) => (
                      <div key={item.key} className="py-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-gray-900">{item.label}</h4>
                            <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setListing({ ...listing, [item.key]: !listing[item.key as keyof PropertyFormData] })}
                            className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
                              listing[item.key as keyof PropertyFormData] ? 'bg-gray-900' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                              listing[item.key as keyof PropertyFormData] ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 10: House Rules */}
              {currentStep === 10 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { key: 'allowPets', icon: PawPrint, label: 'Pets allowed' },
                      { key: 'allowSmoking', icon: Cigarette, label: 'Smoking, vaping, e-cigarettes allowed' },
                      { key: 'allowParties', icon: PartyPopper, label: 'Events allowed' },
                    ].map((rule) => (
                      <div key={rule.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <rule.icon className="w-6 h-6 text-gray-600" />
                          <span className="text-gray-900">{rule.label}</span>
                        </div>
                        <button
                          onClick={() => setListing({ ...listing, [rule.key]: !listing[rule.key as keyof PropertyFormData] })}
                          className={`relative w-12 h-7 rounded-full transition-colors ${
                            listing[rule.key as keyof PropertyFormData] ? 'bg-gray-900' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                            listing[rule.key as keyof PropertyFormData] ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-medium text-gray-900 mb-4">Check-in and checkout times</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-2">Check-in after</label>
                        <select
                          value={listing.checkInTime}
                          onChange={(e) => setListing({ ...listing, checkInTime: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        >
                          {['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                          <option value="Flexible">Flexible</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-2">Checkout before</label>
                        <select
                          value={listing.checkOutTime}
                          onChange={(e) => setListing({ ...listing, checkOutTime: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        >
                          {['10:00 AM', '11:00 AM', '12:00 PM'].map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                          <option value="Flexible">Flexible</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 11: Review */}
              {currentStep === 11 && (
                <div className="space-y-8">
                  {/* Preview Card */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      {listing.photos.length > 0 ? (
                        <img
                          src={URL.createObjectURL(listing.photos[0])}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{listing.title || 'Your listing title'}</h3>
                        <span className="text-sm text-gray-500">New</span>
                      </div>
                      <p className="text-gray-500 text-sm">{listing.city || 'City'}, {listing.country}</p>
                      <p className="font-semibold mt-2">${listing.basePrice} <span className="font-normal text-gray-500">night</span></p>
                    </div>
                  </div>

                  {/* What's next */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">What&apos;s next?</h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Confirm a few details and publish</h4>
                          <p className="text-gray-500 text-sm">We&apos;ll let you know if you need to verify your identity or register with the local government.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Set up your calendar</h4>
                          <p className="text-gray-500 text-sm">Choose which dates your listing is available. It will be visible 24 hours after you publish.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Star className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Adjust your settings</h4>
                          <p className="text-gray-500 text-sm">Set house rules, select a cancellation policy, choose how guests book, and more.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        {/* Progress bar */}
        <div className="max-w-7xl mx-auto h-1 bg-gray-100">
          <div
            className="h-full bg-gray-900 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`text-sm font-semibold underline underline-offset-2 transition-colors ${
                currentStep === 0
                  ? 'text-gray-300 cursor-not-allowed no-underline'
                  : 'text-gray-900 hover:text-gray-600'
              }`}
            >
              Back
            </button>

            <button
              onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg"
            >
              {currentStep === steps.length - 1 ? 'Publish' : 'Next'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
