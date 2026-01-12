'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyAPI } from '@/lib/api/backend-api';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useLoadScript } from '@react-google-maps/api';
import Swal from 'sweetalert2';
import { Home } from 'lucide-react';
import { PropertyFormData } from '@/features/host/types';
import {
  PropertyTypeStep,
  LocationStep,
  BasicsStep,
  AmenitiesStep,
  PhotosStep,
  TitleStep,
  DescriptionStep,
  PricingStep,
  DiscountsStep,
  LegalStep,
  HouseRulesStep,
  ReviewStep,
  ClassificationStep,
  CancellationPolicyStep,
  DocumentsStep
} from '@/features/host/components';

const libraries: ("places")[] = ["places"];

export default function AddListingPage() {
  const router = useRouter();
  const { getToken, userId, isLoaded, isSignedIn } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [listing, setListing] = useState<PropertyFormData>({
    propertyType: '',
    country: 'Qatar',
    street: '',
    apt: '',
    city: '',
    state: '',
    postalCode: '',
    latitude: 25.2854,
    longitude: 51.5310,
    guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: [],
    safetyItems: [],
    guestFavorites: [],
    photos: [],
    title: '',
    description: '',
    highlights: [],
    stars: 0,
    CancellationPolicy: {
      PolicyType: 'FLEXIBLE',
      FreeCancellationHours: null,
      FreeCancellationDays: null,
    },
    cleaningFee: 0,
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
    documentOfProperty: {
      PrpopertyDocoument: null,
      HostId: null,
      PowerOfAttorney: null,
    },
  });

  const { isLoaded: isMapLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const steps = [
    { id: 0, phase: 1, title: 'Tell us about your place', subtitle: 'Which of these best describes your place?' },
    { id: 1, phase: 1, title: "Where's your place located?", subtitle: 'Your address is only shared with guests after they book' },
    { id: 2, phase: 1, title: 'Share some basics about your place', subtitle: 'You\'ll add more details later, like bed types' },
    { id: 3, phase: 2, title: 'Tell guests what your place has to offer', subtitle: 'You can add more amenities after you publish' },
    { id: 4, phase: 2, title: 'Add some photos of your place', subtitle: 'You\'ll need 5 photos to get started. You can add more or make changes later' },
    { id: 5, phase: 3, title: "Now, let's give your place a title", subtitle: 'Short titles work best. Have fun with it—you can always change it later' },
    { id: 6, phase: 3, title: 'Create your description', subtitle: 'Share what makes your place special' },
    { id: 7, phase: 3, title: 'Classify your unit', subtitle: 'How would you rate your property?' },
    { id: 8, phase: 3, title: 'Now, set your price', subtitle: 'You can change it anytime' },
    { id: 9, phase: 3, title: 'Add discounts', subtitle: 'Help your place stand out to get booked faster and earn your first reviews' },
    { id: 10, phase: 3, title: 'Cancellation Policy', subtitle: 'Choose a policy that works for you and your guests' },
    { id: 11, phase: 3, title: 'Just a few last questions...', subtitle: 'These help us personalize your hosting experience' },
    { id: 12, phase: 3, title: 'Set your house rules', subtitle: 'Guests must agree to your rules before they book' },
    { id: 13, phase: 3, title: 'Required Documents', subtitle: 'Upload documents to verify your property and identity' },
    { id: 14, phase: 3, title: 'Review your listing', subtitle: 'Here\'s what we\'ll show to guests. Make sure everything looks good' },
  ];

  const phases = [
    { id: 1, title: 'Tell us about your place', steps: [0, 1, 2] },
    { id: 2, title: 'Make it stand out', steps: [3, 4] },
    { id: 3, title: 'Finish up and publish', steps: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
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

  const updateCounter = (field: keyof PropertyFormData, delta: number) => {
    const min = field === 'bathrooms' ? 0.5 : 1;
    const currentValue = listing[field] as number;
    const newValue = Math.max(min, currentValue + delta);
    setListing({ ...listing, [field]: newValue });
  };

  const handleSubmit = async () => {
    if (!isLoaded || !isSignedIn || !userId) {
      await Swal.fire({
        icon: 'error',
        title: 'Authentication Required',
        text: 'Please sign in to create a listing',
        confirmButtonColor: '#000',
      });
      router.push('/sign-in');
      return;
    }

    if (!listing.title || !listing.description) {
      await Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please provide a title and description for your property',
        confirmButtonColor: '#000',
      });
      setCurrentStep(5);
      return;
    }

    if (!listing.propertyType) {
      await Swal.fire({
        icon: 'error',
        title: 'Missing Property Type',
        text: 'Please select a property type',
        confirmButtonColor: '#000',
      });
      setCurrentStep(0);
      return;
    }

    if (!listing.city || !listing.country) {
      await Swal.fire({
        icon: 'error',
        title: 'Incomplete Location',
        text: 'Please provide complete location information',
        confirmButtonColor: '#000',
      });
      setCurrentStep(1);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('hostId', userId);
      formData.append('title', listing.title);
      formData.append('description', listing.description);
      if (listing.stars) {
        formData.append('stars', listing.stars.toString());
      }
      
      if (listing.CancellationPolicy) {
        formData.append('cancellationPolicy', JSON.stringify(listing.CancellationPolicy));
      }

      formData.append('propertyType', listing.propertyType);
      formData.append('country', listing.country);
      formData.append('city', listing.city);
      formData.append('state', listing.state || '');
      formData.append('address', `${listing.street}, ${listing.apt}`.trim());
      formData.append('zipCode', listing.postalCode || '');
      
      // Handle numeric values
      formData.append('guests', listing.guests.toString());
      formData.append('bedrooms', listing.bedrooms.toString());
      formData.append('beds', listing.beds.toString());
      formData.append('bathrooms', listing.bathrooms.toString());
      formData.append('pricePerNight', listing.basePrice.toString());
      
      formData.append('cleaningFee', listing.cleaningFee.toString());
      formData.append('serviceFee', '0');
      formData.append('weeklyDiscount', listing.weeklyDiscount.toString());
      formData.append('monthlyDiscount', listing.monthlyDiscount.toString());
      
      // Handle booleans
      formData.append('instantBook', String(listing.instantBook));
      formData.append('allowPets', String(listing.allowPets));
      formData.append('allowSmoking', String(listing.allowSmoking));
      formData.append('allowEvents', String(listing.allowParties));
      
      formData.append('status', 'DRAFT');
      
      // Handle other fields
      formData.append('checkInTime', listing.checkInTime);
      formData.append('checkOutTime', listing.checkOutTime);
      formData.append('minNights', '1');

      // Handle arrays
      if (listing.amenities && listing.amenities.length > 0) {
        listing.amenities.forEach((amenity: any) => {
           formData.append('amenities', amenity.toString());
        });
      }
      
      if (listing.safetyItems && listing.safetyItems.length > 0) {
        listing.safetyItems.forEach((item: any) => {
           formData.append('safetyItem', item.toString());
        });
      }
      
      if (listing.guestFavorites && listing.guestFavorites.length > 0) {
        listing.guestFavorites.forEach((fav: any) => {
           formData.append('guestFavorites', fav.toString());
        });
      }
      
      if (listing.highlights && listing.highlights.length > 0) {
        listing.highlights.forEach((highlight: any) => {
           formData.append('propertyHighlight', highlight.toString());
        });
      }

      // Handle photos (binary)
      if (listing.photos && listing.photos.length > 0) {
        listing.photos.forEach((photo: File) => {
          formData.append('photos', photo);
        });
      }

      // Handle documents
      if (listing.documentOfProperty.PrpopertyDocoument) {
        formData.append('PrpopertyDocoument', listing.documentOfProperty.PrpopertyDocoument);
      }
      if (listing.documentOfProperty.HostId) {
        formData.append('HostId', listing.documentOfProperty.HostId);
      }
      if (listing.documentOfProperty.PowerOfAttorney) {
        formData.append('PowerOfAttorney', listing.documentOfProperty.PowerOfAttorney);
      }

      const clerkToken = await getToken();
      if (!clerkToken) {
        await Swal.fire({
          icon: 'error',
          title: 'Authentication Failed',
          text: 'Please sign in again.',
          confirmButtonColor: '#000',
        });
        router.push('/sign-in');
        return;
      }

      // We need to cast formData to any because the Create method expects a specific object type primarily, 
      // but we modified it to accept FormData as well in the implementation.
      const response = await PropertyAPI.create(formData as any, clerkToken);

      if (response.success && response.data) {
        await Swal.fire({
          icon: 'success',
          title: 'Property Created!',
          text: `Property "${listing.title}" created successfully!`,
          confirmButtonColor: '#000',
        });
        router.push('/host-dashboard');
      } else {
        throw new Error(response.error || 'Failed to add property');
      }
    } catch (error: any) {
      console.error('Error submitting property:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: `Failed to add property: ${error.message}`,
        confirmButtonColor: '#000',
      });
    }
  };

  const currentPhase = phases.find(p => p.steps.includes(currentStep));
  const phaseProgress = currentPhase ? ((currentPhase.steps.indexOf(currentStep) + 1) / currentPhase.steps.length) * 100 : 0;

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <PropertyTypeStep listing={listing} setListing={setListing} />;
      case 1: return <LocationStep listing={listing} setListing={setListing} isMapLoaded={isMapLoaded} />;
      case 2: return <BasicsStep listing={listing} updateCounter={updateCounter} />;
      case 3: return <AmenitiesStep listing={listing} setListing={setListing} />;
      case 4: return <PhotosStep listing={listing} setListing={setListing} />;
      case 5: return <TitleStep listing={listing} setListing={setListing} />;
      case 6: return <DescriptionStep listing={listing} setListing={setListing} />;
      case 7: return <ClassificationStep listing={listing} setListing={setListing} />;
      case 8: return <PricingStep listing={listing} setListing={setListing} />;
      case 9: return <DiscountsStep listing={listing} setListing={setListing} />;
      case 10: return <CancellationPolicyStep listing={listing} setListing={setListing} />;
      case 11: return <LegalStep listing={listing} setListing={setListing} />;
      case 12: return <HouseRulesStep listing={listing} setListing={setListing} />;
      case 13: return <DocumentsStep listing={listing} setListing={setListing} />;
      case 14: return <ReviewStep listing={listing} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-white flex flex-col">
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

      <main className="flex-1 pt-16 lg:pt-10 pb-24">
        <div className="h-full flex flex-col lg:flex-row">
          <div className="hidden lg:flex lg:w-1/2 bg-black text-white sticky top-20 h-[calc(100vh-5rem-6rem)] items-center justify-center p-12">
            <div className="max-w-md">
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

              <div className="mt-16 opacity-20">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-white">
                  <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
                  <circle cx="60" cy="60" r="30" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex-1 lg:w-1/2 overflow-y-auto">
            <div className="max-w-xl mx-auto px-6 py-8 lg:py-12">
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

              <p className="hidden lg:block text-gray-500 mb-8">{steps[currentStep].subtitle}</p>

              {renderStep()}
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
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
