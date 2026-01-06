import Link from 'next/link';
import { Search, X, Clock, Home } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Dispatch, SetStateAction, RefObject, useState, useRef, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';

// Lazy load heavy components
const GuestCounter = dynamic(() => import('./GuestCounter'), { ssr: false });
const CalendarView = dynamic(() => import('./CalendarView'), { ssr: false });

const libraries: ("places")[] = ["places"];

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

interface ExpandedSearchProps {
  location: string;
  setLocation: Dispatch<SetStateAction<string>>;
  checkIn: Date | null;
  setCheckIn: Dispatch<SetStateAction<Date | null>>;
  checkOut: Date | null;
  setCheckOut: Dispatch<SetStateAction<Date | null>>;
  guests: GuestCounts;
  setGuests: Dispatch<SetStateAction<GuestCounts>>;
  searchMode: string | null;
  setSearchMode: Dispatch<SetStateAction<string | null>>;
  calendarMonth: Date;
  setCalendarMonth: Dispatch<SetStateAction<Date>>;
  totalGuests: number;
  guestText: string;
  handleDateClick: (date: Date) => void;
  handleSearch: () => void;
  formatDate: (date: Date | null) => string;
  searchRef: RefObject<HTMLDivElement>;
}

const recentSearches: Array<{ location: string; type: string }> = [];

