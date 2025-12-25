import { HomeClient } from '@/features/home';

// Revalidate every hour
export const revalidate = 3600;

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://houseiana-user-backend-production.up.railway.app';

import { PropertySummary } from '@/types/property';

export default async function HouseianaHome() {
  let properties: PropertySummary[] = [];
 
  try {
    // Fetch published properties from property-search endpoint
    const response = await fetch(`${BACKEND_API_URL}/api/property-search?limit=12`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 },
    });

    const data = await response.json();

    if (data.success && data.properties) {
      // Map backend API response to expected format
      properties = data.properties.map((p: any) => ({
        id: p.id,
        title: p.title,
        city: p.city || '',
        country: p.country || '',
        pricePerNight: p.pricePerNight || 0,
        coverPhoto: p.coverPhoto || (p.photos?.[0]) || undefined,
        photos: p.photos || [],
        averageRating: p.averageRating || 0,
        bookingCount: 0,
        createdAt: p.createdAt || new Date().toISOString(),
      }));
    }

  } catch (error) {
    console.error('Error fetching properties from backend API:', error);
    // Fallback to empty array
  }

  return <HomeClient initialProperties={properties} />;
}
