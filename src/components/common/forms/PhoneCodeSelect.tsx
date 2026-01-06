'use client';

import { useState, useMemo } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { countries, Country } from '@/lib/countries';

interface PhoneCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

// Helper to get emoji flag from country code
function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function PhoneCodeSelect({ value, onChange }: PhoneCodeSelectProps) {
  const [query, setQuery] = useState('');

  // Find selected country object based on the dialCode value
  // Note: This defaults to the first country matching the code (e.g. +1 -> US usually if it's first? actually Canada/US order matters)
  // Since countries list is alphabetical, +1 might hit American Samoa or something first if not careful, 
  // but looking at countries list: 'United States' is usually used for +1 default. 
  // Let's refine the finder to prefer common countries if multiple match? 
  // For now, simple find is acceptable for MVP, but to be robust we might want to let user control consistent selection.
  // Ideally value should be the country Code, not dial code. But we work with constraints.
  
  // We'll manage internal selected country state to keep the flag consistent even if dial codes are same
  // But since props only pass `value` (dialCode), we can't persist "CA" vs "US" across remounts if we rely solely on props.
  // For now, we derive.
  const selectedCountry = useMemo(() => {
    return countries.find(c => c.dialCode === value) || countries[0];
  }, [value]);

  const filteredCountries = query === ''
    ? countries
    : countries.filter((country) =>
        country.name.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, '')) ||
        country.dialCode.includes(query)
      );

  return (
    <div className="w-32 relative">
      <Combobox value={selectedCountry} onChange={(country: Country | null) => {
        if (country) onChange(country.dialCode);
      }}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm border border-gray-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500">
            <div className="flex items-center w-full">
              <span className="pl-3 text-lg flex-shrink-0 select-none">
                {selectedCountry?.code ? getFlagEmoji(selectedCountry.code) : ''}
              </span>
              <Combobox.Input
                className="w-full border-none py-3 pl-2 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 outline-none"
                displayValue={(country: Country) => country?.dialCode}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="+1"
              />
            </div>
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as="div" // Fragment causes issues sometimes, div is safer for now or Fragment if imported
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-[300px] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
              {filteredCountries.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <Combobox.Option
                    key={country.name} // Use name as key to be unique, some codes might repeat? No country codes are unique.
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-4 pr-4 ${
                        active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={country}
                  >
                    {({ selected, active }) => (
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3 truncate">
                            <span className="text-xl">{getFlagEmoji(country.code)}</span>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {country.name}
                            </span>
                         </div>
                         <span className={`text-sm ${active ? 'text-indigo-200' : 'text-gray-500'}`}>
                           {country.dialCode}
                         </span>
                      </div>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}
