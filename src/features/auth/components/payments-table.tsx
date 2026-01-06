'use client';

import { ChevronRight } from 'lucide-react';
import { StatusBadge } from './status-badge';

export interface PaymentRecord {
  id: string | number;
  property: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded' | 'failed';
  currency?: string;
}

interface PaymentsTableProps {
  payments: PaymentRecord[];
  onViewAll?: () => void;
  onManagePayments?: () => void;
  isLoading?: boolean;
  currency?: string;
}

export function PaymentsTable({
  payments,
  onViewAll,
  onManagePayments,
  isLoading = false,
  currency = 'SAR',
}: PaymentsTableProps) {
  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-xl p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-8 text-center">
        <p className="text-gray-500">No payments found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">
                Description
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">
                Date
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">
                Amount
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <p className="font-medium text-gray-900">{payment.property}</p>
                </td>
                <td className="px-4 py-4 text-gray-500">{payment.date}</td>
                <td className="px-4 py-4 font-medium text-gray-900">
                  {payment.amount.toFixed(2)} {payment.currency || currency}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={payment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {onViewAll && (
        <button
          onClick={onViewAll}
          className="mt-4 text-sm font-medium text-gray-900 hover:underline flex items-center gap-1"
        >
          View all payments
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
