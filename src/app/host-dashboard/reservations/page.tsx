'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Home, Calendar, Building2, MessageSquare, ChevronDown,
  ChevronRight, Globe, Menu, Search, X, Check,
  DollarSign, Clock, Star, CalendarDays, Eye,
  MoreHorizontal, AlertCircle, MapPin, Users, Phone,
  Mail, Download, Printer, CheckCircle, XCircle,
  MessageCircle, FileText, Flag, Copy,
  ChevronUp, Zap
} from 'lucide-react';
import { LookupsAPI } from '@/lib/backend-api';

export default function HouseianaHostReservations() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [expandedReservation, setExpandedReservation] = useState<string | null>(null);
  const [allReservations, setAllReservations] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTabs, setStatusTabs] = useState<any[]>([]);

  // Fetch booking status tabs
  useEffect(() => {
    const fetchStatusTabs = async () => {
      try {
        const response = await LookupsAPI.getBookingDisplayStatus();
        if (response.success && response.data) {
          setStatusTabs(response.data);
        }
      } catch (error) {
        console.error('Error fetching status tabs:', error);
      }
    };

    fetchStatusTabs();
  }, []);

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/host/bookings');
        const result = await response.json();

        if (result.success) {
          // Convert date strings back to Date objects
          const bookingsWithDates = result.data.map((b: any) => ({
            ...b,
            checkIn: new Date(b.checkIn),
            checkOut: new Date(b.checkOut),
            bookedAt: new Date(b.bookedAt),
          }));
          setAllReservations(bookingsWithDates);

          // Extract unique properties
          const uniqueProperties = Array.from(
            new Map(result.data.map((b: any) => [
              b.propertyId,
              { id: b.propertyId, name: b.propertyName, location: b.propertyLocation }
            ])).values()
          );
          setProperties(uniqueProperties);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Tab configurations
  const tabs = useMemo(() => {
    if (statusTabs.length > 0) {
      return [
        ...statusTabs.map((status: any) => ({
          id: status.id || status.name.toLowerCase(), // fallback if id missing
          label: status.name,
          // Assuming backend returns a status code or strict name to match reservation status
          filter: (r: any) => {
             // If status.id is e.g., 'Upcoming', we might need logic.
             // Usually 'Upcoming' implies future check-in.
             // If the API returns straightforward statuses like 'Pending', 'Confirmed', direct match works.
             // If it returns 'Upcoming' which aggregates multiple statuses, we need mapping logic from backend or handled here.
             // For safety, assuming strict match or specific known types for now:
             if (status.name === 'Upcoming') return ['confirmed', 'pending'].includes(r.status);
             if (status.name === 'All') return true;
             return r.status.toLowerCase() === status.name.toLowerCase();
          }
        }))
      ];
    }
  }, [statusTabs]);

  // // Calculate tab counts
  // const tabCounts = useMemo(() => {
  //   const counts: Record<string, number> = {};
  //   statusTabs.forEach(tab => {
  //     counts[tab.id] = allReservations?.filter(tab.filter).length;
  //   });
  //   return counts;
  // }, [allReservations, statusTabs]);

  // Filter reservations
  const filteredReservations = useMemo(() => {
    const tab = statusTabs.find(t => t.id === activeTab);
    if (!tab) return [];
    let result = allReservations.filter(tab.filter);

    if (selectedProperty !== 'all') {
      result = result.filter(r => r.propertyId === selectedProperty);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.guest.name.toLowerCase().includes(query) ||
        r.confirmationCode.toLowerCase().includes(query) ||
        r.propertyName.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());
  }, [activeTab, selectedProperty, searchQuery, allReservations, tabs]);

  const formatDate = (date: Date, format = 'short') => {
    if (format === 'short') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Reservations</h1>
            <p className="text-gray-500 mt-1">{filteredReservations.length} reservations</p>
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

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
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
              {/* {tabCounts[tab.id] > 0 && (
                <span className={`ml-1.5 ${activeTab === tab.id ? 'text-gray-300' : 'text-gray-400'}`}>
                  ({tabCounts[tab.id]})
                </span>
              )} */}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by guest name or confirmation code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <select
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

        {/* Empty State */}
        {filteredReservations.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reservations found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery ? 'Try adjusting your search or filters.' : `You don't have any ${activeTab === 'all' ? '' : activeTab} reservations.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
