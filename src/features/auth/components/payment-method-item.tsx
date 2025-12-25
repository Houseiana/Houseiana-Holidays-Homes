'use client';

import { MoreHorizontal, Plus } from 'lucide-react';
import { CardIcon } from './card-icon';

export interface PaymentMethod {
  id: string | number;
  type: 'visa' | 'mastercard' | 'amex' | 'discover' | string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface PaymentMethodItemProps {
  method: PaymentMethod;
  onManage?: (id: string | number) => void;
}

export function PaymentMethodItem({ method, onManage }: PaymentMethodItemProps) {
  const cardTypeName = method.type.charAt(0).toUpperCase() + method.type.slice(1);

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
      <div className="flex items-center gap-4">
        <CardIcon type={method.type} />
        <div>
          <p className="font-medium text-gray-900">
            {cardTypeName} ••••{method.last4}
            {method.isDefault && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                Default
              </span>
            )}
          </p>
          <p className="text-sm text-gray-500">Expiry {method.expiry}</p>
        </div>
      </div>
      <button
        onClick={() => onManage?.(method.id)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MoreHorizontal className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
}

interface AddPaymentMethodButtonProps {
  onClick: () => void;
}

export function AddPaymentMethodButton({ onClick }: AddPaymentMethodButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 border border-dashed border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors w-full"
    >
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        <Plus className="w-5 h-5 text-gray-600" />
      </div>
      <span className="font-medium text-gray-900">Add payment method</span>
    </button>
  );
}
