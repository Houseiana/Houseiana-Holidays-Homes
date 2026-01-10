import { useState, useEffect } from 'react';
import { LookupsAPI } from '@/lib/api/backend-api';

interface Country {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
  countryId: number;
}

export const useCountries = () => {
  const [countries, setCountries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await LookupsAPI.getCountries();
        if (response.success && response.data) {
          setCountries((response.data as any)?.data || []);
        } else {
          setError(response.message || 'Failed to fetch countries');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred fetching countries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, isLoading, error };
};

export const useCities = (countryId: string | number | null) => {
  const [cities, setCities] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryId) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await LookupsAPI.getCities(countryId);
        
        if (response.success && response.data) {
          setCities(response.data.cities || []);
        } else {
          setError(response.message || 'Failed to fetch cities');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred fetching cities');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, [countryId]);

  return { cities, isLoading, error };
};
