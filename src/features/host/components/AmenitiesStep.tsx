import { useState, useEffect } from 'react';
import { PropertyFormData } from '../types';
import { Wifi, Tv, Utensils, Shirt, Car, Snowflake, Briefcase, Waves, Sun, Flame, Star, Dumbbell, Palmtree, Mountain, Droplets, AlertCircle, Shield, LucideIcon } from 'lucide-react';
import { LookupsAPI } from '@/lib/api/backend-api';

interface AmenitiesStepProps {
  listing: PropertyFormData;
  setListing: (listing: PropertyFormData) => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  'Wifi': Wifi,
  'TV': Tv,
  'Kitchen': Utensils,
  'Washer': Shirt,
  'Parking': Car,
  'Free parking on premises': Car,
  'Air conditioning': Snowflake,
  'AC': Snowflake,
  'Dedicated workspace': Briefcase,
  'Pool': Waves,
  'Hot tub': Waves,
  'Patio or balcony': Sun,
  'BBQ grill': Flame,
  'Fire pit': Flame,
  'Pool table': Star,
  'Indoor fireplace': Flame,
  'Piano': Star,
  'Exercise equipment': Dumbbell,
  'Lake access': Waves,
  'Beach access': Palmtree,
  'Ski-in/Ski-out': Mountain,
  'Outdoor shower': Droplets,
  'Smoke alarm': AlertCircle,
  'First aid kit': Shield,
  'Fire extinguisher': Shield,
  'Carbon monoxide alarm': AlertCircle,
  // Add common variations/fallbacks
  'wifi': Wifi,
  'tv': Tv,
  'kitchen': Utensils,
  'washer': Shirt,
  'parking': Car,
  'pool': Waves,
  'gym': Dumbbell,
};

interface Amenity {
  id: string;
  name: string;
  icon?: string;
}

export const AmenitiesStep = ({ listing, setListing }: AmenitiesStepProps) => {
  const [favorites, setFavorites] = useState<Amenity[]>([]);
  const [standout, setStandout] = useState<Amenity[]>([]);
  const [safety, setSafety] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [favRes, standRes, safeRes] = await Promise.all([
          LookupsAPI.getGuestFavorites(),
          LookupsAPI.getStandoutAmenities(),
          LookupsAPI.getSafetyItems(),
        ]);

        if (favRes.success && favRes.data) setFavorites(favRes.data);
        if (standRes.success && standRes.data) setStandout(standRes.data);
        if (safeRes.success && safeRes.data) setSafety(safeRes.data);
      } catch (error) {
        console.error('Failed to fetch amenities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleGuestFavorite = (id: number) => {
    setListing({
      ...listing,
      guestFavorites: listing.guestFavorites.includes(id)
        ? listing.guestFavorites.filter(a => a !== id)
        : [...listing.guestFavorites, id]
    });
  };

  const toggleStandout = (id: number) => {
    setListing({
      ...listing,
      amenities: listing.amenities.includes(id)
        ? listing.amenities.filter(a => a !== id)
        : [...listing.amenities, id]
    });
  };

  const toggleSafety = (id: number) => {
    setListing({
      ...listing,
      safetyItems: listing.safetyItems.includes(id)
        ? listing.safetyItems.filter(a => a !== id)
        : [...listing.safetyItems, id]
    });
  };

  const renderAmenityButton = (amenity: Amenity, selectedIds: number[], toggleFn: (id: number) => void) => {
    // Try to match icon by name or exact icon string from API
    const IconComponent = ICON_MAP[amenity.name] || ICON_MAP[amenity.icon || ''] || Star;
    // Ensure we use the numerical ID as string/number for backend
    const id = Number(amenity.id);
    
    return (
      <button
        key={amenity.id}
        onClick={() => toggleFn(id)}
        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-start gap-2 hover:border-gray-900 ${
          selectedIds.includes(id)
            ? 'border-gray-900 bg-gray-50'
            : 'border-gray-200'
        }`}
      >
        <IconComponent className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
        <span className="text-sm font-medium text-gray-900 text-left">{amenity.name}</span>
      </button>
    );
  };

  if (loading) {
      return <div className="py-20 text-center text-gray-500">Loading amenities...</div>;
  }

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">What about these guest favorites?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {favorites.map(a => renderAmenityButton(a, listing.guestFavorites, toggleGuestFavorite))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Do you have any standout amenities?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {standout.map(a => renderAmenityButton(a, listing.amenities, toggleStandout))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Do you have any of these safety items?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {safety.map(a => renderAmenityButton(a, listing.safetyItems, toggleSafety))}
        </div>
      </div>
    </div>
  );
};
