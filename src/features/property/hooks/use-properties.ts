'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { PropertyService } from '../api/property.service';
import { propertyKeys } from './query-keys';
import { useUser } from '@clerk/nextjs';

export function useProperties(params?: {
  page?: number;
  limit?: number;
  status?: string;
  hostId?: string;
  searchQuery?: string;
}) {
  return useQuery({
    queryKey: propertyKeys.list(params),
    queryFn: () => PropertyService.getAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useMyProperties() {
  const { user } = useUser();
  const enabled = !!user?.id;

  return useQuery({
    queryKey: propertyKeys.list({ hostId: user?.id, limit: 100 }), // Fetch more for my-properties list
    queryFn: () => PropertyService.getAll({ hostId: user?.id, limit: 100 }),
    enabled,
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: () => PropertyService.getById(id),
    enabled: !!id,
  });
}

export function usePropertySearch(params: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    type?: string;
    amenities?: string[];
    page?: number;
    limit?: number;
}) {
    return useQuery({
        queryKey: propertyKeys.list({ ...params, mode: 'search' }),
        queryFn: () => PropertyService.search(params),
        placeholderData: keepPreviousData,
    });
}
