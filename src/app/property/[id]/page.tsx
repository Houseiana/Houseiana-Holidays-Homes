'use client';

import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  ChevronLeft, Share, Heart, Star, Diamond, Users,
  CheckCircle, Calendar, Flag, Minus, Plus,
  ChevronRight, MapPin, Wifi, Car, Coffee, Tv, MoreHorizontal, ShieldCheck, Clock, MessageCircle, Tag, Sparkles, X
} from 'lucide-react';
import { usePropertyDetail, PropertyDetail, PropertyBookingForm } from '@/hooks';

// Dynamically import GoogleMapsView to avoid SSR issues
const GoogleMapsView = dynamic(() => import('@/components/map/GoogleMapsView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

// =============================================================================
// PRESENTATIONAL COMPONENTS
// =============================================================================

interface LightboxProps {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  if (!images.length) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10"
      >
        <X className="w-6 h-6" />
      </button>
      <button
        onClick={onPrev}
        className="absolute left-5 text-white/80 hover:text-white p-3 rounded-full bg-white/10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div className="max-w-5xl w-full px-6">
        <img
          src={images[index]}
          alt={`Photo ${index + 1}`}
          className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
        />
        <div className="mt-4 flex justify-center gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </div>
      <button
        onClick={onNext}
        className="absolute right-5 text-white/80 hover:text-white p-3 rounded-full bg-white/10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}

interface PropertyHeaderProps {
  onBack: () => void;
  onShare: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
}

function PropertyHeader({ onBack, onShare, isLiked, onToggleLike }: PropertyHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-semibold"
          >
            <Share className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={onToggleLike}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm font-semibold ${
              isLiked ? 'text-rose-600 border-rose-200' : 'border-gray-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            Save
          </button>
        </div>
      </div>
    </header>
  );
}

interface PropertyBadgesProps {
  isRareFind: boolean;
  guestFavorite: boolean;
}

function PropertyBadges({ isRareFind, guestFavorite }: PropertyBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {isRareFind && (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
          <Diamond className="w-4 h-4" /> Rare find
        </span>
      )}
      {guestFavorite && (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
          <Heart className="w-4 h-4 fill-current" /> Guest favorite
        </span>
      )}
    </div>
  );
}

interface PropertyTitleSectionProps {
  property: PropertyDetail;
  ratingLabel: string;
}

function PropertyTitleSection({ property, ratingLabel }: PropertyTitleSectionProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{property.title}</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-gray-800 font-semibold">
          <Star className="w-4 h-4 fill-current text-amber-400" />
          <span className="text-sm">{ratingLabel}</span>
        </div>
        <span className="text-sm text-gray-600 flex items-center gap-1">
          <MapPin className="w-4 h-4" /> {property.location}
        </span>
      </div>
    </div>
  );
}

interface HostInfoProps {
  host: PropertyDetail['host'];
}

function HostInfo({ host }: HostInfoProps) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={host.avatar}
        alt={host.name}
        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100"
      />
      <div>
        <p className="font-semibold text-gray-900">Hosted by {host.name}</p>
        <p className="text-sm text-gray-600">New on Houseiana</p>
        {host.verified && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full mt-1">
            <ShieldCheck className="w-3 h-3" />
            Verified host
          </span>
        )}
      </div>
    </div>
  );
}

interface ImageGalleryProps {
  images: string[];
  title: string;
  onImageClick: (index: number) => void;
}

function ImageGallery({ images, title, onImageClick }: ImageGalleryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 h-[280px] sm:h-[360px] md:h-[420px] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
      <div className="col-span-1 sm:col-span-1 md:col-span-2">
        <img
          src={images[0]}
          alt={title}
          className="w-full h-full object-cover hover:scale-[1.01] transition-transform cursor-pointer"
          onClick={() => onImageClick(0)}
        />
      </div>
      <div className="hidden sm:grid sm:col-span-1 md:col-span-2 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        {images.slice(1, 5).map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image}
              alt={`Image ${index + 2}`}
              className="w-full h-full object-cover hover:scale-[1.01] transition-transform cursor-pointer"
              onClick={() => onImageClick(index + 1)}
            />
            {index === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <button className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
                  <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Show all photos</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface PropertyStatsProps {
  guests: number;
  bedrooms: number;
  bathrooms: number;
}

function PropertyStats({ guests, bedrooms, bathrooms }: PropertyStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="p-4 border border-gray-200 rounded-xl flex items-center gap-3 bg-white shadow-sm">
        <Users className="w-5 h-5 text-indigo-600" />
        <div>
          <p className="text-sm text-gray-500">Up to</p>
          <p className="text-lg font-semibold text-gray-900">{guests} guests</p>
        </div>
      </div>
      <div className="p-4 border border-gray-200 rounded-xl flex items-center gap-3 bg-white shadow-sm">
        <CheckCircle className="w-5 h-5 text-indigo-600" />
        <div>
          <p className="text-sm text-gray-500">Bedrooms</p>
          <p className="text-lg font-semibold text-gray-900">{bedrooms}</p>
        </div>
      </div>
      <div className="p-4 border border-gray-200 rounded-xl flex items-center gap-3 bg-white shadow-sm">
        <Flag className="w-5 h-5 text-indigo-600" />
        <div>
          <p className="text-sm text-gray-500">Bathrooms</p>
          <p className="text-lg font-semibold text-gray-900">{bathrooms}</p>
        </div>
      </div>
    </div>
  );
}

interface DescriptionSectionProps {
  description: string;
  perks: string[];
}

function DescriptionSection({ description, perks }: DescriptionSectionProps) {
  return (
    <div className="space-y-3 p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">Why you&apos;ll love it</h2>
      </div>
      <p className="text-gray-700 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-2">
        {perks.map((perk) => (
          <span key={perk} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            {perk}
          </span>
        ))}
      </div>
    </div>
  );
}

function getAmenityIcon(amenity: string) {
  switch (amenity.toLowerCase()) {
    case 'wifi':
      return <Wifi className="w-6 h-6" />;
    case 'parking':
      return <Car className="w-6 h-6" />;
    case 'kitchen':
      return <Coffee className="w-6 h-6" />;
    case 'tv':
      return <Tv className="w-6 h-6" />;
    default:
      return <Wifi className="w-6 h-6" />;
  }
}

interface AmenitiesSectionProps {
  amenities: string[];
}

function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">What this place offers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {amenities.map((amenity) => (
          <div key={amenity} className="flex items-center gap-3 text-gray-800">
            {getAmenityIcon(amenity)}
            <span className="font-medium capitalize">{amenity}</span>
          </div>
        ))}
      </div>
      <button className="mt-4 px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50">
        Show all amenities
      </button>
    </div>
  );
}

