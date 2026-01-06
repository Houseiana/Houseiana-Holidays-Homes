import { backendFetch } from '@/lib/api-client';
import { ApiResponse, Booking, CreateBookingDto } from '@/types/api';

export const BookingService = {
  create: async (dto: CreateBookingDto): Promise<ApiResponse<Booking>> => {
    return backendFetch('/booking-manager', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  getById: async (id: string): Promise<ApiResponse<Booking>> => {
    return backendFetch(`/booking-manager/${id}`);
  },

  getUserBookings: async (userId: string, role: 'guest' | 'host' = 'guest'): Promise<ApiResponse<Booking[]>> => {
    return backendFetch(`/booking-manager/user/${userId}?role=${role}`);
  },

  confirm: async (bookingId: string): Promise<ApiResponse<Booking>> => {
    return backendFetch(`/booking-manager/${bookingId}/confirm`, {
      method: 'POST',
    });
  },

  approve: async (bookingId: string, hostId: string): Promise<ApiResponse<Booking>> => {
    return backendFetch(`/booking-manager/${bookingId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ hostId }),
    });
  },

  reject: async (bookingId: string, hostId: string, reason?: string): Promise<ApiResponse<Booking>> => {
    return backendFetch(`/booking-manager/${bookingId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ hostId, reason }),
    });
  },

  cancel: async (bookingId: string, userId: string, reason?: string): Promise<ApiResponse<Booking>> => {
    return backendFetch(`/booking-manager/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ userId, reason }),
    });
  },

  // Extended functionality
  verifyPayment: async (bookingId: string): Promise<ApiResponse> => {
    return backendFetch(`/api/bookings/verify?id=${bookingId}`);
  },

  payBalance: async (bookingId: string, userId: string, paymentProvider: string): Promise<ApiResponse> => {
    return backendFetch('/api/bookings/pay-balance', {
      method: 'POST',
      body: JSON.stringify({ bookingId, userId, paymentProvider }),
    });
  },
};
