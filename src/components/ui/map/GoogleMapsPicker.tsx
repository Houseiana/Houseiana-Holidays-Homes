'use client';

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Search } from 'lucide-react';

interface GoogleMapsPickerProps {
  initialAddress?: string;
  initialCoordinates?: { lat: number; lng: number };
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: string;
    formattedAddress?: string;
  }) => void;
}

const DEFAULT_CENTER = { lat: 25.2854, lng: 51.5310 }; // Doha, Qatar
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const GoogleMapsPicker: React.FC<GoogleMapsPickerProps> = ({
  initialAddress,
  initialCoordinates,
  onLocationSelect
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral>(
    initialCoordinates || DEFAULT_CENTER
  );
  const [searchInput, setSearchInput] = useState(initialAddress || '');
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  // Initialize geocoder when Google Maps loads
  useEffect(() => {
    if (isLoaded && window.google) {
      setGeocoder(new window.google.maps.Geocoder());
    }
  }, [isLoaded]);

  // Reverse geocode coordinates to get address
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocoder) return;

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const formattedAddress = results[0].formatted_address;
        setSearchInput(formattedAddress);

        onLocationSelect({
          lat,
          lng,
          address: formattedAddress,
          formattedAddress
        });
      }
    });
  }, [geocoder, onLocationSelect]);

  // Geocode address to get coordinates
  const geocodeAddress = useCallback((address: string) => {
    if (!geocoder || !address) return;

    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        const newPosition = { lat, lng };

        setMarkerPosition(newPosition);
        if (map) {
          map.panTo(newPosition);
          map.setZoom(15);
        }

        onLocationSelect({
          lat,
          lng,
          address: results[0].formatted_address,
          formattedAddress: results[0].formatted_address
        });
      } else {
        alert('Could not find location. Please check the address and try again.');
      }
    });
  }, [geocoder, map, onLocationSelect]);

  // Handle map click
  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const newPosition = { lat, lng };

      setMarkerPosition(newPosition);
      reverseGeocode(lat, lng);
    }
  }, [reverseGeocode]);

  // Handle marker drag
  const onMarkerDrag = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
    }
  }, []);

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      reverseGeocode(lat, lng);
    }
  }, [reverseGeocode]);

  // Handle search
  const handleSearch = () => {
    geocodeAddress(searchInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  if (loadError) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] lg:h-[450px] bg-red-50 border-2 border-red-200 rounded-xl flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2 text-sm sm:text-base">Error loading Google Maps</p>
          <p className="text-xs sm:text-sm text-red-500">Please check your API key and try again.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] lg:h-[450px] bg-gray-50 border-2 border-gray-200 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto mb-2 sm:mb-4"></div>
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for an address or click on the map..."
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm sm:text-base"
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          Search
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-indigo-800">
          <span className="font-semibold">Tip:</span> Click anywhere on the map or drag the marker to set your exact property location. You can also search for an address above.
        </p>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg h-[300px] sm:h-[400px] lg:h-[450px]">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={markerPosition}
          zoom={13}
          onClick={onMapClick}
          onLoad={setMap}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true,
          }}
        >
          <Marker
            position={markerPosition}
            draggable={true}
            onDrag={onMarkerDrag}
            onDragEnd={onMarkerDragEnd}
          />
        </GoogleMap>
      </div>

      {/* Coordinates Display */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-gray-700 break-all">
          <span className="font-semibold">Selected Coordinates:</span> {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
        </p>
      </div>
    </div>
  );
};

export default GoogleMapsPicker;
