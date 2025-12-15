import { useState, useEffect, useCallback } from 'react';
import { Property, PropertyStatus } from '@/types/property';
import { apiClient } from '@/lib/api-client';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Property[]>('property/my-properties');
      if (response.success && response.data) {
        setProperties(response.data);
      } else {
        setError(response.message || 'Failed to load properties');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllProperties = useCallback(async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.search) queryParams.append('search', params.search);

      const endpoint = `property?${queryParams.toString()}`;
      const response = await apiClient.get<Property[]>(endpoint);

      if (response.success && response.data) {
        setProperties(response.data);
        return response.data;
      }
      throw new Error(response.message || 'Failed to load properties');
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getPropertyById = useCallback(async (id: string) => {
    try {
      const response = await apiClient.get<Property>(`property/${id}`);
      return response.data || null;
    } catch (err) {
      console.error('Failed to fetch property:', err);
      return null;
    }
  }, []);

  const createProperty = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<Property>('property', data);
      if (response.success && response.data) {
        setProperties(prev => [...prev, response.data!]);
        return response.data;
      }
      throw new Error(response.message || 'Failed to create property');
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProperty = useCallback(async (id: string, updates: Partial<Property>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put<Property>(`property/${id}`, updates);
      if (response.success && response.data) {
        setProperties(prev =>
          prev.map(p => p.id === id ? response.data! : p)
        );
        return response.data;
      }
      throw new Error(response.message || 'Failed to update property');
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProperty = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.delete(`property/${id}`);
      if (response.success) {
        setProperties(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const activeProperties = properties.filter(p => p.status === PropertyStatus.ACTIVE);
  const draftProperties = properties.filter(p => p.status === PropertyStatus.DRAFT);
  const totalRevenue = properties.reduce((sum, p) => sum + p.totalEarnings, 0);
  const totalBookings = properties.reduce((sum, p) => sum + p.bookingCount, 0);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  return {
    properties,
    activeProperties,
    draftProperties,
    totalRevenue,
    totalBookings,
    loading,
    error,
    getAllProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    refetch: loadProperties
  };
}
