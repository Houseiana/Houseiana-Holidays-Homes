
'use client';

import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import PropertySearchBar from '@/components2/common/search/property-search-bar';
import AirbnbFilter, { FilterState } from '@/components2/common/filters/airbnb-filter';

const heroImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Aurora Borealis with people
  'https://images.unsplash.com/photo-1549144511-f099e773c147?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Eiffel Tower with people visiting
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Luxury vacation home
  'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80', // Beautiful Aurora Borealis
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'  // Modern apartment
];

export function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    propertyType: '',
    priceMin: 0,
    priceMax: 1000,
    bedrooms: 0,
    beds: 0,
    bathrooms: 0,
    maxGuests: 0,
    minRating: 0,
    amenities: []
  });

  // TODO: Fetch from API - platform statistics
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalCountries: 0,
    averageRating: 0
  });



  // Preload images
  useEffect(() => {
    const loadedStates = new Array(heroImages.length).fill(false);
    setImagesLoaded(loadedStates);

    heroImages.forEach((src, index) => {
      const img = new Image();
      img.onload = () => {
        console.log(`Image ${index} loaded successfully:`, src);
        setImagesLoaded(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      };
      img.onerror = () => {
        console.error(`Image ${index} failed to load:`, src);
        // Still mark as loaded to show fallback
        setImagesLoaded(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      };
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000); // Reduced from 5000 to 4000ms
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (searchData: any) => {
    try {
      const queryParams = new URLSearchParams();

      // Location
      if (searchData.location && searchData.location.trim()) {
        queryParams.append('location', searchData.location.trim());
      }

      // Dates - with error handling
      if (searchData.checkIn && searchData.checkIn instanceof Date) {
        queryParams.append('checkin', searchData.checkIn.toISOString());
      }
      if (searchData.checkOut && searchData.checkOut instanceof Date) {
        queryParams.append('checkout', searchData.checkOut.toISOString());
      }

      // Guests - with null checking
      const guests = searchData.guests || { adults: 0, children: 0, infants: 0, pets: 0 };
      const totalGuests = (guests.adults || 0) + (guests.children || 0);

      if (totalGuests > 0) {
        queryParams.append('guests', totalGuests.toString());
      }
      if (guests.adults > 0) queryParams.append('adults', guests.adults.toString());
      if (guests.children > 0) queryParams.append('children', guests.children.toString());
      if (guests.infants > 0) queryParams.append('infants', guests.infants.toString());
      if (guests.pets > 0) queryParams.append('pets', guests.pets.toString());

      // Advanced filters - with null checking
      if (advancedFilters.propertyType && advancedFilters.propertyType !== 'any') {
        queryParams.append('propertyType', advancedFilters.propertyType);
      }
      if (advancedFilters.priceMin > 0) {
        queryParams.append('priceMin', advancedFilters.priceMin.toString());
      }
      if (advancedFilters.priceMax < 1000) {
        queryParams.append('priceMax', advancedFilters.priceMax.toString());
      }
      if (advancedFilters.bedrooms > 0) {
        queryParams.append('bedrooms', advancedFilters.bedrooms.toString());
      }
      if (advancedFilters.beds > 0) {
        queryParams.append('beds', advancedFilters.beds.toString());
      }
      if (advancedFilters.bathrooms > 0) {
        queryParams.append('bathrooms', advancedFilters.bathrooms.toString());
      }
      if (advancedFilters.maxGuests > 0) {
        queryParams.append('maxGuests', advancedFilters.maxGuests.toString());
      }
      if (advancedFilters.minRating > 0) {
        queryParams.append('minRating', advancedFilters.minRating.toString());
      }
      if (advancedFilters.amenities && advancedFilters.amenities.length > 0) {
        queryParams.append('amenities', advancedFilters.amenities.join(','));
      }

      // Navigate to discover page
      const searchUrl = `/discover?${queryParams.toString()}`;
      console.log('Searching with URL:', searchUrl);
      window.location.href = searchUrl;
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to basic search
      window.location.href = '/discover';
    }
  };


  return (
    <section className="relative min-h-screen h-[120vh] overflow-hidden">
      {/* Background Image with Transition */}
      <div className="absolute inset-0">
        {/* Default background while images load */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900" />

        {heroImages.map((image, index) => {
          const isCurrentImage = index === currentImageIndex;
          const isImageLoaded = imagesLoaded[index];

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isCurrentImage ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: index === 3 ? '#2D1B69' : 'transparent' // Aurora-like fallback for slide 4
              }}
            />
          );
        })}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 h-full flex items-center justify-center px-4 pb-32">
        <div className="text-center text-white max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-fade-in">
            Discover Your Perfect
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Home Away From Home
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 font-light text-gray-100 max-w-3xl mx-auto">
            Book unique homes and places to stay around the world with confidence
          </p>

          {/* Property Search Box */}
          <div className="hidden md:block">
            <PropertySearchBar variant="expanded" onSearch={handleSearch} />
          </div>
          <div className="md:hidden">
            <PropertySearchBar variant="compact" onSearch={handleSearch} />
          </div>

          {/* Advanced Filters Button */}
          <div className="mt-4">
            <button
              onClick={() => setIsFiltersOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors border border-white/20"
            >
              <Filter className="w-4 h-4 mr-2" />
              More filters
            </button>
          </div>

          {/* Quick Stats */}
          {(stats.totalProperties > 0 || stats.totalCountries > 0 || stats.averageRating > 0) && (
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 mt-8 sm:mt-12 text-white/80 px-4">
              {stats.totalProperties > 0 && (
                <>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold">{stats.totalProperties >= 1000000 ? `${(stats.totalProperties / 1000000).toFixed(1)}M+` : `${stats.totalProperties}+`}</div>
                    <div className="text-xs sm:text-sm">Properties</div>
                  </div>
                  <div className="w-px h-6 sm:h-8 bg-white/30" />
                </>
              )}
              {stats.totalCountries > 0 && (
                <>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold">{stats.totalCountries}+</div>
                    <div className="text-xs sm:text-sm">Countries</div>
                  </div>
                  <div className="w-px h-6 sm:h-8 bg-white/30" />
                </>
              )}
              {stats.averageRating > 0 && (
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">{stats.averageRating.toFixed(1)}★</div>
                  <div className="text-xs sm:text-sm">Rating</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? 'bg-white scale-110'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
        </div>
      </div>

      {/* Airbnb-style Filter Modal */}
      <AirbnbFilter
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        onApply={(appliedFilters) => {
          setAdvancedFilters(appliedFilters);
          setIsFiltersOpen(false);
        }}
      />
    </section>
  );
}
