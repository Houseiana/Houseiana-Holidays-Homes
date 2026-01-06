'use client';

import { ChevronRight } from 'lucide-react';
import { StatusBadge } from './status-badge';

export interface PayoutRecord {
  id: string | number;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  method: string;
  currency?: string;
}

interface PayoutsTableProps {
  payouts: PayoutRecord[];
  onViewAll?: () => void;
  onDownloadCSV?: () => void;
  isLoading?: boolean;
  currency?: string;
}

export function PayoutsTable({
  payouts,
  onViewAll,
  onDownloadCSV,
  isLoading = false,
  currency = 'SAR',
}: PayoutsTableProps) {
  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-xl p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-8 text-center">
        <p className="text-gray-500">No transactions found</p>
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
                Date
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">
                Amount
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">
                Payout method
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payouts.map((payout) => (
              <tr key={payout.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-gray-900">{payout.date}</td>
                <td className="px-4 py-4 font-medium text-gray-900">
                  {payout.amount.toFixed(2)} {payout.currency || currency}
                </td>
                <td className="px-4 py-4 text-gray-500">{payout.method}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={payout.status} />
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
          View all transactions
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
