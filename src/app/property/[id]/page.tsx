'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePropertyDetail, PropertyBookingForm } from '@/hooks';
import {
  Lightbox,
  PropertyHeader,
  PropertyBadges,
  PropertyTitleSection,
  HostInfo,
  ImageGallery,
  PropertyStats,
  DescriptionSection,
  AmenitiesSection,
  LocationSection,
  BookingCard,
} from '@/features/property/components';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const {
    property,
    loading,
    isLiked,
    setIsLiked,
    selectedImageIndex,
    setSelectedImageIndex,
    showLightbox,
    setShowLightbox,
    bookingForm,
    setBookingForm,
    updateGuests,
    shareProperty,
    prevImage,
    nextImage,
    calculateNights,
    calculateTotal,
    isNewListing,
    reviewLabel,
    ratingLabel,
    getBookingUrl,
  } = usePropertyDetail(propertyId);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowLightbox(true);
  };

  const handleBookingFormChange = (updates: Partial<PropertyBookingForm>) => {
    setBookingForm(prev => ({ ...prev, ...updates }));
  };

  const handleReserve = () => {
    if (calculateNights() > 0 && property) {
      router.push(getBookingUrl());
    }
  };

  if (loading || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto min-h-screen">
      {showLightbox && (
        <Lightbox
          images={property.images}
          index={selectedImageIndex}
          onClose={() => setShowLightbox(false)}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}

      <PropertyHeader
        onBack={() => router.back()}
        onShare={shareProperty}
        isLiked={isLiked}
        onToggleLike={() => setIsLiked(!isLiked)}
      />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3">
          <PropertyBadges
            isRareFind={property.isRareFind}
            guestFavorite={property.guestFavorite}
          />
          <PropertyTitleSection property={property} ratingLabel={ratingLabel} />
          <HostInfo host={property.host} />
        </div>

        <ImageGallery
          images={property.images}
          title={property.title}
          onImageClick={handleImageClick}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <PropertyStats
              guests={property.guests}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
            />

            <DescriptionSection
              description={property.description}
              perks={property.perks || ['Flexible check-in', 'Self check-in', 'Dedicated workspace']}
            />

            <AmenitiesSection amenities={property.amenities} />

            <LocationSection
              location={property.location}
              latitude={property.latitude}
              longitude={property.longitude}
              title={property.title}
            />
          </div>

          <div className="lg:col-span-1">
            <BookingCard
              property={property}
              bookingForm={bookingForm}
              onBookingFormChange={handleBookingFormChange}
              onUpdateGuests={updateGuests}
              onReserve={handleReserve}
              calculateNights={calculateNights}
              calculateTotal={calculateTotal}
              isNewListing={isNewListing}
              reviewLabel={reviewLabel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
