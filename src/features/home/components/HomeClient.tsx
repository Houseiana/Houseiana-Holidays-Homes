'use client';

import { useState, useEffect } from 'react';
import { Footer } from '@/layout';
import HomeHeader from './HomeHeader';
import PropertyGrid from './PropertyGrid';
import { PropertySummary } from '@/types/property';
import BackendAPI from '@/lib/api/backend-api';
import { useAuth } from '@clerk/nextjs';

export default function HomeClient() {
  const [activeCategory, setActiveCategory] = useState('all');

  // Property state - initialized with server data
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);

  const { userId } = useAuth();
  // Initial Geolocation and Client-side Fetch
  useEffect(() => {
    const fetchProperties = async (latitude?: number, longitude?: number) => {
      try {
        setLoading(true);
        // Fetch directly from client without changing URL
        const response = await BackendAPI.Property.publicSearch({ 
          latitude,
          longitude,
          userId: userId ?? undefined,
          propertyType: activeCategory ? activeCategory : 'all'
        });

        if (response.success && response.data && response.data.properties) {
          const newProperties = response.data.properties.map((p: any) => ({
            id: p.id,
            title: p.title,
            city: p.city || '',
            country: p.country || '',
            pricePerNight: p.pricePerNight || p.price || 0,
            coverPhoto: p.coverPhoto || (p.photos?.[0]) || undefined,
            photos: p.photos || [],
            averageRating: p.averageRating || p.rating || 0,
            bookingCount: 0,
            createdAt: p.createdAt || new Date().toISOString(),
            isFavorite: p.isFavorite || false,
            weeklyDiscount: p.weeklyDiscount,
            smallBookingDiscount: p.smallBookingDiscount,
            priceWithoutDiscount: p.priceWithoutDiscount,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            guestCount: p.guestCount
          }));
          setProperties(newProperties);
        } else {
            // clear properties if no data or filtered out
            setProperties([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setLoading(false);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchProperties(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback: Fetch without location if permission denied or error
          fetchProperties();
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    } else {
      // Fallback: Geolocation not supported
      fetchProperties();
    }
  }, [activeCategory, userId]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <HomeHeader activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {/* Property Grid */}
      <PropertyGrid properties={properties} loading={loading} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
