'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  rating: number;
  lat?: number; // Optional for now, will mock if missing
  lng?: number;
}

interface MapProps {
  properties: Property[];
}

export default function Map({ properties }: MapProps) {
  // Default center (US)
  const defaultCenter: [number, number] = [39.8283, -98.5795];
  
  // Mock coordinates if not provided (distributed around US for demo)
  const propertiesWithCoords = properties.map((p, index) => ({
    ...p,
    lat: p.lat || 34.0522 + (index * 2), // Spread out vertically
    lng: p.lng || -118.2437 + (index * 5) // Spread out horizontally
  }));

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden shadow-lg border border-gray-200 relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={4} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {propertiesWithCoords.map((property) => (
          <Marker 
            key={property.id} 
            position={[property.lat!, property.lng!]} 
            icon={customIcon}
          >
            <Popup className="custom-popup">
              <div className="w-48 p-1">
                <div className="relative h-24 rounded-lg overflow-hidden mb-2">
                  <img 
                    src={property.image} 
                    alt={property.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-sm text-gray-900 truncate">{property.title}</h3>
                <p className="text-xs text-gray-500 mb-1">{property.location}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">${property.price}<span className="text-xs font-normal text-gray-500">/night</span></span>
                  <span className="text-xs font-bold flex items-center gap-1">
                    ★ {property.rating}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
