/**
 * Booking Form Example Component
 * Demonstrates: Using the OOP API (v2) for creating bookings
 *
 * This component shows how to:
 * - Call the v2 booking API
 * - Handle form state and validation
 * - Display loading and error states
 * - Show success messages
 */
'use client';

import { useState } from 'react';

interface BookingFormProps {
  propertyId: string;
  guestId: string;
  pricePerNight: number;
}

export function BookingFormExample({ propertyId, guestId, pricePerNight }: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    guestCount: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Call the v2 API that uses OOP architecture
      const response = await fetch('/api/v2/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          guestId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          guestCount: formData.guestCount,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        console.log('Booking created:', result.data);
        // Reset form
        setFormData({ startDate: '', endDate: '', guestCount: 1 });
      } else {
        // Business logic error (e.g., "Property not available")
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      console.error('Error creating booking:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Book This Property</h2>

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Booking created successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Check-in Date
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Check-out Date
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Guests
          </label>
          <input
            type="number"
            min="1"
            value={formData.guestCount}
            onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="text-sm text-gray-600">
          Price: QAR {pricePerNight} per night
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating Booking...' : 'Book Now'}
        </button>
      </form>
    </div>
  );
}
