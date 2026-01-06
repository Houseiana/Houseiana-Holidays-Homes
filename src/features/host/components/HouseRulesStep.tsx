import { PropertyFormData } from '../types';
import { PawPrint, Cigarette, PartyPopper } from 'lucide-react';

interface HouseRulesStepProps {
  listing: PropertyFormData;
  setListing: (listing: PropertyFormData) => void;
}

export const HouseRulesStep = ({ listing, setListing }: HouseRulesStepProps) => (
  <div className="space-y-6">
    <div className="space-y-4">
      {[
        { key: 'allowPets', icon: PawPrint, label: 'Pets allowed' },
        { key: 'allowSmoking', icon: Cigarette, label: 'Smoking, vaping, e-cigarettes allowed' },
        { key: 'allowParties', icon: PartyPopper, label: 'Events allowed' },
      ].map((rule) => (
        <div key={rule.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3">
            <rule.icon className="w-6 h-6 text-gray-600" />
            <span className="text-gray-900">{rule.label}</span>
          </div>
          <button
            onClick={() => setListing({ ...listing, [rule.key]: !listing[rule.key as keyof PropertyFormData] })}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              listing[rule.key as keyof PropertyFormData] ? 'bg-gray-900' : 'bg-gray-300'
            }`}
            style={{
              minHeight: '8px',
            }}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
              listing[rule.key as keyof PropertyFormData] ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      ))}
    </div>

    <div className="border-t border-gray-200 pt-6">
      <h3 className="font-medium text-gray-900 mb-4">Check-in and checkout times</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-500 mb-2">Check-in after</label>
          <select
            value={listing.checkInTime}
            onChange={(e) => setListing({ ...listing, checkInTime: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
          >
            {['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
            <option value="Flexible">Flexible</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-2">Checkout before</label>
          <select
            value={listing.checkOutTime}
            onChange={(e) => setListing({ ...listing, checkOutTime: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
          >
            {['10:00 AM', '11:00 AM', '12:00 PM'].map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
            <option value="Flexible">Flexible</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);
