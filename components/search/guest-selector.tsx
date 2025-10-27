'use client';

import { Minus, Plus, X } from 'lucide-react';

interface GuestCount {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

interface GuestSelectorProps {
  guests: GuestCount;
  onChange: (guests: GuestCount) => void;
  onClose?: () => void;
}

interface GuestRowProps {
  title: string;
  description: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  minCount?: number;
  maxCount?: number;
  showServiceAnimalLink?: boolean;
}

const GuestRow = ({
  title,
  description,
  count,
  onIncrement,
  onDecrement,
  minCount = 0,
  maxCount = 16,
  showServiceAnimalLink = false
}: GuestRowProps) => {
  const canDecrement = count > minCount;
  const canIncrement = count < maxCount;

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">
          {description}
          {showServiceAnimalLink && (
            <>
              <br />
              <button className="text-gray-900 font-medium underline text-sm mt-1">
                Bringing a service animal?
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onDecrement}
          disabled={!canDecrement}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
            canDecrement
              ? 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800'
              : 'border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
        >
          <Minus className="w-3 h-3" />
        </button>

        <span className="w-8 text-center font-medium text-gray-900">
          {count}
        </span>

        <button
          onClick={onIncrement}
          disabled={!canIncrement}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
            canIncrement
              ? 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800'
              : 'border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default function GuestSelector({ guests, onChange, onClose }: GuestSelectorProps) {
  // Handle undefined onClose
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };
  const updateGuests = (field: keyof GuestCount, delta: number) => {
    const newValue = Math.max(0, guests[field] + delta);

    // Enforce business rules
    let updatedGuests = { ...guests, [field]: newValue };

    // Ensure at least 1 adult if there are children or infants
    if (field === 'adults' && newValue === 0 && (guests.children > 0 || guests.infants > 0)) {
      return; // Don't allow 0 adults if there are children/infants
    }

    // Limit infants to max 5
    if (field === 'infants' && newValue > 5) {
      updatedGuests.infants = 5;
    }

    // Limit pets to max 5
    if (field === 'pets' && newValue > 5) {
      updatedGuests.pets = 5;
    }

    onChange(updatedGuests);
  };

  const getTotalGuests = () => {
    return guests.adults + guests.children;
  };

  const clearGuests = () => {
    onChange({
      adults: 0,
      children: 0,
      infants: 0,
      pets: 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Guests
          </h3>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Guest Rows */}
        <div className="space-y-0 divide-y divide-gray-100">
          <GuestRow
            title="Adults"
            description="Ages 13 or above"
            count={guests.adults}
            onIncrement={() => updateGuests('adults', 1)}
            onDecrement={() => updateGuests('adults', -1)}
            minCount={getTotalGuests() > 0 || guests.infants > 0 ? 1 : 0}
            maxCount={16}
          />

          <GuestRow
            title="Children"
            description="Ages 2–12"
            count={guests.children}
            onIncrement={() => updateGuests('children', 1)}
            onDecrement={() => updateGuests('children', -1)}
            minCount={0}
            maxCount={5}
          />

          <GuestRow
            title="Infants"
            description="Under 2"
            count={guests.infants}
            onIncrement={() => updateGuests('infants', 1)}
            onDecrement={() => updateGuests('infants', -1)}
            minCount={0}
            maxCount={5}
          />

          <GuestRow
            title="Pets"
            description=""
            count={guests.pets}
            onIncrement={() => updateGuests('pets', 1)}
            onDecrement={() => updateGuests('pets', -1)}
            minCount={0}
            maxCount={5}
            showServiceAnimalLink={true}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={clearGuests}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
          >
            Clear
          </button>

          <div className="text-sm text-gray-600">
            {getTotalGuests() === 0 ? (
              'Add guests'
            ) : getTotalGuests() === 1 ? (
              '1 guest'
            ) : (
              `${getTotalGuests()} guests`
            )}
            {guests.infants > 0 && (
              <span className="text-gray-500">
                {guests.infants === 1 ? ', 1 infant' : `, ${guests.infants} infants`}
              </span>
            )}
            {guests.pets > 0 && (
              <span className="text-gray-500">
                {guests.pets === 1 ? ', 1 pet' : `, ${guests.pets} pets`}
              </span>
            )}
          </div>
        </div>

        {/* Maximum guests note */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            💡 This property allows a maximum of {getTotalGuests() + guests.infants} guests, not including infants.
            {guests.pets > 0 && ' Pet fees may apply.'}
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}