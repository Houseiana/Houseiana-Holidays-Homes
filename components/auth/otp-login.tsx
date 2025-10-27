'use client';

import { useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { otpService } from '@/lib/otp-service';
import { ChevronLeft } from 'lucide-react';

interface OTPLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function OTPLogin({ onBack, onSuccess }: OTPLoginProps) {
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+974');
  const [email, setEmail] = useState('');
  const [otpMethod, setOtpMethod] = useState<'sms' | 'whatsapp' | 'email'>('sms');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOTP = async () => {
    setIsSendingOTP(true);
    setError('');
    setSuccess('');

    try {
      const result = await otpService.sendOTP({
        phoneNumber,
        countryCode,
        method: otpMethod,
        email: otpMethod === 'email' ? email : undefined
      });

      if (result.success) {
        setSuccess(result.message);
        setCountdown(60);
        setStep('verify');
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const verifyOTP = async (fullCode: string) => {
    setIsVerifying(true);
    setError('');

    try {
      const result = await otpService.verifyOTP({
        phoneNumber,
        countryCode,
        code: fullCode,
        method: otpMethod,
        email: otpMethod === 'email' ? email : undefined
      });

      if (result.success) {
        setSuccess(result.message);

        // Login with OTP verification
        const signInResult = await signIn('credentials', {
          phoneNumber: `${countryCode}${phoneNumber}`,
          email: otpMethod === 'email' ? email : undefined,
          otpVerified: 'true',
          method: 'otp',
          redirect: false,
        });

        if (signInResult?.ok) {
          onSuccess();
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        setError(result.message);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Failed to verify OTP. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\\d\\s()-]/g, '');
    setPhoneNumber(value);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        verifyOTP(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'phone') {
      if (otpMethod === 'email' && !email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      if (otpMethod !== 'email' && !phoneNumber.trim()) {
        setError('Please enter your phone number.');
        return;
      }
      sendOTP();
    } else {
      const fullCode = code.join('');
      if (fullCode.length === 6) {
        verifyOTP(fullCode);
      }
    }
  };

  if (step === 'phone') {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to login options
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Login with OTP
        </h2>
        <p className="text-gray-600 mb-6">
          We'll send you a one-time verification code
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OTP Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              How would you like to receive your code?
            </label>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setOtpMethod('sms')}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  otpMethod === 'sms'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                📱 SMS
              </button>
              <button
                type="button"
                onClick={() => setOtpMethod('whatsapp')}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  otpMethod === 'whatsapp'
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                💬 WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setOtpMethod('email')}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  otpMethod === 'email'
                    ? 'bg-purple-50 border-purple-500 text-purple-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                📧 Email
              </button>
            </div>
          </div>

          {otpMethod === 'email' ? (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          ) : (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                Phone number
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="+974">🇶🇦 +974</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+966">🇸🇦 +966</option>
                  <option value="+965">🇰🇼 +965</option>
                  <option value="+973">🇧🇭 +973</option>
                  <option value="+968">🇴🇲 +968</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                </select>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="(650) 213-7552"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSendingOTP}
            className="w-full bg-[#FF385C] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#E31C5F] focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingOTP ? 'Sending...' : 'Send verification code'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => setStep('phone')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Change number
      </button>

      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Enter verification code
      </h2>
      <p className="text-gray-600 mb-6">
        Enter the code we sent via {otpMethod.toUpperCase()} to{' '}
        {otpMethod === 'email' ? email : `${countryCode} ${phoneNumber}`}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-3 justify-center">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              disabled={isVerifying}
            />
          ))}
        </div>

        {isVerifying && (
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
            <span className="text-sm">Verifying...</span>
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={sendOTP}
            disabled={countdown > 0 || isSendingOTP}
            className={`font-medium underline transition-colors ${
              countdown > 0 || isSendingOTP
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-[#FF385C] hover:text-[#E31C5F]'
            }`}
          >
            {isSendingOTP
              ? 'Sending...'
              : countdown > 0
              ? `Resend code in ${countdown}s`
              : 'Resend code'
            }
          </button>
        </div>

        <button
          type="submit"
          disabled={code.join('').length !== 6 || isVerifying}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
            code.join('').length === 6 && !isVerifying
              ? 'bg-[#FF385C] hover:bg-[#E31C5F]'
              : 'bg-gray-200 cursor-not-allowed'
          }`}
        >
          {isVerifying ? 'Verifying...' : 'Verify and Login'}
        </button>
      </form>
    </div>
  );
}