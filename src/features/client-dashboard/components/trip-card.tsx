'use client';

import { MapPin, CreditCard } from 'lucide-react';
import { Trip } from '@/hooks';

interface TripCardProps {
  trip: Trip;
  formatDate: (dateString: string) => string;
  calculateNights: (checkIn: string, checkOut: string) => number;
  onPayBalance: (bookingId: string) => void;
  onClick: () => void;
}

export function TripCard({ trip, formatDate, calculateNights, onPayBalance, onClick }: TripCardProps) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row">
        {/* Property Image */}
        <div className="md:w-64 h-48 md:h-auto relative flex-shrink-0">
          <img
            src={trip.coverPhoto || '/placeholder-property.jpg'}
            alt={trip.propertyTitle}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Trip Details */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {trip.propertyCity}, {trip.propertyCountry}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {trip.propertyTitle}
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {trip.status === 'confirmed' && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full text-center">
                  Confirmed
                </span>
              )}
              {trip.paymentStatus === 'PARTIALLY_PAID' && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full text-center">
                  Balance Due
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Check-in</p>
              <p className="font-medium text-gray-900">{formatDate(trip.checkIn)}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Check-out</p>
              <p className="font-medium text-gray-900">{formatDate(trip.checkOut)}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Guests</p>
              <p className="font-medium text-gray-900">{trip.guests} guest{trip.guests > 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Confirmation code</p>
              <p className="font-mono text-sm font-medium text-gray-900">{trip.confirmationCode}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">
                {calculateNights(trip.checkIn, trip.checkOut)} nights
              </p>
              <p className="text-xl font-semibold text-gray-900">${trip.totalPrice.toLocaleString()}</p>
            </div>
          </div>

          {/* Pay Balance Button for PARTIALLY_PAID bookings */}
          {trip.paymentStatus === 'PARTIALLY_PAID' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-amber-600">Balance Due</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Paid: ${(trip.amountPaid || 0).toLocaleString()} / ${trip.totalPrice.toLocaleString()}
                  </p>
                </div>
                <p className="text-lg font-semibold text-amber-600">
                  ${(trip.totalPrice - (trip.amountPaid || 0)).toLocaleString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPayBalance(trip.id);
                }}
                className="w-full px-4 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                Pay Remaining Balance
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
