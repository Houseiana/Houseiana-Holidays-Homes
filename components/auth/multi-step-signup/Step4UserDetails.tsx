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
