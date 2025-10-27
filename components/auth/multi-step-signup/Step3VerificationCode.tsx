'use client';

import { useState, useRef, useEffect } from 'react';
import { otpService } from '@/lib/otp-service';

interface Step3VerificationCodeProps {
  phoneNumber: string;
  countryCode: string;
  onContinue: (code: string) => void;
  onBack: () => void;
}

export default function Step3VerificationCode({
  phoneNumber,
  countryCode,
  onContinue,
  onBack,
}: Step3VerificationCodeProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otpMethod, setOtpMethod] = useState<'sms' | 'whatsapp' | 'email'>('whatsapp');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [twilioStatus, setTwilioStatus] = useState<any>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus();

    // Check Twilio configuration status
    fetch('/api/otp/status')
      .then(res => res.json())
      .then(status => setTwilioStatus(status))
      .catch(console.error);

    // Send initial OTP
    sendOTP();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Resend OTP when method changes (but not on initial mount)
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    if (!isInitialMount && countdown === 0) {
      sendOTP();
    }
    setIsInitialMount(false);
  }, [otpMethod]);

  const handleChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setCode(newCode.slice(0, 6));

    // Focus the next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Auto-submit if we pasted 6 digits
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const sendOTP = async () => {
    setIsSendingOTP(true);
    setError('');
    setSuccess('');

    try {
      // Force Twilio integration by calling the API directly
      const endpoint = otpMethod === 'email' ? '/api/otp/send-email' : '/api/otp/send-twilio';
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;

      const body = otpMethod === 'email'
        ? { email: fullPhoneNumber } // If using email, pass as email
        : { phoneNumber: fullPhoneNumber, method: otpMethod };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.success) {
        let message = result.message;
        if (result.demoCode) {
          message += ` | Demo Code: ${result.demoCode}`;
        }
        setSuccess(message);
        setCountdown(60); // 60 second cooldown
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerify = async (fullCode: string) => {
    setIsVerifying(true);
    setError('');

    try {
      // Force Twilio verification by calling the API directly
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;

      const response = await fetch('/api/otp/verify-twilio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          code: fullCode,
          method: otpMethod
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          onContinue(fullCode);
        }, 500);
      } else {
        setError(result.message);
        // Clear the code on error
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

  const handleContinue = () => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      handleVerify(fullCode);
    }
  };

  const handleMethodChange = (newMethod: 'sms' | 'whatsapp' | 'email') => {
    if (newMethod !== otpMethod && !isSendingOTP) {
      setCode(['', '', '', '', '', '']); // Clear current code
      setError('');
      setSuccess('');
      setOtpMethod(newMethod);
      // OTP will be sent automatically via useEffect
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
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
            Confirm your number
          </h1>

          <p className="text-gray-600 mb-4">
            Enter the code we sent via {otpMethod === 'whatsapp' ? 'WhatsApp' : otpMethod.toUpperCase()} to {countryCode} {phoneNumber}:
          </p>

          {otpMethod === 'whatsapp' && (
            <div className={`mb-4 p-3 border rounded-lg ${
              twilioStatus?.mode === 'twilio'
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <p className={`text-sm ${
                twilioStatus?.mode === 'twilio' ? 'text-green-700' : 'text-yellow-700'
              }`}>
                💬 <strong>WhatsApp OTP:</strong> {twilioStatus?.mode === 'twilio'
                  ? 'Real Twilio integration active! Check your WhatsApp for the verification code.'
                  : 'Demo mode - using placeholder OTP.'
                }
              </p>

              {twilioStatus && (
                <div className={`text-xs mt-2 ${
                  twilioStatus.mode === 'twilio' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  <div className="flex items-center space-x-4">
                    <span>Twilio: {twilioStatus.twilioConfigured ? '✅' : '❌'}</span>
                    <span>Service: {twilioStatus.serviceConfigured ? '✅' : '❌'}</span>
                    <span>WhatsApp: {twilioStatus.whatsappConfigured ? '✅' : '❌'}</span>
                    <span>Mode: {twilioStatus.sandboxMode ? 'Sandbox' : 'Production'}</span>
                  </div>
                  {twilioStatus.mode === 'demo' && (
                    <div className="mt-1">
                      <strong>Setup Required:</strong> Add your Twilio credentials to .env.local for real messages.
                      <br />
                      <strong>Demo Code:</strong> Use "123456" for testing.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* OTP Method Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you like to receive your code?
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleMethodChange('sms')}
                disabled={isSendingOTP}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  otpMethod === 'sms'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${isSendingOTP ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                📱 SMS
              </button>
              <button
                onClick={() => handleMethodChange('whatsapp')}
                disabled={isSendingOTP}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  otpMethod === 'whatsapp'
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${isSendingOTP ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                💬 WhatsApp
              </button>
              <button
                onClick={() => handleMethodChange('email')}
                disabled={isSendingOTP}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  otpMethod === 'email'
                    ? 'bg-purple-50 border-purple-500 text-purple-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${isSendingOTP ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                📧 Email
              </button>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
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

        {/* Code Input */}
        <div className="mb-6">
          <div className="flex gap-3 justify-center mb-6">
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
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
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
        </div>

        {/* Resend Option */}
        <div className="text-center mb-6">
          <button
            onClick={sendOTP}
            disabled={countdown > 0 || isSendingOTP}
            className={`font-medium underline transition-colors ${
              countdown > 0 || isSendingOTP
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-900 hover:text-gray-700'
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

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={code.join('').length !== 6 || isVerifying}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
            code.join('').length === 6 && !isVerifying
              ? 'bg-gray-900 hover:bg-gray-800'
              : 'bg-gray-200 cursor-not-allowed'
          }`}
        >
          Continue
        </button>

        {/* Help Text */}
        <div className="text-sm text-gray-500 text-center mt-4 space-y-2">
          {twilioStatus?.mode === 'demo' ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 font-medium">🧪 Testing Mode</p>
              <p className="text-blue-600">
                For testing purposes, use code <strong>"123456"</strong> to continue.
                To receive real WhatsApp messages, add your Twilio credentials to .env.local file.
              </p>
            </div>
          ) : (
            <p>
              More information about why we ask for this can be found in our{' '}
              <a href="#" className="underline">
                Privacy Policy
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
