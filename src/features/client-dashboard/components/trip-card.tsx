'use client';

import { MapPin, CreditCard } from 'lucide-react';
import { Trip } from '@/hooks';

interface TripCardProps {
  trip: Trip;
  formatDate: (dateString: string) => string;
  calculateNights: (checkIn: string, checkOut: string) => number;
  onPayBalance: (bookingId: string) => void;
  onCancel: (trip: Trip) => void;
  onReview: (trip: Trip) => void;
}

export function TripCard({ trip, formatDate, calculateNights, onPayBalance, onCancel, onReview }: TripCardProps) {
  const isUpcoming = (trip.status === 'UPCOMING')
  const isPast = (trip.status === 'PAST')
 
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex flex-col md:flex-row">
        {/* Property Image */}
        <div className="md:w-64 h-48 md:h-auto relative flex-shrink-0">
          <img
            src={trip.propertyCoverPhoto || '/No_Image_Available.jpg'}
            alt={trip.propertyTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/No_Image_Available.jpg';
            }}
          />
        </div>

        {/* Trip Details */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {trip.address.city.name}, {trip.address.city.country.name}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {trip.propertyTitle}
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {trip.status && (
                <span className={`px-3 py-1 text-xs font-medium rounded-full text-center ${
                  trip.status === 'UPCOMING' ? 'bg-green-100 text-green-800' :
                  trip.status === 'PAST' ? 'bg-amber-100 text-amber-800' :
                  trip.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {trip.status}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 justify-between items-center mb-4 text-sm">
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
            <div>
              <p className="text-gray-500 mb-1">
                {calculateNights(trip.checkIn, trip.checkOut)} nights
              </p>
              <p className="text-xl font-semibold text-gray-900">${trip.totalPrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Host</p>
              <p className="font-mono text-sm font-medium text-gray-900">{trip.hostName}</p>
            </div>
            {isUpcoming && (
                <button
                   onClick={(e) => {
                      e.stopPropagation();
                      onCancel(trip);
                   }}
                   className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors text-sm"
                >
                  Cancel Booking
                </button>
             )}
             {trip.paymentStatus === 'PARTIALLY_PAID' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPayBalance(trip.id);
                  }}
                  className="flex-1 md:flex-none px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <CreditCard size={16} />
                  Pay Balance
                </button>
             )}

             

             {isPast && (
                <button
                   onClick={(e) => {
                      e.stopPropagation();
                      onReview(trip);
                   }}
                   className="flex-1 md:flex-none px-4 py-2 border border-teal-200 text-teal-600 font-medium rounded-lg hover:bg-teal-50 transition-colors text-sm"
                >
                  Review Property
                </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
