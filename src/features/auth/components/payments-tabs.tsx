'use client';

interface PaymentsTabsProps {
  activeTab: 'payments' | 'payouts';
  onTabChange: (tab: 'payments' | 'payouts') => void;
}

export function PaymentsTabs({ activeTab, onTabChange }: PaymentsTabsProps) {
  return (
    <div className="flex gap-8 border-b border-gray-200 mb-8">
      <button
        onClick={() => onTabChange('payments')}
        className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
          activeTab === 'payments'
            ? 'text-gray-900 border-gray-900'
            : 'text-gray-500 border-transparent hover:text-gray-900'
        }`}
      >
        Payments
      </button>
      <button
        onClick={() => onTabChange('payouts')}
        className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
          activeTab === 'payouts'
            ? 'text-gray-900 border-gray-900'
            : 'text-gray-500 border-transparent hover:text-gray-900'
        }`}
      >
        Payouts
      </button>
    </div>
  );
}
