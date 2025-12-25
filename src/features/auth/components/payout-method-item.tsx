'use client';

import { Building2, MoreHorizontal, Plus } from 'lucide-react';
import { StatusBadge } from './status-badge';

export interface PayoutMethod {
  id: string | number;
  type: 'bank' | 'paypal';
  bankName?: string;
  email?: string;
  last4: string;
  currency: string;
  isDefault: boolean;
  status: 'ready' | 'pending' | 'failed';
}

interface PayoutMethodItemProps {
  method: PayoutMethod;
  onManage?: (id: string | number) => void;
}

export function PayoutMethodItem({ method, onManage }: PayoutMethodItemProps) {
  const displayName = method.type === 'bank' ? method.bankName : method.email;

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          {method.type === 'bank' ? (
            <Building2 className="w-5 h-5 text-gray-600" />
          ) : (
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {displayName} ••••{method.last4}
            {method.isDefault && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                Default
              </span>
            )}
          </p>
          <p className="text-sm text-gray-500">
            {method.currency} · {method.type === 'bank' ? 'Bank account' : 'PayPal'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={method.status} />
        <button
          onClick={() => onManage?.(method.id)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

interface AddPayoutMethodButtonProps {
  onClick: () => void;
}

export function AddPayoutMethodButton({ onClick }: AddPayoutMethodButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 border border-dashed border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors w-full"
    >
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        <Plus className="w-5 h-5 text-gray-600" />
      </div>
      <span className="font-medium text-gray-900">Add payout method</span>
    </button>
  );
}
