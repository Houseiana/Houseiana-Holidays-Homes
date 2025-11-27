'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Globe, Menu, ChevronLeft, Languages, DollarSign, Clock, MapPin, Calendar, Check } from 'lucide-react';

export default function PreferencesPage() {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const user = {
    name: 'Mohamed',
    avatar: 'M',
    email: 'mohamed@gmail.com',
  };

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: 'en-US',
    currency: 'USD',
    timezone: 'Asia/Qatar',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    distanceUnit: 'km',
  });

  // Options data
  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'ar-QA', name: 'العربية (قطر)', flag: '🇶🇦' },
    { code: 'ar-AE', name: 'العربية (الإمارات)', flag: '🇦🇪' },
    { code: 'ar-SA', name: 'العربية (السعودية)', flag: '🇸🇦' },
    { code: 'fr-FR', name: 'Français (France)', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch (Deutschland)', flag: '🇩🇪' },
    { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' },
    { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
    { code: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
    { code: 'tr-TR', name: 'Türkçe', flag: '🇹🇷' },
  ];

  const currencies = [
    { code: 'USD', name: 'United States Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب' },
    { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  ];

  const timezones = [
    { code: 'Asia/Qatar', name: 'Qatar (GMT+3)', city: 'Doha' },
    { code: 'Asia/Dubai', name: 'UAE (GMT+4)', city: 'Dubai' },
    { code: 'Asia/Riyadh', name: 'Saudi Arabia (GMT+3)', city: 'Riyadh' },
    { code: 'Asia/Kuwait', name: 'Kuwait (GMT+3)', city: 'Kuwait City' },
    { code: 'Asia/Bahrain', name: 'Bahrain (GMT+3)', city: 'Manama' },
    { code: 'Europe/London', name: 'United Kingdom (GMT+0/+1)', city: 'London' },
    { code: 'Europe/Paris', name: 'Central Europe (GMT+1/+2)', city: 'Paris' },
    { code: 'America/New_York', name: 'Eastern Time (GMT-5/-4)', city: 'New York' },
    { code: 'America/Los_Angeles', name: 'Pacific Time (GMT-8/-7)', city: 'Los Angeles' },
    { code: 'America/Chicago', name: 'Central Time (GMT-6/-5)', city: 'Chicago' },
    { code: 'Asia/Tokyo', name: 'Japan (GMT+9)', city: 'Tokyo' },
    { code: 'Asia/Singapore', name: 'Singapore (GMT+8)', city: 'Singapore' },
    { code: 'Asia/Hong_Kong', name: 'Hong Kong (GMT+8)', city: 'Hong Kong' },
    { code: 'Australia/Sydney', name: 'Australia Eastern (GMT+10/+11)', city: 'Sydney' },
    { code: 'Asia/Kolkata', name: 'India (GMT+5:30)', city: 'Mumbai' },
  ];

  const dateFormats = [
    { code: 'MM/DD/YYYY', example: '12/25/2024' },
    { code: 'DD/MM/YYYY', example: '25/12/2024' },
    { code: 'YYYY-MM-DD', example: '2024-12-25' },
    { code: 'DD.MM.YYYY', example: '25.12.2024' },
    { code: 'DD-MM-YYYY', example: '25-12-2024' },
  ];

  const timeFormats = [
    { code: '12h', example: '2:30 PM' },
    { code: '24h', example: '14:30' },
  ];

  const distanceUnits = [
    { code: 'km', name: 'Kilometers' },
    { code: 'mi', name: 'Miles' },
  ];

  const getLanguageName = (code: string) => languages.find(l => l.code === code)?.name || code;
  const getLanguageFlag = (code: string) => languages.find(l => l.code === code)?.flag || '🌐';
  const getCurrencyName = (code: string) => currencies.find(c => c.code === code)?.name || code;
  const getCurrencySymbol = (code: string) => currencies.find(c => c.code === code)?.symbol || code;
  const getTimezoneName = (code: string) => timezones.find(t => t.code === code)?.name || code;
  const getDateFormatExample = (code: string) => dateFormats.find(d => d.code === code)?.example || code;
  const getTimeFormatExample = (code: string) => timeFormats.find(t => t.code === code)?.example || code;
  const getDistanceUnitName = (code: string) => distanceUnits.find(d => d.code === code)?.name || code;

  const handleSave = (field: string, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setEditingField(null);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  interface PreferenceOption {
    code: string;
    name?: string;
    flag?: string;
    symbol?: string;
    city?: string;
    example?: string;
  }

  const PreferenceRow = ({
    icon: Icon,
    title,
    description,
    field,
    currentValue,
    displayValue,
    options,
    renderOption
  }: {
    icon: any;
    title: string;
    description?: string;
    field: string;
    currentValue: string;
    displayValue: string;
    options: PreferenceOption[];
    renderOption: (opt: PreferenceOption) => React.ReactNode;
  }) => (
    <div className="py-6 border-b border-gray-200 last:border-b-0">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 font-medium">{title}</h3>
            {editingField !== field && (
              <p className="text-gray-500 mt-1">{displayValue}</p>
            )}
            {description && editingField !== field && (
              <p className="text-gray-400 text-sm mt-1">{description}</p>
            )}
          </div>
        </div>
        {editingField !== field && (
          <button
            onClick={() => setEditingField(field)}
            className="text-sm font-semibold text-gray-900 underline hover:text-gray-600"
          >
            Edit
          </button>
        )}
      </div>

      {editingField === field && (
        <div className="mt-4 ml-14">
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {options.map((option) => (
              <button
                key={option.code}
                onClick={() => handleSave(field, option.code)}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                  currentValue === option.code ? 'bg-gray-50' : ''
                }`}
              >
                <span className="text-gray-900">{renderOption(option)}</span>
                {currentValue === option.code && (
                  <Check className="w-5 h-5 text-teal-500" />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={handleCancel}
            className="mt-3 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">houseiana</span>
            </Link>

            <div className="flex items-center gap-2">
              <button className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-3 rounded-full transition-colors">
                List your home
              </button>
              <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                <Globe className="w-5 h-5" />
              </button>

              <div className="relative">
                <button className="flex items-center gap-3 border border-gray-300 rounded-full p-1 pl-3 hover:shadow-md transition-shadow">
                  <Menu className="w-4 h-4 text-gray-600" />
                  <div className="bg-teal-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{user.avatar}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/client-dashboard?tab=account" className="text-gray-500 hover:text-gray-900 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Account
          </Link>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Global preferences</h1>
        <p className="text-gray-500 mb-8">Set your default language, currency, and timezone.</p>

        {/* Language & Region Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Language and region</h2>

          <div className="border-t border-gray-200">
            <PreferenceRow
              icon={Languages}
              title="Preferred language"
              description="This will be the language you see across Houseiana and in emails"
              field="language"
              currentValue={preferences.language}
              displayValue={`${getLanguageFlag(preferences.language)} ${getLanguageName(preferences.language)}`}
              options={languages}
              renderOption={(opt) => (
                <span className="flex items-center gap-3">
                  <span className="text-xl">{opt.flag}</span>
                  <span>{opt.name}</span>
                </span>
              )}
            />

            <PreferenceRow
              icon={DollarSign}
              title="Preferred currency"
              description="Prices will be displayed in your preferred currency"
              field="currency"
              currentValue={preferences.currency}
              displayValue={`${getCurrencySymbol(preferences.currency)} ${getCurrencyName(preferences.currency)} (${preferences.currency})`}
              options={currencies}
              renderOption={(opt) => (
                <span className="flex items-center gap-3">
                  <span className="font-medium w-8">{opt.symbol}</span>
                  <span>{opt.name}</span>
                  <span className="text-gray-400">({opt.code})</span>
                </span>
              )}
            />

            <PreferenceRow
              icon={Clock}
              title="Timezone"
              description="Used for check-in/check-out times and notifications"
              field="timezone"
              currentValue={preferences.timezone}
              displayValue={getTimezoneName(preferences.timezone)}
              options={timezones}
              renderOption={(opt) => (
                <span className="flex items-center justify-between w-full">
                  <span>{opt.name}</span>
                  <span className="text-gray-400 text-sm">{opt.city}</span>
                </span>
              )}
            />
          </div>
        </section>

        {/* Date & Time Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Date and time</h2>

          <div className="border-t border-gray-200">
            <PreferenceRow
              icon={Calendar}
              title="Date format"
              description="How dates are displayed throughout Houseiana"
              field="dateFormat"
              currentValue={preferences.dateFormat}
              displayValue={`${preferences.dateFormat} (e.g., ${getDateFormatExample(preferences.dateFormat)})`}
              options={dateFormats}
              renderOption={(opt) => (
                <span className="flex items-center justify-between w-full">
                  <span>{opt.code}</span>
                  <span className="text-gray-400">{opt.example}</span>
                </span>
              )}
            />

            <PreferenceRow
              icon={Clock}
              title="Time format"
              description="12-hour or 24-hour clock"
              field="timeFormat"
              currentValue={preferences.timeFormat}
              displayValue={`${preferences.timeFormat === '12h' ? '12-hour' : '24-hour'} (e.g., ${getTimeFormatExample(preferences.timeFormat)})`}
              options={timeFormats}
              renderOption={(opt) => (
                <span className="flex items-center justify-between w-full">
                  <span>{opt.code === '12h' ? '12-hour' : '24-hour'}</span>
                  <span className="text-gray-400">{opt.example}</span>
                </span>
              )}
            />
          </div>
        </section>

        {/* Measurements Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Measurements</h2>

          <div className="border-t border-gray-200">
            <PreferenceRow
              icon={MapPin}
              title="Distance units"
              description="How distances are displayed for properties"
              field="distanceUnit"
              currentValue={preferences.distanceUnit}
              displayValue={getDistanceUnitName(preferences.distanceUnit)}
              options={distanceUnits}
              renderOption={(opt) => opt.name || ''}
            />
          </div>
        </section>

        {/* Info Box */}
        <div className="p-6 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About your preferences</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                These preferences apply to your account across all devices. You can also temporarily change language and currency using the globe icon in the footer without affecting your saved preferences.
              </p>
              <p className="text-sm text-gray-500">
                Note: Some listings may display prices in the host&apos;s local currency during checkout.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mt-8 p-4 border border-gray-200 rounded-xl">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick access</h4>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 flex items-center gap-2 transition-colors">
              <span className="text-base">{getLanguageFlag(preferences.language)}</span>
              {getLanguageName(preferences.language).split(' ')[0]}
            </button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 flex items-center gap-2 transition-colors">
              {getCurrencySymbol(preferences.currency)} {preferences.currency}
            </button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 flex items-center gap-2 transition-colors">
              <Clock className="w-4 h-4" />
              {timezones.find(t => t.code === preferences.timezone)?.city}
            </button>
          </div>
        </div>
      </main>

      {/* Saved Toast */}
      {showSavedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Preferences saved</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>© 2024 Houseiana, Inc.</span>
              <span>·</span>
              <Link href="#" className="hover:underline">Privacy</Link>
              <span>·</span>
              <Link href="#" className="hover:underline">Terms</Link>
            </div>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-sm font-medium hover:underline">
                <Globe className="w-4 h-4" />
                {getLanguageName(preferences.language).split(' ')[0]}
              </button>
              <span className="text-sm font-medium">{getCurrencySymbol(preferences.currency)} {preferences.currency}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
