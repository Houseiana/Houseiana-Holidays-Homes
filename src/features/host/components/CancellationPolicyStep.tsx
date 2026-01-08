import { PropertyFormData } from '@/features/host/types';
import { Shield, ShieldCheck, ShieldAlert, Clock, CalendarDays } from 'lucide-react';

interface CancellationPolicyStepProps {
  listing: PropertyFormData;
  setListing: (listing: PropertyFormData) => void;
}

export function CancellationPolicyStep({ listing, setListing }: CancellationPolicyStepProps) {
  const policies = [
    {
      id: 'FLEXIBLE',
      label: 'Flexible',
      description: 'Guests can cancel until 24 hours before check-in for a full refund.',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      id: 'MODERATE',
      label: 'Moderate',
      description: 'Guests can cancel up to 5 days before check-in for a full refund.',
      icon: ShieldCheck,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-200'
    },
    {
      id: 'FIXED',
      label: 'Fixed',
      description: 'Guests can cancel up to 30 days before check-in for a full refund.',
      icon: ShieldAlert,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
      borderColor: 'border-rose-200'
    }
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Cancellation Policy</h2>
        <p className="text-gray-500">Choose a policy that works for you and your guests.</p>
      </div>

      {/* Main Policy Selection */}
      <div className="grid gap-4">
        {policies.map((policy) => {
          const isSelected = listing.cancellationPolicy?.policyType === policy.id;
          const Icon = policy.icon;

          return (
            <div
              key={policy.id}
              onClick={() => setListing({ ...listing, cancellationPolicy: { ...listing.cancellationPolicy, policyType: policy.id } })}
              className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                  : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${policy.bgColor} ${policy.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{policy.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{policy.description}</p>
                </div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-teal-600' : 'border-gray-300'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conditional Sub-options */}
      <div className="mt-8 space-y-6">
        {listing.cancellationPolicy?.policyType === 'FLEXIBLE' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Please Select Timeframe
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-center justify-between p-4 bg-white border rounded-lg cursor-pointer transition-all ${
                listing.cancellationPolicy.freeCancellationHours === 24
                  ? 'border-teal-500 ring-1 ring-teal-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <span className="font-medium text-gray-700">24 Hours Free Cancellation</span>
                <input
                  type="radio"
                  name="flexibleConfig"
                  checked={listing.cancellationPolicy.freeCancellationHours === 24}
                  onChange={() => setListing({ ...listing, cancellationPolicy: { ...listing.cancellationPolicy!, freeCancellationHours: 24 } })}
                  className="text-teal-600 focus:ring-teal-500"
                />
              </label>

              <label className={`flex items-center justify-between p-4 bg-white border rounded-lg cursor-pointer transition-all ${
                listing.cancellationPolicy.freeCancellationHours === 48
                  ? 'border-teal-500 ring-1 ring-teal-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <span className="font-medium text-gray-700">48 Hours Free Cancellation</span>
                <input
                  type="radio"
                  name="flexibleConfig"
                  checked={listing.cancellationPolicy.freeCancellationHours === 48}
                  onChange={() => setListing({ ...listing, cancellationPolicy: { ...listing.cancellationPolicy!, freeCancellationHours: 48 } })}
                  className="text-teal-600 focus:ring-teal-500"
                />
              </label>
            </div>
          </div>
        )}

        {listing.cancellationPolicy?.policyType === 'MODERATE' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 p-6 bg-gray-50 rounded-xl border border-gray-200">
             <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-600" />
              Custom Moderate Policy
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many days prior arrival is free cancellation?
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={listing.cancellationPolicy.freeCancellationDays || ''}
                  onChange={(e) => setListing({ ...listing, cancellationPolicy: { ...listing.cancellationPolicy!, freeCancellationDays: parseInt(e.target.value) || 0 } })}
                  className="block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder="e.g. 5"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                  Days
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Guests will be able to cancel up to this many days before check-in for a full refund.
              </p>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
