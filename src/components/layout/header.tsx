'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  User,
  Globe,
  LogIn,
  UserPlus,
  Building2,
  HelpCircle,
  ChevronDown,
  CheckCircle,
  X,
  Search
} from 'lucide-react';
import { useAuth, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

const currencies: Currency[] = [
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' }
];

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇶🇦' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' }
];

export function Header() {
  const router = useRouter();
  const { isSignedIn, signOut } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('QAR');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleSignOut = async () => {
    await signOut();
    setIsAccountDropdownOpen(false);
    router.push('/');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">Houseiana</span>
            </Link>

            {/* AI Search Box - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Ask me anything about properties... (AI powered)"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm shadow-sm hover:shadow-md transition-shadow"
                />
              </div>
            </div>

            {/* Right Menu */}
            <div className="flex items-center space-x-2">
              {/* Currency/Language */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className="p-2 rounded-full hover:bg-gray-100 flex items-center space-x-1"
                >
                  <Globe className="w-5 h-5" />
                  <ChevronDown className={`w-4 h-4 transition-transform ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCurrencyDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
                    <div className="px-4 py-2">
                      <h4 className="text-sm font-semibold text-gray-700">Currency</h4>
                      {currencies.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => {
                            setSelectedCurrency(currency.code);
                            setIsCurrencyDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-2 py-2 hover:bg-gray-50 rounded"
                        >
                          <span className="text-sm">{currency.code} - {currency.name}</span>
                          {selectedCurrency === currency.code && <CheckCircle className="w-4 h-4 text-primary-600" />}
                        </button>
                      ))}
                    </div>
                    <hr className="my-2" />
                    <div className="px-4 py-2">
                      <h4 className="text-sm font-semibold text-gray-700">Language</h4>
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => {
                            setSelectedLanguage(language.code);
                            setIsCurrencyDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-2 py-2 hover:bg-gray-50 rounded"
                        >
                          <span className="text-sm">{language.flag} {language.name}</span>
                          {selectedLanguage === language.code && <CheckCircle className="w-4 h-4 text-primary-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Help */}
              <Link href="/help" className="hidden lg:block p-2 rounded-full hover:bg-gray-100">
                <HelpCircle className="w-5 h-5" />
              </Link>

              {/* Become a Host */}
              <Link
                href="/become-host"
                className="hidden lg:block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full"
              >
                Become a Host
              </Link>

              {/* Account Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className="flex items-center space-x-2 border border-gray-300 rounded-full p-2 hover:shadow-md transition-shadow"
                >
                  <Menu className="w-4 h-4" />
                  <User className="w-5 h-5" />
                </button>

                {isAccountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50">
                    {!isSignedIn ? (
                      <>
                        <SignUpButton mode="modal">
                          <button
                            onClick={() => setIsAccountDropdownOpen(false)}
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 font-semibold"
                          >
                            <UserPlus className="w-4 h-4 mr-3" />
                            Sign up
                          </button>
                        </SignUpButton>
                        <SignInButton mode="modal">
                          <button
                            onClick={() => setIsAccountDropdownOpen(false)}
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            <LogIn className="w-4 h-4 mr-3" />
                            Log in
                          </button>
                        </SignInButton>
                        <hr className="my-2" />
                      </>
                    ) : (
                      <>
                        <Link
                          href="/client-dashboard"
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          <User className="w-4 h-4 mr-3" />
                          My Dashboard
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 text-left"
                        >
                          <LogIn className="w-4 h-4 mr-3" />
                          Sign out
                        </button>
                        <hr className="my-2" />
                      </>
                    )}
                    <Link href="/become-host" className="flex items-center px-4 py-2 text-sm hover:bg-gray-50">
                      <Building2 className="w-4 h-4 mr-3" />
                      Houseiana your home
                    </Link>
                    <Link href="/help" className="flex items-center px-4 py-2 text-sm hover:bg-gray-50">
                      <HelpCircle className="w-4 h-4 mr-3" />
                      Help Center
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setIsMobileSidebarOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {!isSignedIn ? (
                <>
                  <SignUpButton mode="modal">
                    <button
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="flex items-center w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      <UserPlus className="w-5 h-5 mr-3" />
                      Sign up
                    </button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <button
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="flex items-center w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <LogIn className="w-5 h-5 mr-3" />
                      Log in
                    </button>
                  </SignInButton>
                </>
              ) : (
                <>
                  <Link
                    href="/client-dashboard"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="flex items-center w-full px-4 py-3 border border-gray-300 rounded-lg mb-3"
                  >
                    <User className="w-5 h-5 mr-3" />
                    My Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileSidebarOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 border border-gray-300 rounded-lg text-left"
                  >
                    <LogIn className="w-5 h-5 mr-3" />
                    Sign out
                  </button>
                </>
              )}

              <hr />

              <Link href="/help" className="flex items-center px-4 py-2 hover:bg-gray-50 rounded">
                <HelpCircle className="w-5 h-5 mr-3" />
                Help Center
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
