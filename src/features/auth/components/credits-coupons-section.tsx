'use client';

import { Gift, Receipt, DollarSign } from 'lucide-react';

interface CreditsCouponsSectionProps {
  creditBalance: number;
  currency?: string;
  onAddGiftCard?: () => void;
  onAddCoupon?: () => void;
}

export function CreditsCouponsSection({
  creditBalance,
  currency = 'SAR',
  onAddGiftCard,
  onAddCoupon,
}: CreditsCouponsSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Credits & coupons</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Gift Cards */}
        <div className="p-6 border border-gray-200 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Gift cards</h3>
              <p className="text-sm text-gray-500 mb-3">
                Redeem a gift card to add credit to your account
              </p>
              <button
                onClick={onAddGiftCard}
                className="text-sm font-medium text-teal-600 hover:underline"
              >
                Add gift card
              </button>
            </div>
          </div>
        </div>

        {/* Coupons */}
        <div className="p-6 border border-gray-200 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Receipt className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Coupons</h3>
              <p className="text-sm text-gray-500 mb-3">
                Add a coupon code to get a discount on your booking
              </p>
              <button
                onClick={onAddCoupon}
                className="text-sm font-medium text-teal-600 hover:underline"
              >
                Add coupon
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Balance */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Your credit balance</p>
          <p className="text-2xl font-bold text-gray-900">
            {creditBalance.toFixed(2)} {currency}
          </p>
        </div>
        <DollarSign className="w-8 h-8 text-gray-300" />
      </div>
    </section>
  );
}
