import { format } from 'date-fns';
import { Calendar, Clock, User, MessageCircle, Moon, CheckCircle, XCircle } from 'lucide-react';

export interface Reservation {
  id: string;
  checkIn: string | Date;
  checkOut: string | Date;
  guests: number;
  nights: number;
  notes: string | null;
  price: number;
  status: string;
  title: string;
  unitName: string;
}

interface ReservationCardProps {
  reservation: Reservation;
  onApprove?: (id: string) => void;
  onDecline?: (id: string) => void;
  isProcessing?: string | null;
}

export function ReservationCard({ reservation, onApprove, onDecline, isProcessing }: ReservationCardProps) {
  const isPending = reservation.status === 'Pending';
  const checkInDate = new Date(reservation.checkIn);
  const checkOutDate = new Date(reservation.checkOut);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Info */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{reservation.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{reservation.unitName}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              reservation.status === 'Confirmed' ? 'bg-green-50 text-green-700' :
              reservation.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
              reservation.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {reservation.status}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Check-in</span>
              </div>
              <p className="font-medium text-gray-900">{format(checkInDate, 'MMM d, yyyy')}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Check-out</span>
              </div>
              <p className="font-medium text-gray-900">{format(checkOutDate, 'MMM d, yyyy')}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Moon className="w-4 h-4" />
                <span>Nights</span>
              </div>
              <p className="font-medium text-gray-900">{reservation.nights}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <User className="w-4 h-4" />
                <span>Guests</span>
              </div>
              <p className="font-medium text-gray-900">{reservation.guests}</p>
            </div>
          </div>

          {reservation.notes && (
            <div className="bg-gray-50 p-3 rounded-lg flex items-start gap-3 mt-4">
              <MessageCircle className="w-4 h-4 text-gray-400 mt-1" />
              <p className="text-sm text-gray-600 italic">"{reservation.notes}"</p>
            </div>
          )}
        </div>

        {/* Price & Actions */}
        <div className="w-full lg:w-48 lg:border-l lg:pl-6 flex flex-col justify-between gap-4">
          <div>
            <p className="text-gray-500 text-sm">Total Price</p>
            <p className="text-2xl font-bold text-gray-900">${reservation.price}</p>
          </div>

          {isPending && onApprove && onDecline && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onApprove(reservation.id)}
                disabled={!!isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isProcessing === reservation.id ? 'Processing...' : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </>
                )}
              </button>
              <button
                onClick={() => onDecline(reservation.id)}
                disabled={!!isProcessing}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