export default function ExpandedSearch({
  location, setLocation,
  checkIn,
  checkOut,
  guests, setGuests,
  searchMode, setSearchMode,
  calendarMonth, setCalendarMonth,
  totalGuests,
  guestText,
  handleDateClick,
  handleSearch,
  formatDate,
  searchRef
}: ExpandedSearchProps) {
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const placeInputRef = useRef<HTMLInputElement>(null);
  const placeAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (isLoaded && placeInputRef.current && !placeAutocompleteRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(placeInputRef.current, {
        types: ['geocode'],
        fields: ['formatted_address', 'name'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address || place.name) {
          setLocation(place.formatted_address || place.name || '');
          setSearchMode('checkin');
        }
      });

      placeAutocompleteRef.current = autocomplete;
    }
  }, [isLoaded, setLocation, setSearchMode]);

  return (
    <div className="absolute left-0 right-0 top-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Top row with logo and close */}
        <div className="flex items-center justify-between mb-1">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">houseiana</span>
          </Link>
          <button
            onClick={() => setSearchMode(null)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Tabs */}
        <div className="flex justify-center mb-4">
          <div className="flex gap-6">
            <button className="text-sm font-medium text-gray-900 border-b-2 border-gray-900 pb-3">Stays</button>
          </div>
        </div>

        {/* Search Bar Fields */}
        <div ref={searchRef} className="relative">
          <div className="flex items-center gap-2 bg-gray-100 rounded-3xl p-2">
            {/* Where */}
            <button
              onClick={() => setSearchMode('where')}
              className={`flex-1 text-left px-4 py-0 rounded-3xl transition-colors ${searchMode === 'where' ? 'bg-white shadow-lg' : 'hover:bg-gray-200'}`}
            >
              <p className="text-xs font-semibold mt-2">Where</p>
              <input
                ref={placeInputRef}
                type="text"
                placeholder={isLoaded ? "Search destinations" : "Loading..."}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm bg-transparent outline-none text-gray-900 placeholder-gray-500"
                onFocus={() => setSearchMode('where')}
                disabled={!isLoaded}
              />
            </button>

            <span className="h-8 w-px bg-gray-300" />

            {/* Check in */}
            <button
              onClick={() => setSearchMode('checkin')}
              className={`px-6 py-3 rounded-2xl transition-colors ${searchMode === 'checkin' ? 'bg-white shadow-lg' : 'hover:bg-gray-200'}`}
            >
              <p className="text-xs font-semibold">Check in</p>
              <p className={`text-sm ${checkIn ? 'text-gray-900' : 'text-gray-500'}`}>
                {formatDate(checkIn)}
              </p>
            </button>

            <span className="h-8 w-px bg-gray-300" />

            {/* Check out */}
            <button
              onClick={() => setSearchMode('checkout')}
              className={`px-6 py-3 rounded-full transition-colors ${searchMode === 'checkout' ? 'bg-white shadow-lg' : 'hover:bg-gray-200'}`}
            >
              <p className="text-xs font-semibold">Check out</p>
              <p className={`text-sm ${checkOut ? 'text-gray-900' : 'text-gray-500'}`}>
                {formatDate(checkOut)}
              </p>
            </button>

            <span className="h-8 w-px bg-gray-300" />

            {/* Who */}
            <button
              onClick={() => setSearchMode('who')}
              className={`flex-1 flex items-center px-6 py-3 rounded-full transition-colors ${searchMode === 'who' ? 'bg-white shadow-lg' : 'hover:bg-gray-200'}`}
            >
              <div>
                <p className="text-xs font-semibold">Who</p>
                <p className={`text-sm ${totalGuests > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                  {guestText}
                </p>
              </div>
            </button>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-3 rounded-2xl hover:from-teal-600 hover:to-teal-700 transition-all ml-2"
            >
              <Search className="w-4 h-4" />
              <span className="font-medium">Search</span>
            </button>
          </div>

          {/* Dropdown Panels */}
          {searchMode === 'where' && (
            <div className="absolute left-0 top-full mt-3 w-[500px] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              {recentSearches.length > 0 && (
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 mb-3">Recent searches</h3>
                  {recentSearches.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => { setLocation(item.location); setSearchMode('checkin'); }}
                      className="flex items-center gap-4 w-full p-3 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{item.location}</p>
                        <p className="text-sm text-gray-500">Recent search</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {(searchMode === 'checkin' || searchMode === 'checkout') && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex gap-2 justify-center">
                  {['Exact dates', '± 1 day', '± 2 days', '± 3 days', '± 7 days'].map((option, i) => (
                    <button
                      key={i}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${i === 0 ? 'bg-gray-900 text-white' : 'border border-gray-300 hover:border-gray-900'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex">
                <CalendarView
                  calendarMonth={calendarMonth}
                  setCalendarMonth={setCalendarMonth}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onDateClick={handleDateClick}
                />
                <div className="border-l border-gray-200">
                  <CalendarView
                    calendarMonth={new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)}
                    setCalendarMonth={setCalendarMonth}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onDateClick={handleDateClick}
                  />
                </div>
              </div>
            </div>
          )}

          {searchMode === 'who' && (
            <div className="absolute right-0 top-full mt-3 w-96 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden p-6">
              <GuestCounter
                label="Adults"
                description="Ages 13 or above"
                count={guests.adults}
                onIncrease={() => setGuests({...guests, adults: Math.min(15, guests.adults + 1)})}
                onDecrease={() => setGuests({...guests, adults: Math.max(0, guests.adults - 1)})}
                maxValue={15}
              />
              <GuestCounter
                label="Children"
                description="Ages 2-12"
                count={guests.children}
                onIncrease={() => setGuests({...guests, children: Math.min(5, guests.children + 1)})}
                onDecrease={() => setGuests({...guests, children: Math.max(0, guests.children - 1)})}
                maxValue={5}
              />
              <GuestCounter
                label="Infants"
                description="Under 2"
                count={guests.infants}
                onIncrease={() => setGuests({...guests, infants: Math.min(5, guests.infants + 1)})}
                onDecrease={() => setGuests({...guests, infants: Math.max(0, guests.infants - 1)})}
                maxValue={5}
              />
              <GuestCounter
                label="Pets"
                description="Bringing a service animal?"
                count={guests.pets}
                onIncrease={() => setGuests({...guests, pets: Math.min(2, guests.pets + 1)})}
                onDecrease={() => setGuests({...guests, pets: Math.max(0, guests.pets - 1)})}
                maxValue={2}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
