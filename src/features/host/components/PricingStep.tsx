import { PropertyFormData } from '../types';
import { Info } from 'lucide-react';

interface PricingStepProps {
  listing: PropertyFormData;
  setListing: (listing: PropertyFormData) => void;
}

export const PricingStep = ({ listing, setListing }: PricingStepProps) => (
  <div className="space-y-8">
    <div className="text-center py-8">
      <div className="flex flex-col items-center">
        <div className="inline-flex items-center border-b-4 border-gray-900 pb-2">
          <span className="text-5xl lg:text-6xl font-semibold">$</span>
          <input
            type="number"
            min="20"
            max="10000"
            value={listing.basePrice}
            onChange={(e) => {
              let val = parseInt(e.target.value);
              if (isNaN(val)) val = 0;
              if (val < 0) val = 0;
              if (val > 10000) val = 10000;
              setListing({ ...listing, basePrice: val });
            }}
            className="text-5xl lg:text-6xl font-semibold w-56 text-center border-0 focus:ring-0 outline-none bg-transparent"
          />
        </div>
        <p className="text-gray-500 mt-4">per night</p>
        
        {listing.basePrice < 20 && (
          <p className="text-red-500 font-medium mt-2">
            Price must be at least $20
          </p>
        )}

        <div className="mt-12 w-full px-4 border-t border-gray-100 pt-8">
          <label className="block text-lg font-medium text-gray-900 mb-4 text-center">
            Cleaning fee
          </label>
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center border-b-2 border-gray-300 focus-within:border-black pb-1 transition-colors">
              <span className="text-4xl font-semibold text-gray-900 mr-1">$</span>
              <input
                type="number"
                min="0"
                max="35"
                value={listing.cleaningFee || 0}
                onChange={(e) => {
                  let val = parseInt(e.target.value);
                  if (isNaN(val)) val = 0;
                  if (val < 0) val = 0;
                  if (val > 35) val = 35;
                  setListing({ ...listing, cleaningFee: val });
                }}
                className="text-4xl lg:text-5xl font-semibold w-56 text-center border-0 focus:ring-0 outline-none bg-transparent p-0"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">Maximum $35</p>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-700">Base price</span>
        <span className="font-medium">${listing.basePrice}</span>
      </div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-700">Cleaning fee</span>
        <span className="font-medium">${listing.cleaningFee || 0}</span>
      </div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-700">Guest service fee</span>
        <span className="font-medium">${Math.round(listing.basePrice * 0.10 )}</span>
      </div>
      <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
        <span className="text-gray-900 font-medium">Guest price before taxes</span>
        <span className="font-semibold text-lg">${listing.basePrice + Math.round(listing.basePrice * 0.10 ) + (listing.cleaningFee || 0)}</span>
      </div>
    </div>

    {/* <div className="flex items-start gap-3 text-gray-500">
      <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm">Places like yours in your area usually range from $50 to $150</p>
    </div> */}
  </div>
);
