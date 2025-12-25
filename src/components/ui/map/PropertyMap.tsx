'use client';

import { useEffect, useRef, useState } from 'react';

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

export default function PropertyMap({
  properties,
  center = [25.2854, 51.5310],
  zoom = 12,
  onPropertyClick
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        // Only run on client-side
        if (typeof window === 'undefined' || !mapRef.current) return;

        // Load Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Dynamically import Leaflet
        const L = await import('leaflet');

        // Fix default marker icon paths
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (!isMounted) return;

        // Clear existing map if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Filter properties with valid coordinates
        const propertiesWithCoords = properties.filter(
          (p) => p.latitude !== undefined && p.longitude !== undefined
        );

        // Calculate center if we have properties
        let mapCenter = center;
        if (propertiesWithCoords.length > 0) {
          const lats = propertiesWithCoords.map((p) => p.latitude!);
          const lngs = propertiesWithCoords.map((p) => p.longitude!);
          const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
          const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
          mapCenter = [avgLat, avgLng];
        }

        // Create map instance
        const map = L.map(mapRef.current).setView(mapCenter, zoom);

        // Add tile layer with English language support
        // Using CartoDB Voyager tiles which show English labels
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(map);

        // Add markers for each property
        propertiesWithCoords.forEach((property) => {
          // Create custom price marker
          const icon = L.divIcon({
            className: 'custom-price-marker',
            html: `
              <div class="price-marker">
                $${property.price}
              </div>
            `,
            iconSize: [60, 30],
            iconAnchor: [30, 15],
          });

          const marker = L.marker([property.latitude!, property.longitude!], { icon })
            .addTo(map);

          // Create popup content
          const popupContent = `
            <div style="min-width: 200px;">
              <img src="${property.image}" alt="${property.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
              <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${property.title}</h3>
              <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${property.location}</p>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
                <span style="color: #666;">${property.beds} beds • ${property.baths} baths</span>
                <span style="color: #f59e0b;">★ ${property.rating} (${property.reviewCount})</span>
              </div>
              <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
                <span style="font-size: 18px; font-weight: bold; color: #e74c3c;">$${property.price}</span>
                <span style="font-size: 12px; color: #666;"> / night</span>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);

          // Add click handler
          marker.on('click', () => {
            onPropertyClick?.(property.id);
          });
        });

        mapInstanceRef.current = map;

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing map:', err);
        if (isMounted) {
          setError('Failed to load map');
          setIsLoading(false);
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [properties, center, zoom, onPropertyClick]);

  if (error) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-gray-500">Loading map...</div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      <style jsx global>{`
        .custom-price-marker {
          background: transparent;
          border: none;
        }
        .price-marker {
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
        }
        .price-marker:hover {
          background: #e74c3c !important;
          color: white !important;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
