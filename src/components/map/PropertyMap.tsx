'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Property {
  id: string;
  title: string;
  location: string;
  latitude?: number;
  longitude?: number;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  beds: number;
  baths: number;
}

interface PropertyMapProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  onPropertyClick?: (propertyId: string) => void;
}

// Component to recenter map when properties change
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

export default function PropertyMap({
  properties,
  center = [25.2854, 51.5310], // Default to Doha, Qatar
  zoom = 12,
  onPropertyClick
}: PropertyMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter properties that have valid coordinates
  const propertiesWithCoords = properties.filter(
    (p) => p.latitude !== undefined && p.longitude !== undefined
  );

  // Calculate map bounds to fit all properties
  const getMapBounds = () => {
    if (propertiesWithCoords.length === 0) return { center, zoom };

    const lats = propertiesWithCoords.map((p) => p.latitude!);
    const lngs = propertiesWithCoords.map((p) => p.longitude!);

    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

    return {
      center: [avgLat, avgLng] as [number, number],
      zoom: 12
    };
  };

  const { center: mapCenter, zoom: mapZoom } = propertiesWithCoords.length > 0
    ? getMapBounds()
    : { center, zoom };

  // Custom price marker icon
  const createPriceIcon = (price: number) => {
    return L.divIcon({
      className: 'custom-price-marker',
      html: `
        <div style="
          background: white;
          border: 2px solid #e74c3c;
          border-radius: 20px;
          padding: 4px 12px;
          font-weight: bold;
          font-size: 14px;
          color: #2c3e50;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
        ">
          $${price}
        </div>
      `,
      iconSize: [60, 30],
      iconAnchor: [30, 15],
    });
  };

  if (!mounted) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={mapCenter} zoom={mapZoom} />

        {propertiesWithCoords.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude!, property.longitude!]}
            icon={createPriceIcon(property.price)}
            eventHandlers={{
              click: () => onPropertyClick?.(property.id),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <h3 className="font-bold text-sm mb-1">{property.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{property.location}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    {property.beds} beds • {property.baths} baths
                  </span>
                  <span className="text-yellow-600">
                    ★ {property.rating} ({property.reviewCount})
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className="text-lg font-bold text-primary-600">${property.price}</span>
                  <span className="text-xs text-gray-500"> / night</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style jsx global>{`
        .custom-price-marker:hover > div {
          background: #e74c3c !important;
          color: white !important;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
