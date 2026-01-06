import React, { useState, useEffect } from 'react';
import { countries } from '@/lib/constants/countries';
import { ChevronDown } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Phone number',
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState('+974'); // Default to Qatar
  const [phoneNumber, setPhoneNumber] = useState('');

  // Initialize state from prop value
  useEffect(() => {
    // Only run this if the combined value is different from what we expect
    const currentCombined = `${selectedCountryCode}${phoneNumber}`;
    if (value && value !== currentCombined) {
       // Try to find a longest matching country code to avoid prefix issues (e.g. +1 vs +1-242)
       // Sort countries by dialCode length descending
       const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
       const matchingCountry = sortedCountries.find(c => value.startsWith(c.dialCode));
       
       if (matchingCountry) {
         setSelectedCountryCode(matchingCountry.dialCode);
         setPhoneNumber(value.slice(matchingCountry.dialCode.length));
       } else {
         // Fallback just in case
         setPhoneNumber(value);
       }
    } else if (!value) {
        setPhoneNumber('');
    }
  }, [value]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setSelectedCountryCode(newCode);
    onChange(`${newCode}${phoneNumber}`);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers
    const val = e.target.value.replace(/\D/g, '');
    // limit to 15 digits (standard E.164 max length is 15, allowing a bit of buffer if needed, but 15 is safe)
    if (val.length > 15) return;
    
    setPhoneNumber(val);
    onChange(`${selectedCountryCode}${val}`);
  };

  return (
    <div className={`flex ${className}`}>
      <div className="relative">
        <select
          value={selectedCountryCode}
          onChange={handleCountryChange}
          className="appearance-none w-[120px] h-16 px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm pr-8"
        >
          {countries.map((country) => (
            <option key={country.code} value={country.dialCode}>
              {country.code} ({country.dialCode})
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      <input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        maxLength={10}
        className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
      />
    </div>
  );
};