interface LocationSectionProps {
  location: string;
  latitude?: number;
  longitude?: number;
  title: string;
}

function LocationSection({ location, latitude, longitude, title }: LocationSectionProps) {
  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <MapPin className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">Where you&apos;ll be</h2>
      </div>
      <p className="text-sm text-gray-700">{location}</p>
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-64">
        {latitude && longitude ? (
          <GoogleMapsView
            latitude={latitude}
            longitude={longitude}
            title={title}
            zoom={15}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <p className="text-gray-600">Map not available</p>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-600">Exact location shown on map. Pin placed by host during listing.</p>
    </div>
  );
}

interface BookingCardProps {
  property: PropertyDetail;
  bookingForm: PropertyBookingForm;
  onBookingFormChange: (updates: Partial<PropertyBookingForm>) => void;
  onUpdateGuests: (change: number) => void;
  onReserve: () => void;
  calculateNights: () => number;
  calculateTotal: () => { base: number; total: number; service: number; cleaning: number };
  isNewListing: boolean;
  reviewLabel: string;
}

function BookingCard({
  property,
  bookingForm,
  onBookingFormChange,
  onUpdateGuests,
  onReserve,
  calculateNights,
  calculateTotal,
  isNewListing,
  reviewLabel,
}: BookingCardProps) {
  const totals = calculateTotal();
  const nights = calculateNights();

  return (
    <div className="sticky top-24 border border-gray-200 rounded-2xl p-6 shadow-xl bg-white space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            ${property.price.toFixed(0)} <span className="text-sm text-gray-600 font-normal">night</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tag className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">{isNewListing ? 'Intro price for early guests' : reviewLabel}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Share className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <MessageCircle className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl divide-y divide-gray-200">
        <div className="grid grid-cols-2">
          <div className="p-3 border-r border-gray-200">
            <label className="text-xs font-semibold text-gray-600">CHECK-IN</label>
            <input
              type="date"
              value={bookingForm.checkIn}
              onChange={(e) => onBookingFormChange({ checkIn: e.target.value })}
              className="w-full text-sm font-semibold text-gray-900"
            />
          </div>
          <div className="p-3">
            <label className="text-xs font-semibold text-gray-600">CHECKOUT</label>
            <input
              type="date"
              value={bookingForm.checkOut}
              onChange={(e) => onBookingFormChange({ checkOut: e.target.value })}
              className="w-full text-sm font-semibold text-gray-900"
            />
          </div>
        </div>
        <div className="p-3">
          <label className="text-xs font-semibold text-gray-600">GUESTS</label>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm font-semibold text-gray-900">{bookingForm.guests} guests</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateGuests(-1)}
                className="p-2 rounded-full border border-gray-200 hover:border-gray-300 disabled:opacity-50"
                disabled={bookingForm.guests <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => onUpdateGuests(1)}
                className="p-2 rounded-full border border-gray-200 hover:border-gray-300"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onReserve}
        className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white py-3 rounded-xl font-bold hover:from-rose-600 hover:to-amber-600 transition-all shadow-lg shadow-rose-200"
      >
        Reserve
      </button>

      <p className="text-center text-sm text-gray-600">You won&apos;t be charged yet</p>

      <div className="border-t pt-4 space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>${property.price.toFixed(0)} x {nights} nights</span>
          <span>${totals.base?.toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span>Cleaning fee</span>
          <span>${totals.cleaning?.toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span>Service fee</span>
          <span>${totals.service?.toFixed(0)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900">
          <span>Total before taxes</span>
          <span>${totals.total?.toFixed(0)}</span>
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900">48-hour free cancellation</p>
            <p className="text-xs text-gray-600">Then moderate policy applies</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Houseiana protection</p>
            <p className="text-xs text-gray-600">Secure payments and verified hosts</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Instant confirmation</p>
            <p className="text-xs text-gray-600">You&apos;ll get details right away</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

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
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
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
