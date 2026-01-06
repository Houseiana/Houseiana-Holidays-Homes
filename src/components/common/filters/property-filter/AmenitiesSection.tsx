import React, { useEffect, useState } from 'react';
import { FilterSection } from './FilterSection';
import { AmenityButton } from './AmenityButton';
import BackendAPI from '@/lib/api/backend-api';

interface AmenitiesSectionProps {
  selectedAmenities: string[];
  onToggle: (amenityId: string, checked: boolean) => void;
}

// Map common amenity names to emojis
const getEmojiForAmenity = (name: string): string => {
  const norm = name.toLowerCase();
  if (norm.includes('wifi') || norm.includes('internet')) return '📶';
  if (norm.includes('kitchen') || norm.includes('cooking')) return '🍳';
  if (norm.includes('washer') || norm.includes('laundry')) return '🧺';
  if (norm.includes('dryer')) return '🌪️';
  if (norm.includes('air') || norm.includes('ac') || norm.includes('a/c')) return '❄️';
  if (norm.includes('heat') || norm.includes('fire')) return '🔥';
  if (norm.includes('work') || norm.includes('laptop')) return '💻';
  if (norm.includes('tv') || norm.includes('television')) return '📺';
  if (norm.includes('park') || norm.includes('garage')) return '🅿️';
  if (norm.includes('pool') || norm.includes('swim')) return '🏊';
  if (norm.includes('gym') || norm.includes('fitness')) return '🏋️';
  if (norm.includes('hot tub') || norm.includes('sauna')) return '🛁';
  if (norm.includes('security') || norm.includes('safe')) return '🚪';
  if (norm.includes('bbq') || norm.includes('grill')) return '🔥';
  if (norm.includes('jacuzzi')) return '🛀';
  if (norm.includes('garden')) return '🌿';
  if (norm.includes('roof')) return '🏢';
  if (norm.includes('swing')) return '🪢';
  if (norm.includes('beach')) return '🏖️';
  if (norm.includes('view')) return '👀';
  if (norm.includes('outdoor shower')) return '🚿';
  if (norm.includes('Ski-in')) return '⛷️';
  if (norm.includes('Beach access')) return '🏖️';
  if (norm.includes('Lake access')) return '🌊';
  if (norm.includes('Exercise equipment')) return '🏋️';
  if (norm.includes('piano')) return '🎹';
  return '✨'; // Default sparkle
};

export const AmenitiesSection = ({ selectedAmenities, onToggle }: AmenitiesSectionProps) => {
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setLoading(true);
        const response = await BackendAPI.Lookups.getStandoutAmenities();
        if (response.success && response.data) {
          // Map response to match component structure
          // Assuming API returns { id: number|string, name: string }
          const mappedAmenities = response.data.map((item: any) => ({
            id: item.id?.toString() || item.name, // Ensure ID is string
            label: item.name || item.title || 'Unknown',
            emoji: getEmojiForAmenity(item.name || item.title || '')
          }));
          setAmenities(mappedAmenities);
        }
      } catch (error) {
        console.error('Failed to fetch amenities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  if (loading) {
    return (
      <FilterSection title="Amenities">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-full"></div>
            ))}
          </div>
        </div>
      </FilterSection>
    );
  }

  return (
    <FilterSection title="Amenities">
      <p className="text-sm text-gray-500 mb-4">What does your place offer?</p>
      <div className="grid grid-cols-4 gap-3">
        {amenities.map((amenity) => (
          <AmenityButton
            key={amenity.id}
            label={amenity.label}
            emoji={amenity.emoji}
            checked={selectedAmenities.includes(amenity.id)}
            onChange={(checked) => onToggle(amenity.id, checked)}
          />
        ))}
      </div>
    </FilterSection>
  );
};
