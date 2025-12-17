'use client';

import { Share, MessageCircle, Minus, Plus, CheckCircle, ShieldCheck, Clock, Tag } from 'lucide-react';
import type { PropertyDetail, PropertyBookingForm } from '@/hooks';

export interface BookingCardProps {
  property: PropertyDetail;
  bookingForm: PropertyBookingForm;
  onBookingFormChange: (updates: Partial<PropertyBookingForm>) => void;
  onUpdateGuests: (change: number) => void;
  onReserve: () => void;
  calculateNights: () => number;
  calculateTotal: () => { base: number; total: number; service: number; cleaning: number };
  isNewListing: boolean;
  reviewLabel: string;
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
}: BookingCardProps) {
  const totals = calculateTotal();
  const nights = calculateNights();

  return (
    <div className="sticky top-24 border border-gray-200 rounded-2xl p-6 shadow-xl bg-white space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            ${property.price.toFixed(0)} <span className="text-sm text-gray-600 font-normal">night</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tag className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">{isNewListing ? 'Intro price for early guests' : reviewLabel}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Share className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <MessageCircle className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl divide-y divide-gray-200">
        <div className="grid grid-cols-2">
          <div className="p-3 border-r border-gray-200">
            <label className="text-xs font-semibold text-gray-600">CHECK-IN</label>
            <input
              type="date"
              value={bookingForm.checkIn}
              onChange={(e) => onBookingFormChange({ checkIn: e.target.value })}
              className="w-full text-sm font-semibold text-gray-900"
            />
          </div>
          <div className="p-3">
            <label className="text-xs font-semibold text-gray-600">CHECKOUT</label>
            <input
              type="date"
              value={bookingForm.checkOut}
              onChange={(e) => onBookingFormChange({ checkOut: e.target.value })}
              className="w-full text-sm font-semibold text-gray-900"
            />
          </div>
        </div>
        <div className="p-3">
          <label className="text-xs font-semibold text-gray-600">GUESTS</label>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm font-semibold text-gray-900">{bookingForm.guests} guests</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateGuests(-1)}
                className="p-2 rounded-full border border-gray-200 hover:border-gray-300 disabled:opacity-50"
                disabled={bookingForm.guests <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => onUpdateGuests(1)}
                className="p-2 rounded-full border border-gray-200 hover:border-gray-300"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onReserve}
        className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white py-3 rounded-xl font-bold hover:from-rose-600 hover:to-amber-600 transition-all shadow-lg shadow-rose-200"
      >
        Reserve
      </button>

      <p className="text-center text-sm text-gray-600">You won&apos;t be charged yet</p>

      <div className="border-t pt-4 space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>${property.price.toFixed(0)} x {nights} nights</span>
          <span>${totals.base?.toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span>Cleaning fee</span>
          <span>${totals.cleaning?.toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span>Service fee</span>
          <span>${totals.service?.toFixed(0)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900">
          <span>Total before taxes</span>
          <span>${totals.total?.toFixed(0)}</span>
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900">48-hour free cancellation</p>
            <p className="text-xs text-gray-600">Then moderate policy applies</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Houseiana protection</p>
            <p className="text-xs text-gray-600">Secure payments and verified hosts</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Instant confirmation</p>
            <p className="text-xs text-gray-600">You&apos;ll get details right away</p>
          </div>
        </div>
      </div>
    </div>
  );
}
