'use client';

import { useState, useMemo } from 'react';
import {
  Home, Calendar, Building2, MessageSquare, ChevronDown, ChevronLeft,
  ChevronRight, Globe, Menu, Plus, X, Check,
  DollarSign, Ban, Info, Sparkles, MapPin, AlertCircle,
  TrendingUp, LayoutGrid, CalendarDays
} from 'lucide-react';

export default function HouseianaHostCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 1)); // December 2024
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [showPricing, setShowPricing] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'details' | 'pricing' | 'block'>('details');
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);

  // Sample properties - TODO: Fetch from API
  const properties = [
    {
      id: 'P001',
      name: 'Beachfront Villa',
      location: 'The Pearl, Doha',
      basePrice: 450,
      bedrooms: 3,
      bathrooms: 2,
      status: 'active'
    },
    {
      id: 'P002',
      name: 'Mountain Cabin Retreat',
      location: 'Al Khor',
      basePrice: 280,
      bedrooms: 2,
      bathrooms: 1,
      status: 'active'
    },
    {
      id: 'P003',
      name: 'City Loft Premium',
      location: 'West Bay, Doha',
      basePrice: 320,
      bedrooms: 1,
      bathrooms: 1,
      status: 'active'
    },
  ];

  // Sample bookings - TODO: Fetch from API
  const bookings = [
    {
      id: 'BK001',
      propertyId: 'P001',
      guestName: 'John Smith',
      checkIn: new Date(2024, 11, 5),
      checkOut: new Date(2024, 11, 10),
      guests: 4,
      totalAmount: 2250,
      status: 'confirmed',
    },
    {
      id: 'BK002',
      propertyId: 'P001',
      guestName: 'Maria Garcia',
      checkIn: new Date(2024, 11, 15),
      checkOut: new Date(2024, 11, 20),
      guests: 2,
      totalAmount: 2250,
      status: 'confirmed',
    },
    {
      id: 'BK003',
      propertyId: 'P002',
      guestName: 'Ahmed Hassan',
      checkIn: new Date(2024, 11, 8),
      checkOut: new Date(2024, 11, 12),
      guests: 3,
      totalAmount: 1120,
      status: 'confirmed',
    },
    {
      id: 'BK004',
      propertyId: 'P003',
      guestName: 'Sophie Chen',
      checkIn: new Date(2024, 11, 1),
      checkOut: new Date(2024, 11, 4),
      guests: 2,
      totalAmount: 960,
      status: 'confirmed',
    },
    {
      id: 'BK005',
      propertyId: 'P001',
      guestName: 'David Chen',
      checkIn: new Date(2024, 11, 22),
      checkOut: new Date(2024, 11, 26),
      guests: 4,
      totalAmount: 1800,
      status: 'pending',
    },
  ];

  // Sample blocked dates - TODO: Fetch from API
  const blockedDates = [
    { propertyId: 'P001', date: new Date(2024, 11, 12), reason: 'Owner use' },
    { propertyId: 'P001', date: new Date(2024, 11, 13), reason: 'Owner use' },
    { propertyId: 'P001', date: new Date(2024, 11, 14), reason: 'Owner use' },
    { propertyId: 'P002', date: new Date(2024, 11, 20), reason: 'Maintenance' },
    { propertyId: 'P002', date: new Date(2024, 11, 21), reason: 'Maintenance' },
  ];

  // Custom pricing - TODO: Fetch from API
  const customPricing = [
    { propertyId: 'P001', date: new Date(2024, 11, 24), price: 550 },
    { propertyId: 'P001', date: new Date(2024, 11, 25), price: 600 },
    { propertyId: 'P001', date: new Date(2024, 11, 31), price: 700 },
    { propertyId: 'P002', date: new Date(2024, 11, 24), price: 350 },
    { propertyId: 'P002', date: new Date(2024, 11, 25), price: 380 },
  ];

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isDateInRange = (date: Date, start: Date, end: Date) => {
    const d = new Date(date).setHours(0, 0, 0, 0);
    const s = new Date(start).setHours(0, 0, 0, 0);
    const e = new Date(end).setHours(0, 0, 0, 0);
    return d >= s && d < e;
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(d => isSameDay(d, date));
  };

  const getBookingForDate = (date: Date, propertyId: string | null) => {
    return bookings.find(booking => {
      if (propertyId && booking.propertyId !== propertyId) return false;
      return isDateInRange(date, booking.checkIn, booking.checkOut);
    });
  };

  const isDateBlocked = (date: Date, propertyId: string | null) => {
    return blockedDates.some(blocked => {
      if (propertyId && blocked.propertyId !== propertyId) return false;
      return isSameDay(blocked.date, date);
    });
  };

  const getCustomPrice = (date: Date, propertyId: string | null) => {
    const custom = customPricing.find(p => {
      if (propertyId && p.propertyId !== propertyId) return false;
      return isSameDay(p.date, date);
    });
    return custom?.price;
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Navigation
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Date selection
  const handleDateClick = (date: Date) => {
    if (isPastDate(date)) return;

    if (!isSelecting) {
      setIsSelecting(true);
      setSelectionStart(date);
      setSelectedDates([date]);
    } else {
      setIsSelecting(false);
      if (!selectionStart) return;

      const start = selectionStart < date ? selectionStart : date;
      const end = selectionStart < date ? date : selectionStart;
      const range: Date[] = [];
      const current = new Date(start);
      while (current <= end) {
        range.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      setSelectedDates(range);
      setShowSidebar(true);
      setSidebarMode('details');
    }
  };

  const handleDateHover = (date: Date) => {
    if (!isSelecting || !selectionStart) return;
    const start = selectionStart < date ? selectionStart : date;
    const end = selectionStart < date ? date : selectionStart;
    const range: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      range.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    setSelectedDates(range);
  };

  const clearSelection = () => {
    setSelectedDates([]);
    setIsSelecting(false);
    setSelectionStart(null);
    setShowSidebar(false);
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    // Previous month padding
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedProperty_obj = selectedProperty === 'all'
    ? null
    : properties.find(p => p.id === selectedProperty);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <Home className="w-8 h-8 text-teal-600" strokeWidth={2.5} />
              <span className="text-xl font-bold text-teal-600">Houseiana</span>
            </a>

            {/* Center Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <a href="/host-dashboard" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">
                Today
              </a>
              <a href="/host-dashboard/calendar" className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-full">
                Calendar
              </a>
              <a href="/host-dashboard/listings" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full">
                Listings
              </a>
              <a href="/host-dashboard/messages" className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full relative">
                Messages
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  0
                </span>
              </a>
              <div className="relative">
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full flex items-center gap-1">
                  Menu
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              <a href="/client-dashboard" className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full">
                Switch to traveling
              </a>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Globe className="w-5 h-5 text-gray-700" />
              </button>
              <button className="flex items-center gap-2 p-1 pl-3 border border-gray-300 rounded-full hover:shadow-md">
                <Menu className="w-4 h-4 text-gray-600" />
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium text-sm">
                  H
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 ${showSidebar ? 'mr-96' : ''} transition-all duration-300`}>
          {/* Calendar Header */}
          <div className="sticky top-16 z-40 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Property Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 min-w-[200px]"
                  >
                    <Building2 className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {selectedProperty === 'all' ? 'All listings' : selectedProperty_obj?.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
                  </button>

                  {showPropertyDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <button
                        onClick={() => { setSelectedProperty('all'); setShowPropertyDropdown(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${
                          selectedProperty === 'all' ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <LayoutGrid className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">All listings</p>
                          <p className="text-sm text-gray-500">{properties.length} properties</p>
                        </div>
                        {selectedProperty === 'all' && <Check className="w-5 h-5 text-teal-600 ml-auto" />}
                      </button>
                      <div className="border-t border-gray-100 my-2" />
                      {properties.map(property => (
                        <button
                          key={property.id}
                          onClick={() => { setSelectedProperty(property.id); setShowPropertyDropdown(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${
                            selectedProperty === property.id ? 'bg-gray-50' : ''
                          }`}
                        >
                          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                          <div className="text-left flex-1">
                            <p className="font-medium text-gray-900">{property.name}</p>
                            <p className="text-sm text-gray-500">{property.location}</p>
                          </div>
                          {selectedProperty === property.id && <Check className="w-5 h-5 text-teal-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Month Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevMonth}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPricing(!showPricing)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    showPricing ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Pricing
                </button>

                {selectedDates.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedDates.length} {selectedDates.length === 1 ? 'night' : 'nights'} selected
                    </span>
                    <button
                      onClick={clearSelection}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-teal-500 rounded" />
              <span className="text-gray-600">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded" />
              <span className="text-gray-600">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded" />
              <span className="text-gray-600">Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-teal-500 rounded" />
              <span className="text-gray-600">Selected</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="px-6 py-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
              {calendarDays.map((day, index) => {
                const booking = getBookingForDate(day.date, selectedProperty === 'all' ? null : selectedProperty);
                const blocked = isDateBlocked(day.date, selectedProperty === 'all' ? null : selectedProperty);
                const customPrice = getCustomPrice(day.date, selectedProperty === 'all' ? null : selectedProperty);
                const basePrice = selectedProperty_obj?.basePrice || 450;
                const price = customPrice || basePrice;
                const isPast = isPastDate(day.date);
                const isSelected = isDateSelected(day.date);
                const isToday = isSameDay(day.date, new Date());

                return (
                  <div
                    key={index}
                    onClick={() => !isPast && !booking && handleDateClick(day.date)}
                    onMouseEnter={() => handleDateHover(day.date)}
                    className={`
                      bg-white min-h-[100px] p-2 relative cursor-pointer transition-all
                      ${!day.isCurrentMonth ? 'bg-gray-50' : ''}
                      ${isPast ? 'bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                      ${isSelected ? 'ring-2 ring-inset ring-teal-500 bg-teal-50' : ''}
                      ${booking ? 'cursor-default' : ''}
                    `}
                  >
                    {/* Date Number */}
                    <div className={`
                      text-sm font-medium mb-1
                      ${!day.isCurrentMonth || isPast ? 'text-gray-400' : 'text-gray-900'}
                      ${isToday ? 'w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center' : ''}
                    `}>
                      {day.date.getDate()}
                    </div>

                    {/* Booking Bar */}
                    {booking && day.isCurrentMonth && (
                      <div
                        className={`
                          absolute left-0 right-0 mx-1 px-2 py-1 rounded text-xs font-medium text-white truncate
                          ${booking.status === 'confirmed' ? 'bg-teal-500' : 'bg-amber-500'}
                          ${isSameDay(booking.checkIn, day.date) ? 'rounded-l-full ml-2' : 'rounded-l-none'}
                          ${isSameDay(new Date(booking.checkOut.getTime() - 86400000), day.date) ? 'rounded-r-full mr-2' : 'rounded-r-none'}
                        `}
                        style={{ top: '32px' }}
                      >
                        {isSameDay(booking.checkIn, day.date) && booking.guestName}
                      </div>
                    )}

                    {/* Blocked Indicator */}
                    {blocked && !booking && day.isCurrentMonth && (
                      <div className="absolute left-1 right-1 top-8 bg-gray-400 text-white text-xs px-2 py-1 rounded">
                        Blocked
                      </div>
                    )}

                    {/* Price */}
                    {showPricing && day.isCurrentMonth && !isPast && !booking && !blocked && (
                      <div className={`
                        absolute bottom-2 left-2 text-sm
                        ${customPrice ? 'text-teal-600 font-medium' : 'text-gray-500'}
                      `}>
                        QAR {price}
                      </div>
                    )}

                    {/* Custom Price Indicator */}
                    {customPrice && day.isCurrentMonth && !booking && (
                      <div className="absolute top-2 right-2">
                        <Sparkles className="w-3 h-3 text-teal-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Bookings List */}
          <div className="px-6 py-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">
              Upcoming reservations in {monthNames[currentDate.getMonth()]}
            </h3>
            <div className="space-y-3">
              {bookings
                .filter(b => {
                  if (selectedProperty !== 'all' && b.propertyId !== selectedProperty) return false;
                  return b.checkIn.getMonth() === currentDate.getMonth() &&
                         b.checkIn.getFullYear() === currentDate.getFullYear();
                })
                .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime())
                .map(booking => {
                  const property = properties.find(p => p.id === booking.propertyId);
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                        booking.status === 'confirmed' ? 'bg-teal-500' : 'bg-amber-500'
                      }`}>
                        {booking.guestName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{booking.guestName}</p>
                        <p className="text-sm text-gray-500">
                          {property?.name} · {booking.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {booking.checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">QAR {booking.totalAmount.toLocaleString()}</p>
                        <p className={`text-sm ${booking.status === 'confirmed' ? 'text-teal-600' : 'text-amber-600'}`}>
                          {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </p>
                      </div>
                      <button className="p-2 hover:bg-gray-200 rounded-full">
                        <MessageSquare className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  );
                })}
              {bookings.filter(b => {
                if (selectedProperty !== 'all' && b.propertyId !== selectedProperty) return false;
                return b.checkIn.getMonth() === currentDate.getMonth();
              }).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No reservations this month
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && selectedDates.length > 0 && (
          <div className="fixed right-0 top-16 bottom-0 w-96 bg-white border-l border-gray-200 overflow-y-auto z-40">
            <div className="p-6">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDates.length} {selectedDates.length === 1 ? 'night' : 'nights'} selected
                </h3>
                <button
                  onClick={clearSelection}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Date Range Display */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="font-medium text-gray-900">
                      {selectedDates[0]?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                  <div className="text-right">
                    <p className="text-sm text-gray-500">To</p>
                    <p className="font-medium text-gray-900">
                      {selectedDates[selectedDates.length - 1]?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setSidebarMode('pricing')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium ${
                    sidebarMode === 'pricing'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <DollarSign className="w-5 h-5" />
                  Edit pricing
                </button>
                <button
                  onClick={() => setSidebarMode('block')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium ${
                    sidebarMode === 'block'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Ban className="w-5 h-5" />
                  Block
                </button>
              </div>

              {/* Pricing Mode */}
              {sidebarMode === 'pricing' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nightly price (QAR)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        defaultValue={selectedProperty_obj?.basePrice || 450}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-900">
                        This price will apply to all {selectedDates.length} selected nights.
                      </p>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700">
                    Save pricing
                  </button>
                </div>
              )}

              {/* Block Mode */}
              {sidebarMode === 'block' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Block reason (optional)
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500">
                      <option value="">Select a reason</option>
                      <option value="owner_use">Owner use</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="renovation">Renovation</option>
                      <option value="booked_elsewhere">Booked elsewhere</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      placeholder="Add any notes about this block..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-900">
                        Blocked dates cannot receive bookings. You can unblock them anytime from the calendar.
                      </p>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800">
                    Block {selectedDates.length} {selectedDates.length === 1 ? 'night' : 'nights'}
                  </button>
                </div>
              )}

              {/* Property Quick Stats */}
              {selectedProperty !== 'all' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">{selectedProperty_obj?.name}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Base price</span>
                      <span className="font-medium text-gray-900">QAR {selectedProperty_obj?.basePrice}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">This month bookings</span>
                      <span className="font-medium text-gray-900">
                        {bookings.filter(b => b.propertyId === selectedProperty && b.checkIn.getMonth() === currentDate.getMonth()).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Blocked nights</span>
                      <span className="font-medium text-gray-900">
                        {blockedDates.filter(b => b.propertyId === selectedProperty).length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
