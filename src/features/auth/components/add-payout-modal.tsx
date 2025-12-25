'use client';

import { useState } from 'react';
import { X, Building2 } from 'lucide-react';

interface AddPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PayoutFormData) => void;
  isLoading?: boolean;
}

export interface PayoutFormData {
  country: string;
  payoutType: 'bank' | 'paypal';
  accountHolderName: string;
  iban?: string;
  paypalEmail?: string;
  isDefault: boolean;
}

const COUNTRIES = [
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'QA', name: 'Qatar' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'OM', name: 'Oman' },
];

export function AddPayoutModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: AddPayoutModalProps) {
  const [formData, setFormData] = useState<PayoutFormData>({
    country: 'SA',
    payoutType: 'bank',
    accountHolderName: '',
    iban: '',
    paypalEmail: '',
    isDefault: false,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">Add payout method</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing country/region
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payout method
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-teal-500 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50">
                  <input
                    type="radio"
                    name="payoutType"
                    value="bank"
                    checked={formData.payoutType === 'bank'}
                    onChange={handleChange}
                    className="w-5 h-5 text-teal-500"
                  />
                  <Building2 className="w-6 h-6 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Bank account</p>
                    <p className="text-sm text-gray-500">3-5 business days</p>
                  </div>
                </label>
                <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-teal-500 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50">
                  <input
                    type="radio"
                    name="payoutType"
                    value="paypal"
                    checked={formData.payoutType === 'paypal'}
                    onChange={handleChange}
                    className="w-5 h-5 text-teal-500"
                  />
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">PayPal</p>
                    <p className="text-sm text-gray-500">Within minutes</p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account holder name
              </label>
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                placeholder="Full name on account"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {formData.payoutType === 'bank' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IBAN
                </label>
                <input
                  type="text"
                  name="iban"
                  value={formData.iban}
                  onChange={handleChange}
                  placeholder="SA00 0000 0000 0000 0000 0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PayPal email
                </label>
                <input
                  type="email"
                  name="paypalEmail"
                  value={formData.paypalEmail}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">Set as default payout method</span>
            </label>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add payout method'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
