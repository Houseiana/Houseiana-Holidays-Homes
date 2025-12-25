'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface SearchState {
  location: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: GuestCounts;
}

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export function usePropertySearch() {
  const router = useRouter();

  // Search state
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<GuestCounts>({ 
    adults: 0, 
    children: 0, 
    infants: 0, 
    pets: 0 
  });

  // UI State for the expanded search bar logic (coupled here for ease of use in the header)
  const [searchMode, setSearchMode] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const totalGuests = guests.adults + guests.children;
  
  const guestText = totalGuests === 0 ? 'Add guests' :
    `${totalGuests} guest${totalGuests > 1 ? 's' : ''}${guests.infants > 0 ? `, ${guests.infants} infant${guests.infants > 1 ? 's' : ''}` : ''}${guests.pets > 0 ? `, ${guests.pets} pet${guests.pets > 1 ? 's' : ''}` : ''}`;


  const handleDateClick = (day: number) => {
    const selectedDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    if (searchMode === 'checkin') {
      setCheckIn(selectedDate);
      setSearchMode('checkout');
    } else if (searchMode === 'checkout') {
      if (checkIn && selectedDate > checkIn) {
        setCheckOut(selectedDate);
        setSearchMode('who');
      } else {
        setCheckIn(selectedDate);
      }
    } else {
        // Fallback or specific logic if clicked outside modes
        setCheckIn(selectedDate);
        setSearchMode('checkout');
    }
  };


  const performSearch = () => {
    const params = new URLSearchParams();

    if (location) params.set('location', location);
    if (checkIn) params.set('checkin', checkIn.toISOString().split('T')[0]);
    if (checkOut) params.set('checkout', checkOut.toISOString().split('T')[0]);
    
    if (guests.adults > 0) params.set('adults', guests.adults.toString());
    if (guests.children > 0) params.set('children', guests.children.toString());
    if (guests.infants > 0) params.set('infants', guests.infants.toString());
    if (guests.pets > 0) params.set('pets', guests.pets.toString());
    
    if (totalGuests > 0) params.set('guests', totalGuests.toString());

    const searchUrl = `/discover${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(searchUrl);
    setSearchMode(null);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Add dates';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return {
    location, setLocation,
    checkIn, setCheckIn,
    checkOut, setCheckOut,
    guests, setGuests,
    searchMode, setSearchMode,
    calendarMonth, setCalendarMonth,
    totalGuests,
    guestText,
    handleDateClick,
    performSearch,
    formatDate
  };
}
