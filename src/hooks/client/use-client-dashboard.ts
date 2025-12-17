'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// Types
export interface Trip {
  id: string;
  propertyTitle: string;
  propertyCity: string;
  propertyCountry: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  confirmationCode: string;
  coverPhoto?: string;
  paymentStatus?: 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'FAILED';
  amountPaid?: number;
}

export interface Wishlist {
  id: string;
  name: string;
  savedCount: number;
  previewImages: string[];
}

export interface Message {
  id: string;
  hostName: string;
  hostAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  propertyTitle: string;
  unread: boolean;
}

export type DashboardTab = 'trips' | 'wishlists' | 'messages' | 'account';
export type TripFilter = 'upcoming' | 'past' | 'cancelled';

interface UseClientDashboardReturn {
  // Tab state
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;

  // Trip state
  trips: Trip[];
  tripFilter: TripFilter;
  setTripFilter: (filter: TripFilter) => void;

  // Wishlist state
  wishlists: Wishlist[];

  // Message state
  messages: Message[];
  unreadMessagesCount: number;

  // Loading state
  loading: boolean;

  // Utility functions
  formatDate: (dateString: string) => string;
  calculateNights: (checkIn: string, checkOut: string) => number;
  handlePayBalance: (bookingId: string, paymentProvider?: string) => Promise<void>;
}

export function useClientDashboard(isSignedIn: boolean): UseClientDashboardReturn {
  // Tab state
  const [activeTab, setActiveTab] = useState<DashboardTab>('trips');
  const [tripFilter, setTripFilter] = useState<TripFilter>('upcoming');

  // Data state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Check URL params for initial tab selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['trips', 'wishlists', 'messages', 'account'].includes(tab)) {
        setActiveTab(tab as DashboardTab);
      }
    }
  }, []);

  // Fetch trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch('/api/guest/trips?filter=' + tripFilter);
        const result = await response.json();
        if (result.success) {
          setTrips(result.data);
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
      }
    };

    if (isSignedIn && activeTab === 'trips') {
      fetchTrips();
    }
  }, [tripFilter, isSignedIn, activeTab]);

  // Fetch wishlists
  useEffect(() => {
    const fetchWishlists = async () => {
      try {
        const response = await fetch('/api/guest/wishlists');
        const result = await response.json();
        if (result.success) {
          setWishlists(result.data);
        }
      } catch (error) {
        console.error('Error fetching wishlists:', error);
      }
    };

    if (isSignedIn && activeTab === 'wishlists') {
      fetchWishlists();
    }
  }, [isSignedIn, activeTab]);

  // Fetch messages/conversations
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/guest/conversations');
        const result = await response.json();
        if (result.success) {
          setMessages(result.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn && activeTab === 'messages') {
      fetchMessages();
    }
  }, [isSignedIn, activeTab]);

  // Calculate unread messages count
  const unreadMessagesCount = useMemo(() => {
    return messages.filter(m => m.unread).length;
  }, [messages]);

  // Format date for display
  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  // Calculate nights
  const calculateNights = useCallback((checkIn: string, checkOut: string): number => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }, []);

  // Handle pay balance for PARTIALLY_PAID bookings
  const handlePayBalance = useCallback(async (bookingId: string, paymentProvider: string = 'paypal') => {
    try {
      const response = await fetch('/api/bookings/pay-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          paymentProvider,
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        // Store booking ID in localStorage for verification after payment
        localStorage.setItem('pending_payment_booking', bookingId);

        // Redirect to payment gateway
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || 'Failed to create payment. Please try again.');
      }
    } catch (error) {
      console.error('Error creating balance payment:', error);
      alert('Failed to create payment. Please try again.');
    }
  }, []);

  return {
    // Tab state
    activeTab,
    setActiveTab,

    // Trip state
    trips,
    tripFilter,
    setTripFilter,

    // Wishlist state
    wishlists,

    // Message state
    messages,
    unreadMessagesCount,

    // Loading state
    loading,

    // Utility functions
    formatDate,
    calculateNights,
    handlePayBalance,
  };
}
