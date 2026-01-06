import { useState, useEffect } from 'react';
import { 
  Building, Home, Castle, Building2, Hotel, TreePine, Ship, Palmtree, Waves, Tent, HomeIcon 
} from 'lucide-react';
import BackendAPI from '@/lib/api/backend-api';

export interface PropertyType {
  id: string;
  name: string;
  label: string; // Alias for name to support different component usages
  icon: any;
}

export function usePropertiesTypes() {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await BackendAPI.Lookups.getPropertyTypes();
        
        // Default fallback list if API fails or needs initial population before fetch
        // (Similar to what was in PropertyTypeStep, but we prioritize API data if available)
        // If API returns empty, we might want to fallback to this hardcoded list? 
        // The original code in CategoryTabs fetched from API.
        
        const iconMap: Record<string, any> = {
          'Apartment': Building,
          'Villa': Castle,
          'Beachfront': Waves,
          'Tropical': Palmtree,
          'Camping': Tent,
          'Houseboat': Ship,
          'Chalet': Building, 
          'Farm': Palmtree,
          'Apartment / Condo': Building,
          'House': HomeIcon,
          'Studio / Loft': Building2,
          'Townhouse': Home,
          'Guesthouse / Annex': Home,
          'Serviced apartment': Hotel,
          'Hotel-style residence (aparthotel unit)': Building,
          'Cabin / Chalet': TreePine,
          'Farm stay': TreePine,
        };

        if (response.success && response.data && response.data.length > 0) {
           const mappedTypes = response.data.map((item: any) => {
            const name = item.name || item.title || item; 
            const id = item.id || name.toLowerCase().replace(/ /g, '_'); // Ensure ID generation if missing
            // Improved icon matching
            const Icon = Object.entries(iconMap).find(([key]) => name.includes(key))?.[1] || Building;

            return { 
              id, 
              name, 
              label: name, 
              icon: Icon 
            };
          });
          setPropertyTypes(mappedTypes);
        } else {
            // Fallback to hardcoded list if API is empty or fails?
            // The original CategoryTabs relied on API. PropertyTypeStep had hardcoded.
            // Let's use the hardcoded list from PropertyTypeStep as a base or fallback.
            // But usually API is source of truth. Let's stick to API logic but if empty, use the list from PropertyTypeStep?
            // User request implies refactoring `CategoryTabs` logic which fetched.
            // But `PropertyTypeStep` used static.
            // I'll merge them: try API, if empty use static.
             const staticTypes = [
              { id: 'apartment_condo', icon: Building, label: 'Apartment / Condo' },
              { id: 'house', icon: HomeIcon, label: 'House' },
              { id: 'villa', icon: Castle, label: 'Villa' },
              { id: 'studio_loft', icon: Building2, label: 'Studio / Loft' },
              { id: 'townhouse', icon: Home, label: 'Townhouse' },
              { id: 'guesthouse_annex', icon: Home, label: 'Guesthouse / Annex' },
              { id: 'serviced_apartment', icon: Hotel, label: 'Serviced apartment' },
              { id: 'aparthotel', icon: Building, label: 'Hotel-style residence (aparthotel unit)' },
              { id: 'cabin_chalet', icon: TreePine, label: 'Cabin / Chalet' },
              { id: 'farm_stay', icon: TreePine, label: 'Farm stay' },
              { id: 'houseboat', icon: Ship, label: 'Houseboat' },
            ];
            
            // Map static to conform to interface
            setPropertyTypes(staticTypes.map(t => ({ ...t, name: t.label })));
        }
      } catch (err) {
        console.error('Failed to fetch property types:', err);
        setError('Failed to fetch property types');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { propertyTypes, loading, error };
}
