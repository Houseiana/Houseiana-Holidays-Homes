import { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { LookupsAPI } from '@/lib/api/backend-api';

interface AddPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PayoutFormData) => void;
  isLoading?: boolean;
}

export interface PayoutFormData {
  paymentMethodId: number | string;
  accountId: string;
  accountName: string;
}

export function AddPayoutModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: AddPayoutModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    paymentMethodId: 0,
    accountId: '',
    accountName: '',
  });

  useEffect(() => {
    if (isOpen) {
      const fetchMethods = async () => {
        try {
          const response = await LookupsAPI.getPaymentMethods();
          if (response.success && response.data.data) {
            debugger
            setPaymentMethods(response.data.data);
            if (response.data.data.length > 0) {
              setFormData(prev => ({ ...prev, paymentMethodId: response?.data?.data?.[0]?.id }));
            }
          }
        } catch (error) {
          console.error('Error fetching payment methods:', error);
        }
      };
      fetchMethods();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMethodChange = (id: number) => {
    setFormData(prev => ({ ...prev, paymentMethodId: id }));
  };

  // const selectedMethod = paymentMethods.find(m => m.id === Number(formData.paymentMethodId));

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
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payout method
              </label>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label key={method.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-teal-500 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50">
                    <input
                      type="radio"
                      name="paymentMethodId"
                      value={method.id}
                      checked={Number(formData.paymentMethodId) === method.id}
                      onChange={() => handleMethodChange(method.id)}
                      className="w-5 h-5 text-teal-500"
                    />
                    <Building2 className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{method.name}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name
              </label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                placeholder="Full name on account"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account ID / IBAN
              </label>
              <input
                type="text"
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                placeholder="Account Number, IBAN, or Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                required
              />
            </div>

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
