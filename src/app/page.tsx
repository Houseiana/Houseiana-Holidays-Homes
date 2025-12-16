import HomeClient from './HomeClient';
import { PropertyAPI } from '@/lib/backend-api';

// Revalidate every hour
export const revalidate = 3600;

interface Property {
  id: string;
  title: string;
  city: string;
  country: string;
  pricePerNight: number;
  coverPhoto?: string;
  photos?: string | any[];
  averageRating?: number;
  bookingCount?: number;
  createdAt?: string;
}

export default async function HouseianaHome() {
  let properties: Property[] = [];

  try {
    // Fetch properties from backend API
    const response = await PropertyAPI.getAll({
      status: 'PUBLISHED',
      limit: 12,
    });

    if (response.success && response.data?.data) {
      // Map backend API response to expected format
      properties = response.data.data.map((p: any) => ({
        id: p.id,
        title: p.title,
        city: p.location?.split(',')[0]?.trim() || '',
        country: p.location?.split(',')[1]?.trim() || '',
        pricePerNight: p.price || 0,
        coverPhoto: p.images?.[0] || undefined,
        photos: p.images || [],
        averageRating: p.rating || 0,
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
