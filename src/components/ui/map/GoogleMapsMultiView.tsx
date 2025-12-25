'use client';

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { Star } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  pricePerNight?: number;
  basePrice?: number;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  totalReviews?: number;
  coverPhoto?: string;
  image?: string;
}

interface GoogleMapsMultiViewProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  onPropertyClick?: (propertyId: string) => void;
}

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 25.2854, lng: 51.5310 }; // Doha, Qatar

/**
 * Google Maps component for displaying multiple properties with markers
 * Used in discover/search pages to show property locations on a map
 */
const GoogleMapsMultiView: React.FC<GoogleMapsMultiViewProps> = ({
  properties,
  center,
  zoom = 12,
  onPropertyClick
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  const mapCenter = center ? { lat: center[0], lng: center[1] } : DEFAULT_CENTER;

  // Filter properties that have valid coordinates
  const validProperties = properties.filter(
    (p) => p.latitude && p.longitude && !isNaN(p.latitude) && !isNaN(p.longitude)
  );

  useEffect(() => {
    if (map && validProperties.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      validProperties.forEach((property) => {
        if (property.latitude && property.longitude) {
          bounds.extend({ lat: property.latitude, lng: property.longitude });
        }
      });
      map.fitBounds(bounds);
    }
  }, [validProperties, map]);

  const handleMarkerClick = useCallback((property: Property) => {
    setSelectedProperty(property);
    if (onPropertyClick) {
      onPropertyClick(property.id);
    }
  }, [onPropertyClick]);

  const getPropertyPrice = (property: Property): number => {
    return property.price || property.pricePerNight || property.basePrice || 0;
  };

  const getPropertyRating = (property: Property): number => {
    return property.rating || property.averageRating || 0;
  };

  const getPropertyReviews = (property: Property): number => {
    return property.reviewCount || property.totalReviews || 0;
  };

  const getPropertyImage = (property: Property): string => {
    return property.coverPhoto || property.image || '';
  };

  const getPropertyLocation = (property: Property): string => {
    return property.location || `${property.city || ''}, ${property.country || ''}`.trim() || 'Location';
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-red-600 font-medium">Error loading map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={mapCenter}
      zoom={zoom}
      onLoad={setMap}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      }}
    >
      {validProperties.map((property) => (
        <Marker
          key={property.id}
          position={{ lat: property.latitude!, lng: property.longitude! }}
          onClick={() => handleMarkerClick(property)}
          onMouseOver={() => setHoveredProperty(property.id)}
          onMouseOut={() => setHoveredProperty(null)}
          icon={{
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="22" fill="${hoveredProperty === property.id ? '#4F46E5' : '#ffffff'}" stroke="#4F46E5" stroke-width="3"/>
                <text x="24" y="30" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${hoveredProperty === property.id ? '#ffffff' : '#4F46E5'}" text-anchor="middle">$${getPropertyPrice(property)}</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(48, 48),
            anchor: new google.maps.Point(24, 24),
          }}
        />
      ))}

      {selectedProperty && selectedProperty.latitude && selectedProperty.longitude && (
        <InfoWindow
          position={{ lat: selectedProperty.latitude, lng: selectedProperty.longitude }}
          onCloseClick={() => setSelectedProperty(null)}
        >
          <div className="max-w-xs">
            {getPropertyImage(selectedProperty) && (
              <img
                src={getPropertyImage(selectedProperty)}
                alt={selectedProperty.title}
                className="w-full h-32 object-cover rounded-t-lg mb-2"
              />
            )}
            <div className="p-2">
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                {selectedProperty.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                {getPropertyLocation(selectedProperty)}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {getPropertyRating(selectedProperty) > 0 && (
                    <>
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {getPropertyRating(selectedProperty).toFixed(1)}
                      </span>
                      {getPropertyReviews(selectedProperty) > 0 && (
                        <span className="text-sm text-gray-600">
                          ({getPropertyReviews(selectedProperty)})
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    ${getPropertyPrice(selectedProperty)}
                    <span className="text-sm font-normal text-gray-600"> /night</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default GoogleMapsMultiView;
