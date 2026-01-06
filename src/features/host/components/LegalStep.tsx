import { Switch } from '@headlessui/react';
import { PropertyFormData } from '../types';

interface LegalStepProps {
  listing: PropertyFormData;
  setListing: (listing: PropertyFormData) => void;
}

export const LegalStep = ({ listing, setListing }: LegalStepProps) => (
  <div className="space-y-6">
    <div className="p-6 border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">Use Instant Book</h4>
          <p className="text-gray-500 text-sm mt-1">Let guests book instantly without waiting for approval</p>
        </div>
        <Switch
          checked={listing.instantBook}
          onChange={(checked) => setListing({ ...listing, instantBook: checked })}
          className={`${
            listing.instantBook ? 'bg-gray-900' : 'bg-gray-200'
          } relative inline-flex w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
          style={{
            minHeight: '8px',
          }}
        >
          <span
            aria-hidden="true"
            className={`${
              listing.instantBook ? 'translate-x-7' : 'translate-x-0'
            } pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
          />
        </Switch>
      </div>
    </div>

    <div className="border-t border-gray-200 pt-6">
      <h3 className="font-medium text-gray-900 mb-4">Does your place have any of these?</h3>

      {[
        { key: 'securityCamera', label: 'Security camera(s)', desc: 'Required to disclose and must never monitor indoor private spaces' },
        { key: 'noiseMonitor', label: 'Noise decibel monitor(s)', desc: 'Required to disclose' },
      ].map((item) => (
        <div key={item.key} className="py-4 border-b border-gray-100 last:border-b-0">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-gray-900">{item.label}</h4>
              <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
            </div>
            <Switch
              checked={!!listing[item.key as keyof PropertyFormData]}
              onChange={(checked) => setListing({ ...listing, [item.key]: checked })}
              className={`${
                listing[item.key as keyof PropertyFormData] ? 'bg-gray-900' : 'bg-gray-200'
              } relative inline-flex w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
              style={{
                minHeight: '8px',
              }}
            >
              <span
                aria-hidden="true"
                className={`${
                  listing[item.key as keyof PropertyFormData] ? 'translate-x-7' : 'translate-x-0'
                } pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </div>
        </div>
      ))}
    </div>
  </div>
);
