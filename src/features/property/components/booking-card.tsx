import { Share, MessageCircle, Minus, Plus, CheckCircle, ShieldCheck, Clock, Tag, Calendar as CalendarIcon } from 'lucide-react';
import type { PropertyDetail, PropertyBookingForm } from '@/hooks';
import { toast } from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';
import Calendar from '@/components/ui/calendar/Calendar';
import { format } from 'date-fns';

export interface BookingCardProps {
  property: PropertyDetail;
  bookingForm: PropertyBookingForm;
  onBookingFormChange: (updates: Partial<PropertyBookingForm>) => void;
  onUpdateGuests: (change: number) => void;
  onReserve: () => void;
  calculateNights: () => number;
  calculateTotal: () => { base: number; total: number; service: number; cleaning: number; discount?: number };
  isNewListing: boolean;
  reviewLabel: string;
  isDateBlocked: (date: Date) => boolean;
  bookedDates: { from: string; to: string }[];
}

export function BookingCard({
  property,
  bookingForm,
  onBookingFormChange,
  onUpdateGuests,
  onReserve,
  calculateNights,
  calculateTotal,
  isNewListing,
  reviewLabel,
  isDateBlocked,
  bookedDates,
}: BookingCardProps) {
  const totals = calculateTotal();
  const nights = calculateNights();
  const [showCalendar, setShowCalendar] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'checkIn' | 'checkOut' | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
            setShowCalendar(false);
            setFocusedInput(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  
  const isValidDates = () => {
    if (!bookingForm.checkIn || !bookingForm.checkOut) return false;
    const checkIn = new Date(bookingForm.checkIn);
    const checkOut = new Date(bookingForm.checkOut);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Check-in must be >= today
    const checkInMidnight = new Date(checkIn);
    checkInMidnight.setHours(0,0,0,0);
    if (checkInMidnight < now) return false;

    // Check-out must be > check-in
    return checkOut > checkIn;
  };

  const formattedDates = () => {
      if (bookingForm.checkIn && bookingForm.checkOut) {
          return `${format(new Date(bookingForm.checkIn), 'MMM d')} - ${format(new Date(bookingForm.checkOut), 'MMM d')}`;
      }
      return 'Select dates';
  };

  return (
    <div className="sticky top-24 border border-gray-200 rounded-2xl p-6 shadow-xl bg-white space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            ${property.priceWithoutDiscount?.toFixed(0) || 0} <span className="text-sm text-gray-600 font-normal">night</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tag className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">{isNewListing ? 'Intro price for early guests' : reviewLabel}</span>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl divide-y divide-gray-200 relative">
        {/* Date Selection Trigger */}
        <div 
          className="grid grid-cols-2 divide-x divide-gray-200 cursor-pointer"
        >
          <div 
            className={`p-3 hover:bg-gray-50 transition-colors ${focusedInput === 'checkIn' ? 'bg-gray-50 ring-2 ring-inset ring-black' : ''}`}
            onClick={() => {
              setFocusedInput('checkIn');
              setShowCalendar(true);
            }}
          >
            <label className="text-xs font-semibold text-gray-600 block mb-1">CHECK-IN</label>
            <div className="text-sm text-gray-900 font-medium">
                {bookingForm.checkIn ? format(new Date(bookingForm.checkIn), 'd/MM/yyyy') : 'Add date'}
            </div>
          </div>
          <div 
            className={`p-3 hover:bg-gray-50 transition-colors ${focusedInput === 'checkOut' ? 'bg-gray-50 ring-2 ring-inset ring-black' : ''}`}
             onClick={() => {
              setFocusedInput('checkOut');
              setShowCalendar(true);
            }}
          >
            <label className="text-xs font-semibold text-gray-600 block mb-1">CHECKOUT</label>
            <div className="text-sm text-gray-900 font-medium">
                {bookingForm.checkOut ? format(new Date(bookingForm.checkOut), 'd/MM/yyyy') : 'Add date'}
            </div>
          </div>
        </div>
        
        {/* Calendar Popup */}
        {showCalendar && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 flex justify-center" ref={calendarRef}>
                <Calendar 
                    blockedDates={bookedDates}
                    checkIn={bookingForm.checkIn}
                    checkOut={bookingForm.checkOut}
                    focusedInput={focusedInput}
                    onChange={(inDate, outDate) => {
                        // Pass updates to parent
                        onBookingFormChange({ checkIn: inDate, checkOut: outDate });
                        
                        // Auto-advance logic
                        if (focusedInput === 'checkIn' && inDate) {
                             setFocusedInput('checkOut');
                        } else if (focusedInput === 'checkOut' && outDate) {
                             setShowCalendar(false);
                             setFocusedInput(null);
                        }
                    }}
                    minDate={today}
                />
            </div>
        )}

        <div className="p-3">
          <label className="text-xs font-semibold text-gray-600">GUESTS</label>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm font-semibold text-gray-900">{bookingForm.guests} guests</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateGuests(-1)}
                className="p-2 rounded-full border border-gray-200 hover:border-gray-300 disabled:opacity-50 flex items-center justify-center"
                disabled={bookingForm.guests <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => onUpdateGuests(1)}
                className="p-2 rounded-full border border-gray-200 hover:border-gray-300 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onReserve}
        disabled={!isValidDates()}
        className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${
          isValidDates()
            ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-600 hover:to-amber-600 shadow-rose-200'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
        }`}
      >
        Reserve
      </button>

      <p className="text-center text-sm text-gray-600">You won&apos;t be charged yet</p>

      <div className="border-t pt-4 space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>${property.priceWithoutDiscount || 0} x {nights} nights</span>
          <span>${totals.base?.toFixed(0)}</span>
        </div>
        
        {totals.discount! > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Discount</span>
            <span>-${totals.discount?.toFixed(0)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Cleaning fee</span>
          <span>${totals.cleaning?.toFixed(0) || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Service fee</span>
          <span>${totals.service?.toFixed(0) || 0}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900">
          <span>Total before taxes</span>
          <span>${totals.total?.toFixed(0) || 0}</span>
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        {property.cancellationPolicy && <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900">48-hour free cancellation</p>
            <p className="text-xs text-gray-600">Then moderate policy applies</p>
          </div>
        </div>}
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Houseiana protection</p>
            <p className="text-xs text-gray-600">Secure payments and verified hosts</p>
          </div>
        </div>
        {property.instantBook && <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Instant confirmation</p>
            <p className="text-xs text-gray-600">You&apos;ll get details right away</p>
          </div>
        </div>}
      </div>
    </div>
  );
}
