import { PropertyFormData } from '../types';
import { Camera, Check, Calendar, Star } from 'lucide-react';

interface ReviewStepProps {
  listing: PropertyFormData;
}

export const ReviewStep = ({ listing }: ReviewStepProps) => (
  <div className="space-y-8">
    {/* Preview Card */}
    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        {listing.photos.length > 0 ? (
          <img
            src={URL.createObjectURL(listing.photos[0])}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <Camera className="w-12 h-12 text-gray-400" />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{listing.title || 'Your listing title'}</h3>
          <span className="text-sm text-gray-500">New</span>
        </div>
        <p className="text-gray-500 text-sm">{listing.city || 'City'}, {listing.country}</p>
        <p className="font-semibold mt-2">${listing.basePrice} <span className="font-normal text-gray-500">night</span></p>
      </div>
    </div>

    {/* What's next */}
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">What&apos;s next?</h3>
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Confirm a few details and publish</h4>
            <p className="text-gray-500 text-sm">We&apos;ll let you know if you need to verify your identity or register with the local government.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Set up your calendar</h4>
            <p className="text-gray-500 text-sm">Choose which dates your listing is available. It will be visible 24 hours after you publish.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Adjust your settings</h4>
            <p className="text-gray-500 text-sm">Set house rules, select a cancellation policy, choose how guests book, and more.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
