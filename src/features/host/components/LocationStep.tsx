import { useRef, useEffect } from 'react';
import { PropertyFormData } from '../types';
import { MapPin, Info, Check } from 'lucide-react';
import { GoogleMap, Marker } from '@react-google-maps/api';

interface LocationStepProps {
  listing: PropertyFormData;
  setListing: (value: React.SetStateAction<PropertyFormData>) => void;
  isMapLoaded: boolean;
}

export const LocationStep = ({ listing, setListing, isMapLoaded }: LocationStepProps) => {
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

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

          let street = '';
          let city = '';
          let state = '';
          let postalCode = '';
          let country = '';

          place.address_components?.forEach((component) => {
            const types = component.types;
            if (types.includes('street_number')) street = component.long_name + ' ';
            if (types.includes('route')) street += component.long_name;
            if (types.includes('locality')) city = component.long_name;
            if (types.includes('administrative_area_level_1')) state = component.long_name;
            if (types.includes('postal_code')) postalCode = component.long_name;
            if (types.includes('country')) country = component.long_name;
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
  }, [isMapLoaded, setListing]);

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

  const updateLocationFromCoordinates = (lat: number, lng: number) => {
    setListing(prev => ({ ...prev, latitude: lat, longitude: lng }));

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
            if (types.includes('street_number')) street = component.long_name + ' ';
            if (types.includes('route')) street += component.long_name;
            if (types.includes('locality')) city = component.long_name;
            if (types.includes('administrative_area_level_1')) state = component.long_name;
            if (types.includes('postal_code')) postalCode = component.long_name;
            if (types.includes('country')) country = component.long_name;
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
    if (e.latLng) updateLocationFromCoordinates(e.latLng.lat(), e.latLng.lng());
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) updateLocationFromCoordinates(e.latLng.lat(), e.latLng.lng());
  };

  return (
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
              onChange={(e) => setListing(prev => ({ ...prev, country: e.target.value }))}
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
              onChange={(e) => setListing(prev => ({ ...prev, street: e.target.value }))}
              placeholder="Enter your street address"
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apt, suite, etc. (optional)</label>
            <input
              type="text"
              value={listing.apt}
              onChange={(e) => setListing(prev => ({ ...prev, apt: e.target.value }))}
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
                onChange={(e) => setListing(prev => ({ ...prev, city: e.target.value }))}
                placeholder="City"
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal code</label>
              <input
                type="text"
                value={listing.postalCode}
                onChange={(e) => setListing(prev => ({ ...prev, postalCode: e.target.value }))}
                placeholder="Postal code"
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </div>

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
  );
};
