/**
 * Unified Search Page
 * Search for properties, flights, and car rentals
 */
'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import {
  Home, Plane, Car, Search, Filter, MapPin, Calendar,
  Users, DollarSign, Heart, Clock, Building2, Zap
} from 'lucide-react';

type SearchTab = 'properties' | 'flights' | 'cars';

interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  pricePerNight: number;
  photos: string[];
  city: string;
  country: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  instantBook: boolean;
}

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureCity: string;
  arrivalCity: string;
  departureCountry: string;
  arrivalCountry: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  economyPrice: number;
  businessPrice: number;
  firstClassPrice: number;
  currency: string;
  availableSeats: number;
  stops: number;
  status: string;
}

interface CarRental {
  id: string;
  carMake: string;
  carModel: string;
  carYear: number;
  carType: string;
  transmission: string;
  fuelType: string;
  seats: number;
  features: string[];
  images: string[];
  pickupLocation: string;
  dropoffLocation: string;
  city: string;
  country: string;
  pricePerDay: number;
  currency: string;
  available: boolean;
  rentalCompany: string;
}

export default function ExplorePage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<SearchTab>('properties');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Properties state
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyFilters, setPropertyFilters] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    bedrooms: '',
    instantBook: false
  });

  // Flights state
  const [flights, setFlights] = useState<Flight[]>([]);
  const [flightFilters, setFlightFilters] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    passengers: '1',
    classType: 'ECONOMY',
    stops: 'any'
  });

  // Car Rentals state
  const [carRentals, setCarRentals] = useState<CarRental[]>([]);
  const [carFilters, setCarFilters] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    dropoffDate: '',
    carType: '',
    transmission: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    // Load initial data based on active tab
    if (activeTab === 'properties') {
      loadProperties();
    } else if (activeTab === 'flights') {
      loadFlights();
    } else if (activeTab === 'cars') {
      loadCarRentals();
    }
  }, [activeTab]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (propertyFilters.location) params.append('location', propertyFilters.location);
      if (propertyFilters.guests) params.append('minGuests', propertyFilters.guests);
      if (propertyFilters.minPrice) params.append('minPrice', propertyFilters.minPrice);
      if (propertyFilters.maxPrice) params.append('maxPrice', propertyFilters.maxPrice);
      if (propertyFilters.propertyType) params.append('type', propertyFilters.propertyType);
      if (propertyFilters.bedrooms) params.append('bedrooms', propertyFilters.bedrooms);
      if (propertyFilters.instantBook) params.append('instantBooking', 'true');

      // Mock data for now - replace with actual API call
      setProperties([
        {
          id: '1',
          title: 'Luxury Beach Villa',
          description: 'Beautiful oceanfront property',
          propertyType: 'VILLA',
          pricePerNight: 350,
          photos: [],
          city: 'Miami',
          country: 'USA',
          guests: 6,
          bedrooms: 3,
          bathrooms: 2,
          amenities: ['WiFi', 'Pool', 'Beach Access'],
          instantBook: true
        }
      ]);
    } catch (err) {
      setError('Failed to load properties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFlights = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with actual API call
      setFlights([
        {
          id: '1',
          airline: 'American Airlines',
          flightNumber: 'AA123',
          departureAirport: 'JFK',
          arrivalAirport: 'LAX',
          departureCity: 'New York',
          arrivalCity: 'Los Angeles',
          departureCountry: 'USA',
          arrivalCountry: 'USA',
          departureTime: '2025-12-01T08:00:00',
          arrivalTime: '2025-12-01T11:30:00',
          duration: 330,
          economyPrice: 299,
          businessPrice: 899,
          firstClassPrice: 1499,
          currency: 'USD',
          availableSeats: 45,
          stops: 0,
          status: 'SCHEDULED'
        }
      ]);
    } catch (err) {
      setError('Failed to load flights');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCarRentals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with actual API call
      setCarRentals([
        {
          id: '1',
          carMake: 'Toyota',
          carModel: 'Camry',
          carYear: 2024,
          carType: 'SEDAN',
          transmission: 'AUTOMATIC',
          fuelType: 'PETROL',
          seats: 5,
          features: ['GPS', 'Bluetooth', 'Backup Camera'],
          images: [],
          pickupLocation: 'LAX Airport',
          dropoffLocation: 'LAX Airport',
          city: 'Los Angeles',
          country: 'USA',
          pricePerDay: 45,
          currency: 'USD',
          available: true,
          rentalCompany: 'Enterprise'
        }
      ]);
    } catch (err) {
      setError('Failed to load car rentals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'properties') {
      loadProperties();
    } else if (activeTab === 'flights') {
      loadFlights();
    } else if (activeTab === 'cars') {
      loadCarRentals();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search & Explore</h1>
        <p className="text-sm text-gray-500">Find properties, flights, and car rentals for your next adventure</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2 pb-4 px-6 border-b-2 font-semibold text-sm transition-all ${
              activeTab === 'properties'
                ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home className="w-5 h-5" />
            Properties
          </button>
          <button
            onClick={() => setActiveTab('flights')}
            className={`flex items-center gap-2 pb-4 px-6 border-b-2 font-semibold text-sm transition-all ${
              activeTab === 'flights'
                ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plane className="w-5 h-5" />
            Flights
          </button>
          <button
            onClick={() => setActiveTab('cars')}
            className={`flex items-center gap-2 pb-4 px-6 border-b-2 font-semibold text-sm transition-all ${
              activeTab === 'cars'
                ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Car className="w-5 h-5" />
            Car Rentals
          </button>
        </nav>
      </div>

      {/* Search Forms */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        {/* Properties Search */}
        {activeTab === 'properties' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <MapPin className="w-3 h-3 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                value={propertyFilters.location}
                onChange={(e) => setPropertyFilters({ ...propertyFilters, location: e.target.value })}
                placeholder="City or country"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <Calendar className="w-3 h-3 inline mr-1" />
                Check-in
              </label>
              <input
                type="date"
                value={propertyFilters.checkIn}
                onChange={(e) => setPropertyFilters({ ...propertyFilters, checkIn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <Calendar className="w-3 h-3 inline mr-1" />
                Check-out
              </label>
              <input
                type="date"
                value={propertyFilters.checkOut}
                onChange={(e) => setPropertyFilters({ ...propertyFilters, checkOut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <Users className="w-3 h-3 inline mr-1" />
                Guests
              </label>
              <input
                type="number"
                value={propertyFilters.guests}
                onChange={(e) => setPropertyFilters({ ...propertyFilters, guests: e.target.value })}
                placeholder="2"
                min="1"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Property Type</label>
              <select
                value={propertyFilters.propertyType}
                onChange={(e) => setPropertyFilters({ ...propertyFilters, propertyType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Types</option>
                <option value="HOUSE">House</option>
                <option value="APARTMENT">Apartment</option>
                <option value="VILLA">Villa</option>
                <option value="CONDO">Condo</option>
                <option value="STUDIO">Studio</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <DollarSign className="w-3 h-3 inline mr-1" />
                Min Price
              </label>
              <input
                type="number"
                value={propertyFilters.minPrice}
                onChange={(e) => setPropertyFilters({ ...propertyFilters, minPrice: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <DollarSign className="w-3 h-3 inline mr-1" />
                Max Price
              </label>
              <input
                type="number"
                value={propertyFilters.maxPrice}
                onChange={(e) => setPropertyFilters({ ...propertyFilters, maxPrice: e.target.value })}
                placeholder="1000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={propertyFilters.instantBook}
                  onChange={(e) => setPropertyFilters({ ...propertyFilters, instantBook: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Zap className="w-4 h-4 text-orange-500" />
                  Instant Book
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Flights Search */}
        {activeTab === 'flights' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <MapPin className="w-3 h-3 inline mr-1" />
                From
              </label>
              <input
                type="text"
                value={flightFilters.from}
                onChange={(e) => setFlightFilters({ ...flightFilters, from: e.target.value })}
                placeholder="Airport or city"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <MapPin className="w-3 h-3 inline mr-1" />
                To
              </label>
              <input
                type="text"
                value={flightFilters.to}
                onChange={(e) => setFlightFilters({ ...flightFilters, to: e.target.value })}
                placeholder="Airport or city"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <Calendar className="w-3 h-3 inline mr-1" />
                Departure
              </label>
              <input
                type="date"
                value={flightFilters.departureDate}
                onChange={(e) => setFlightFilters({ ...flightFilters, departureDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <Calendar className="w-3 h-3 inline mr-1" />
                Return (Optional)
              </label>
              <input
                type="date"
                value={flightFilters.returnDate}
                onChange={(e) => setFlightFilters({ ...flightFilters, returnDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <Users className="w-3 h-3 inline mr-1" />
                Passengers
              </label>
              <input
                type="number"
                value={flightFilters.passengers}
                onChange={(e) => setFlightFilters({ ...flightFilters, passengers: e.target.value })}
                min="1"
                max="9"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Class</label>
              <select
                value={flightFilters.classType}
                onChange={(e) => setFlightFilters({ ...flightFilters, classType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="ECONOMY">Economy</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST_CLASS">First Class</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Stops</label>
              <select
                value={flightFilters.stops}
                onChange={(e) => setFlightFilters({ ...flightFilters, stops: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="any">Any</option>
                <option value="0">Direct only</option>
                <option value="1">1 stop max</option>
              </select>
            </div>
          </div>
        )}

        {/* Car Rentals Search */}
        {activeTab === 'cars' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <MapPin className="w-3 h-3 inline mr-1" />
                Pickup Location
              </label>
              <input
                type="text"
                value={carFilters.pickupLocation}
                onChange={(e) => setCarFilters({ ...carFilters, pickupLocation: e.target.value })}
                placeholder="City or airport"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <MapPin className="w-3 h-3 inline mr-1" />
                Drop-off Location
              </label>
              <input
                type="text"
                value={carFilters.dropoffLocation}
                onChange={(e) => setCarFilters({ ...carFilters, dropoffLocation: e.target.value })}
                placeholder="Same as pickup"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <Calendar className="w-3 h-3 inline mr-1" />
                Pickup Date
              </label>
              <input
                type="date"
                value={carFilters.pickupDate}
                onChange={(e) => setCarFilters({ ...carFilters, pickupDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <Calendar className="w-3 h-3 inline mr-1" />
                Drop-off Date
              </label>
              <input
                type="date"
                value={carFilters.dropoffDate}
                onChange={(e) => setCarFilters({ ...carFilters, dropoffDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Car Type</label>
              <select
                value={carFilters.carType}
                onChange={(e) => setCarFilters({ ...carFilters, carType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Types</option>
                <option value="SEDAN">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="LUXURY">Luxury</option>
                <option value="ELECTRIC">Electric</option>
                <option value="VAN">Van</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Transmission</label>
              <select
                value={carFilters.transmission}
                onChange={(e) => setCarFilters({ ...carFilters, transmission: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Any</option>
                <option value="AUTOMATIC">Automatic</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
          </div>
        )}

        {/* Search Button */}
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold text-sm"
          >
            <Search className="w-4 h-4" />
            Search {activeTab === 'properties' ? 'Properties' : activeTab === 'flights' ? 'Flights' : 'Cars'}
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div>
          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {activeTab === 'properties' && `${properties.length} properties found`}
              {activeTab === 'flights' && `${flights.length} flights found`}
              {activeTab === 'cars' && `${carRentals.length} car rentals found`}
            </p>
          </div>

          {/* Properties Results */}
          {activeTab === 'properties' && properties.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500">Try adjusting your search filters</p>
            </div>
          )}

          {activeTab === 'properties' && properties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {property.photos.length > 0 ? (
                      <img src={property.photos[0]} alt={property.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                    {property.instantBook && (
                      <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Instant Book
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{property.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {property.city}, {property.country}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span>{property.guests} guests</span>
                      <span>•</span>
                      <span>{property.bedrooms} beds</span>
                      <span>•</span>
                      <span>{property.bathrooms} bath</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">${property.pricePerNight}</p>
                        <p className="text-xs text-gray-500">per night</p>
                      </div>
                      <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Flights Results */}
          {activeTab === 'flights' && flights.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No flights found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}

          {activeTab === 'flights' && flights.length > 0 && (
            <div className="space-y-4">
              {flights.map((flight) => (
                <div
                  key={flight.id}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Plane className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{flight.airline}</p>
                        <p className="text-sm text-gray-500">{flight.flightNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">${flight.economyPrice}</p>
                      <p className="text-xs text-gray-500">per person</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{flight.departureAirport}</p>
                      <p className="text-sm text-gray-600">{flight.departureCity}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(flight.departureTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div className="h-px bg-gray-300 flex-1"></div>
                      </div>
                      <p className="text-sm text-gray-600">{Math.floor(flight.duration / 60)}h {flight.duration % 60}m</p>
                      <p className="text-xs text-gray-500">{flight.stops === 0 ? 'Direct' : `${flight.stops} stop(s)`}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{flight.arrivalAirport}</p>
                      <p className="text-sm text-gray-600">{flight.arrivalCity}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(flight.arrivalTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">{flight.availableSeats} seats available</p>
                    <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-sm">
                      Select Flight
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Car Rentals Results */}
          {activeTab === 'cars' && carRentals.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No cars found</h3>
              <p className="text-gray-500">Try adjusting your search options</p>
            </div>
          )}

          {activeTab === 'cars' && carRentals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {carRentals.map((car) => (
                <div
                  key={car.id}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100">
                    {car.images.length > 0 ? (
                      <img src={car.images[0]} alt={`${car.carMake} ${car.carModel}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-20 h-20 text-blue-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{car.carMake} {car.carModel}</h3>
                        <p className="text-sm text-gray-600">{car.carYear} • {car.carType}</p>
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        Available
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span>{car.seats} seats</span>
                      <span>•</span>
                      <span>{car.transmission}</span>
                      <span>•</span>
                      <span>{car.fuelType}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {car.pickupLocation}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">{car.rentalCompany}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">${car.pricePerDay}</p>
                        <p className="text-xs text-gray-500">per day</p>
                      </div>
                      <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
