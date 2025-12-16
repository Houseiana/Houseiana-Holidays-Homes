import { useState, useEffect, useCallback } from 'react';
import { Booking, BookingStatus, BookingStats } from '@/types/booking';
import { apiClient } from '@/lib/api-client';

export function useBookings(userId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Booking[]>('booking/my-bookings');
      if (response.success && response.data) {
        setBookings(response.data);
      } else {
        setError(response.message || 'Failed to load bookings');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBookingById = useCallback(async (id: string) => {
    try {
      const response = await apiClient.get<Booking>(`booking/${id}`);
      return response.data || null;
    } catch (err) {
      console.error('Failed to fetch booking:', err);
      return null;
    }
  }, []);

  const createBooking = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<Booking>('booking', data);
      if (response.success && response.data) {
        setBookings(prev => [...prev, response.data!]);
        return response.data;
      }
      throw new Error(response.message || 'Failed to create booking');
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBookingStatus = useCallback(async (id: string, status: BookingStatus) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch<Booking>(`booking/${id}/status`, { status });
      if (response.success && response.data) {
        setBookings(prev =>
          prev.map(b => b.id === id ? response.data! : b)
        );
        return response.data;
      }
      throw new Error(response.message || 'Failed to update booking');
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(`booking/${id}/cancel`, { reason });
      if (response.success) {
        await loadBookings();
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadBookings]);

  const getBookingStats = useCallback(async () => {
    try {
      const response = await apiClient.get<BookingStats>('booking/stats');
      return response.data || null;
    } catch (err) {
      console.error('Failed to fetch booking stats:', err);
      return null;
    }
  }, []);

  const upcomingBookings = bookings.filter(b =>
    b.status === BookingStatus.CONFIRMED && new Date(b.checkIn) > new Date()
  );

  const pastBookings = bookings.filter(b =>
    b.status === BookingStatus.COMPLETED || new Date(b.checkOut) < new Date()
  );

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return {
    bookings,
    upcomingBookings,
    pastBookings,
    loading,
    error,
    getBookingById,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    getBookingStats,
    refetch: loadBookings
  };
}
