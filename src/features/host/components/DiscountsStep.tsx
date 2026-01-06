import { PropertyFormData } from '../types';

interface DiscountsStepProps {
  listing: PropertyFormData;
  setListing: (listing: PropertyFormData) => void;
}

export const DiscountsStep = ({ listing, setListing }: DiscountsStepProps) => (
  <div className="space-y-4">
    <p className="text-sm text-gray-500 mb-6">Select the discounts you want to offer. Click to select or deselect. All discounts are fixed at 20%.</p>

    {/* New Listing Promotion */}
    <div
      className={`p-6 border-2 rounded-xl transition-all cursor-pointer ${
        listing.newListingDiscount > 0
          ? 'border-green-600 bg-green-50'
          : 'border-gray-200 hover:border-gray-400'
      }`}
      onClick={() => setListing({
        ...listing,
        newListingDiscount: listing.newListingDiscount > 0 ? 0 : 20
      })}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
            listing.newListingDiscount > 0 ? 'border-green-600 bg-green-600' : 'border-gray-400'
          }`}>
            {listing.newListingDiscount > 0 && (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">New listing promotion</h4>
            <p className="text-gray-500 text-sm mt-1">Offer 20% off your first 3 bookings</p>
          </div>
        </div>
        <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
          listing.newListingDiscount > 0 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
        }`}>
          20%
        </div>
      </div>
    </div>

    {/* Weekly Discount */}
    <div
      className={`p-6 border-2 rounded-xl transition-all cursor-pointer ${
        listing.weeklyDiscount > 0
          ? 'border-green-600 bg-green-50'
          : 'border-gray-200 hover:border-gray-400'
      }`}
      onClick={() => setListing({
        ...listing,
        weeklyDiscount: listing.weeklyDiscount > 0 ? 0 : 20
      })}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
            listing.weeklyDiscount > 0 ? 'border-green-600 bg-green-600' : 'border-gray-400'
          }`}>
            {listing.weeklyDiscount > 0 && (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Weekly discount</h4>
            <p className="text-gray-500 text-sm mt-1">For stays of 7 nights or more</p>
          </div>
        </div>
        <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
          listing.weeklyDiscount > 0 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
        }`}>
          20%
        </div>
      </div>
    </div>

    {/* No discount info */}
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-600 text-center">
        {listing.newListingDiscount === 0 && listing.weeklyDiscount === 0 && listing.monthlyDiscount === 0
          ? "No discounts selected - your price will remain unchanged"
          : `Selected discounts will reduce your price by 20% for applicable bookings`
        }
      </p>
    </div>
  </div>
);
