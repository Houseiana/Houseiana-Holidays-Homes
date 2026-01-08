import { PropertyFormData } from '@/features/host/types';
import { Star } from 'lucide-react';

interface ClassificationStepProps {
  listing: PropertyFormData;
  setListing: (listing: PropertyFormData) => void;
}

export function ClassificationStep({ listing, setListing }: ClassificationStepProps) {
  const options = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Classify your unit</h2>
        <p className="text-gray-500">How would you rate your property?</p>
      </div>

      <div className="space-y-4">
        {options.map((rating) => (
          <label
            key={rating}
            className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
              listing.stars === rating
                ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="stars"
                value={rating}
                checked={listing.stars === rating}
                onChange={() => setListing({ ...listing, stars: rating })}
                className="w-5 h-5 text-teal-600 border-gray-300 focus:ring-teal-500"
              />
              <div className="font-medium text-gray-900">
                <span className="flex gap-0.5 mb-2">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </span>
                {rating} {rating === 1 ? 'Star' : 'Stars'}
              </div>
            </div>
            
          </label>
        ))}
      </div>
    </div>
  );
}
