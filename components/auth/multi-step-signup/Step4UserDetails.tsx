'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Step4UserDetailsProps {
  onContinue: (data: {
    firstName: string;
    lastName: string;
    birthMonth: string;
    birthDay: string;
    birthYear: string;
    email: string;
    password: string;
  }) => void;
  onBack: () => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());

export default function Step4UserDetails({ onContinue, onBack }: Step4UserDetailsProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validate = () => {
    const newErrors: {[key: string]: string} = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!birthMonth) newErrors.birthMonth = 'Birth month is required';
    if (!birthDay) newErrors.birthDay = 'Birth day is required';
    if (!birthYear) newErrors.birthYear = 'Birth year is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onContinue({
        firstName,
        lastName,
        birthMonth,
        birthDay,
        birthYear,
        email,
        password,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-md mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Finish signing up
          </h1>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Legal Name Section */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">Legal name</h2>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="First name on ID"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-gray-900 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Last name on ID"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-gray-900 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-2">
              Make sure this matches the name on your government ID. If you go by another name, you can add a{' '}
              <a href="#" className="font-semibold underline">
                preferred first name
              </a>
              .
            </p>
          </div>

          {/* Date of Birth Section */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-semibold text-gray-900">Date of birth</h2>
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:border-gray-900 appearance-none ${
                    errors.birthMonth ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Month</option>
                  {months.map((month, index) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:border-gray-900 appearance-none ${
                    errors.birthDay ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Day</option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:border-gray-900 appearance-none ${
                    errors.birthYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(errors.birthMonth || errors.birthDay || errors.birthYear) && (
              <p className="text-red-500 text-sm mt-1">Please select your complete date of birth</p>
            )}
          </div>

          {/* Contact Info Section */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">Contact info</h2>
            <div className="space-y-3">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-gray-900 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-gray-900 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-2">
              We'll email you trip confirmations and receipts.
            </p>
          </div>

          {/* Terms and Conditions */}
          <div className="text-xs text-gray-600 leading-relaxed">
            By selecting <span className="font-semibold">Agree and continue</span>, I agree to Houseiana's{' '}
            <a href="#" className="text-blue-600 underline">
              Terms of Service
            </a>
            ,{' '}
            <a href="#" className="text-blue-600 underline">
              Payments Terms of Service
            </a>
            , and{' '}
            <a href="#" className="text-blue-600 underline">
              Nondiscrimination Policy
            </a>{' '}
            and acknowledge the{' '}
            <a href="#" className="text-blue-600 underline">
              Privacy Policy
            </a>
            .
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-lg font-semibold transition-colors"
          >
            Agree and continue
          </button>
        </div>
      </div>
    </div>
  );
}
