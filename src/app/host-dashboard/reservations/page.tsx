'use client';

import { useState, useEffect } from 'react';
import {
  CalendarDays, Download, Printer, Search
} from 'lucide-react';
import { LookupsAPI, PropertyAPI } from '@/lib/backend-api';
import { BookingService } from '@/features/booking/api/booking.service';
import { useUser } from '@clerk/nextjs';
import { ReservationCard, Reservation } from './reservation-card';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function HouseianaHostReservations() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTabs, setStatusTabs] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch booking status tabs
  useEffect(() => {
    const fetchStatusTabs = async () => {
      try {
        const response = await LookupsAPI.getBookingDisplayStatus();
        if (response.success && response.data) {
          setStatusTabs(response.data);
          // Set default tab to 'upcoming' id if found, else first tab
          const upcoming = response.data.find((t: any) => t.name.toLowerCase() === 'upcoming');
          if (upcoming) {
            setActiveTab(upcoming.id);
          } else if (response.data.length > 0) {
            setActiveTab(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching status tabs:', error);
      }
    };

    fetchStatusTabs();
  }, []);

  // Fetch properties for filter
  useEffect(() => {
    const fetchProperties = async () => {
      if (!user?.id) return;

      try {
        const response = await PropertyAPI.getAll({ 
          limit: 100, 
          hostId: user.id 
        });
        
        if (response.success && response.data) {
           let loadedProperties: any[] = [];
           if (Array.isArray(response.data)) {
              loadedProperties = response.data;
           } else if (response.data.data && Array.isArray(response.data.data)) {
              loadedProperties = response.data.data;
           }
           
           setProperties(loadedProperties.map((p: any) => ({
             id: p.id,
             name: p.title || p.name
           })));
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };
    
    fetchProperties();
  }, [user?.id]);

  // Fetch bookings from API with filters
  const fetchBookings = async () => {
    if (!user?.id || (statusTabs.length === 0 && activeTab !== 'all')) return;

    setLoading(true);
    try {
      const params: any = {
        page: 1,
        limit: 100,
        hostId: user.id,
      };

      if (selectedProperty !== 'all') {
        params.propertyId = selectedProperty;
      }

      if (debouncedSearchQuery) {
        params.guestName = debouncedSearchQuery;
      }

      if (activeTab !== 'all') {
           params.statusId = activeTab;
      }

      const response = await BookingService.list(params);

      if (response.success && response.data) {
        // Convert date strings back to Date objects
        const bookingsWithDates = response.data.data.map((b: any) => ({
          ...b,
          checkIn: new Date(b.checkIn),
          checkOut: new Date(b.checkOut),
          bookedAt: new Date(b.bookedAt),
        }));
        setReservations(bookingsWithDates);
      } else {
          setReservations([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab, selectedProperty, debouncedSearchQuery, statusTabs, user?.id]);

  const handleApprove = async (bookingId: string) => {
    if (!user?.id) return;
    setIsProcessing(bookingId);
    try {
      const response = await BookingService.approvalByHost(bookingId, user.id, true);
      if (response.success) {
        toast.success('Booking approved successfully');
        fetchBookings(); // Refresh list
      } else {
        toast.error(response.error || 'Failed to approve booking');
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('An error occurred');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDecline = async (bookingId: string) => {
    if (!user?.id) return;
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, decline it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
    setIsProcessing(bookingId);
    try {
      const response = await BookingService.approvalByHost(bookingId, user.id, false);
      if (response.success) {
         toast.success('Booking declined');
         fetchBookings();
      } else {
         toast.error(response.error || 'Failed to decline booking');
      }
    } catch (error) {
       console.error('Error declining booking:', error);
       toast.error('An error occurred');
    } finally {
       setIsProcessing(null);
    }
  }})
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Reservations</h1>
            <p className="text-gray-500 mt-1">{reservations.length} reservations</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {statusTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by guest name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <select
              title='properties'
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white min-w-[200px]"
            >
              <option value="all">All properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
             <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                 <p className="text-gray-500">Loading reservations...</p>
             </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery ? 'Try adjusting your search or filters.' : `You don't have any bookings in this category.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
             {reservations.map((booking) => (
               <ReservationCard
                 key={booking.id}
                 reservation={booking}
                 onApprove={handleApprove}
                 onDecline={handleDecline}
                 isProcessing={isProcessing}
               />
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
