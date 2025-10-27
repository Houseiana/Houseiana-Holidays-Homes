'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

interface Step1PhoneNumberProps {
  onContinue: (countryCode: string, phoneNumber: string) => void;
  onBack?: () => void;
}

const countryCodes = [
  // Middle East (Primary regions for Houseiana)
  { code: '+974', country: 'Qatar', flag: '🇶🇦', region: 'Middle East' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', region: 'Middle East' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', region: 'Middle East' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', region: 'Middle East' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴', region: 'Middle East' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧', region: 'Middle East' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', region: 'Middle East & Africa' },

  // North America
  { code: '+1', country: 'United States', flag: '🇺🇸', region: 'North America' },
  { code: '+1', country: 'Canada', flag: '🇨🇦', region: 'North America' },

  // Europe
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  { code: '+33', country: 'France', flag: '🇫🇷', region: 'Europe' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', region: 'Europe' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', region: 'Europe' },
  { code: '+34', country: 'Spain', flag: '🇪🇸', region: 'Europe' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', region: 'Europe' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', region: 'Europe' },

  // Asia
  { code: '+91', country: 'India', flag: '🇮🇳', region: 'Asia' },
  { code: '+86', country: 'China', flag: '🇨🇳', region: 'Asia' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', region: 'Asia' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', region: 'Asia' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', region: 'Asia' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', region: 'Asia' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', region: 'Asia' },

  // Africa
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', region: 'Africa' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', region: 'Africa' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', region: 'Africa' },

  // Oceania
  { code: '+61', country: 'Australia', flag: '🇦🇺', region: 'Oceania' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', region: 'Oceania' },
];

export default function Step1PhoneNumber({ onContinue, onBack }: Step1PhoneNumberProps) {
  const [countryCode, setCountryCode] = useState('+974'); // Default to Qatar
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Auto-detect user location based on browser geolocation
  useEffect(() => {
    const detectLocation = async () => {
      try {
        setIsDetectingLocation(true);

        // Try to get user's approximate location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: false
          });
        });

        // Basic location to country code mapping (simplified)
        const { latitude, longitude } = position.coords;

        // Qatar region detection
        if (latitude >= 24.4 && latitude <= 26.2 && longitude >= 50.7 && longitude <= 51.7) {
          setCountryCode('+974');
        }
        // UAE region detection
        else if (latitude >= 22.6 && latitude <= 26.1 && longitude >= 51.0 && longitude <= 56.4) {
          setCountryCode('+971');
        }
        // Saudi Arabia region detection
        else if (latitude >= 16.0 && latitude <= 32.2 && longitude >= 34.5 && longitude <= 55.7) {
          setCountryCode('+966');
        }
        // Kuwait region detection
        else if (latitude >= 28.5 && latitude <= 30.1 && longitude >= 46.5 && longitude <= 48.5) {
          setCountryCode('+965');
        }
        // Bahrain region detection
        else if (latitude >= 25.5 && latitude <= 26.3 && longitude >= 50.3 && longitude <= 50.8) {
          setCountryCode('+973');
        }
        // Oman region detection
        else if (latitude >= 16.0 && latitude <= 26.4 && longitude >= 51.8 && longitude <= 59.8) {
          setCountryCode('+968');
        }
        // Default to Qatar if in Middle East region but not specifically detected
        else if (latitude >= 12.0 && latitude <= 42.0 && longitude >= 25.0 && longitude <= 63.0) {
          setCountryCode('+974');
        }
      } catch (error) {
        // Keep default Qatar if geolocation fails
        console.log('Location detection not available, using default country code');
      } finally {
        setIsDetectingLocation(false);
      }
    };

    // Only attempt location detection if geolocation is available
    if (navigator.geolocation) {
      detectLocation();
    }
  }, []);

  const handleContinue = () => {
    if (phoneNumber.trim()) {
      onContinue(countryCode, phoneNumber);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and basic formatting
    const value = e.target.value.replace(/[^\d\s()-]/g, '');
    setPhoneNumber(value);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2 leading-tight">
            Welcome to Houseiana
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            One account for everything - travel as a guest or host your property!
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 sm:space-y-5">
          {/* Country Code Selector */}
          <div className="relative">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Country code {isDetectingLocation && (
                <span className="inline-flex items-center text-blue-600 ml-2">
                  <MapPin className="w-3 h-3 mr-1 animate-pulse" />
                  <span className="text-xs">Detecting location...</span>
                </span>
              )}
            </label>
            <button
              type="button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className={`w-full px-3 sm:px-4 py-3 sm:py-4 border rounded-lg text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all ${
                isDetectingLocation
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-900 focus:border-gray-900'
              }`}
            >
              <span className="text-gray-900 text-sm sm:text-base truncate flex items-center">
                <span className="mr-3 text-lg">{countryCodes.find(c => c.code === countryCode)?.flag}</span>
                <div>
                  <div className="font-medium">{countryCodes.find(c => c.code === countryCode)?.country}</div>
                  <div className="text-xs text-gray-500">{countryCodes.find(c => c.code === countryCode)?.region}</div>
                </div>
                <span className="ml-2 font-mono text-blue-600">{countryCode}</span>
              </span>
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
            </button>

            {/* Country Dropdown */}
            {showCountryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 sm:max-h-96 overflow-y-auto z-10">
                {/* Group countries by region for better location detection */}
                {['Middle East', 'Middle East & Africa', 'North America', 'Europe', 'Asia', 'Africa', 'Oceania'].map((region) => {
                  const regionCountries = countryCodes.filter(country => country.region === region);
                  if (regionCountries.length === 0) return null;

                  return (
                    <div key={region}>
                      <div className="px-3 sm:px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        {region}
                      </div>
                      {regionCountries.map((country, index) => (
                        <button
                          key={`${country.code}-${country.country}-${index}`}
                          type="button"
                          onClick={() => {
                            setCountryCode(country.code);
                            setShowCountryDropdown(false);
                          }}
                          className="w-full px-3 sm:px-4 py-3 text-left hover:bg-blue-50 active:bg-blue-100 flex justify-between items-center transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-gray-900 text-sm sm:text-base flex items-center">
                            <span className="mr-3 text-lg">{country.flag}</span>
                            <span className="font-medium">{country.country}</span>
                          </span>
                          <span className="text-blue-600 text-sm sm:text-base font-mono">{country.code}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Phone number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="(650) 213-7552"
              className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200 text-gray-900 text-sm sm:text-base transition-all"
            />
          </div>

          {/* Privacy Policy Notice */}
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            We'll call or text you to confirm your number. Standard message and data rates apply.{' '}
            <a href="#" className="font-semibold underline hover:text-gray-800 transition-colors">
              Privacy Policy
            </a>
          </p>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!phoneNumber.trim()}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
              phoneNumber.trim()
                ? 'bg-[#FF385C] hover:bg-[#E31C5F]'
                : 'bg-gray-200 cursor-not-allowed'
            }`}
          >
            Continue
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:border-gray-900 transition-colors flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium text-gray-900">Continue with Google</span>
            </button>

            <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:border-gray-900 transition-colors flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              <span className="font-medium text-gray-900">Continue with Facebook</span>
            </button>

            <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:border-gray-900 transition-colors flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="font-medium text-gray-900">Continue with Apple</span>
            </button>

            <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:border-gray-900 transition-colors flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-medium text-gray-900">Continue with email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
