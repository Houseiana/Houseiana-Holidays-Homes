'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Mail, MessageSquare, Phone } from 'lucide-react';

type VerificationChannel = 'sms' | 'whatsapp' | 'email';

interface OTPVerificationProps {
  recipient: string; // Phone number or email
  onVerified: () => void;
  onCancel?: () => void;
}

export default function OTPVerification({ recipient, onVerified, onCancel }: OTPVerificationProps) {
  const [channel, setChannel] = useState<VerificationChannel>('sms');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start countdown when OTP is sent
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    setIsSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, channel }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Verification code sent via ${channel}!`);
        setCountdown(60); // 60 second cooldown
        // Focus first input
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError('Network error. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits entered
    if (newOtp.every(digit => digit) && index === 5) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);

    // Focus last filled input or first empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Auto-verify if complete
    if (pastedData.length === 6) {
      handleVerifyOTP(pastedData);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, code, channel }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setSuccess('Verification successful!');
        setTimeout(() => onVerified(), 500);
      } else {
        setError(data.error || 'Invalid code');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const channelOptions = [
    { value: 'sms', label: 'SMS', icon: Phone, description: 'Text message' },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, description: 'WhatsApp message' },
    { value: 'email', label: 'Email', icon: Mail, description: 'Email verification' },
  ] as const;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
        <p className="text-gray-600">
          {recipient.includes('@') ? 'Email: ' : 'Phone: '}
          <span className="font-semibold">{recipient}</span>
        </p>
      </div>

      {/* Channel Selection */}
      {!success && countdown === 0 && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Choose verification method:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {channelOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setChannel(option.value)}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    channel === option.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-xs font-semibold">{option.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Send OTP Button */}
      {countdown === 0 && !success && (
        <button
          onClick={handleSendOTP}
          disabled={isSending}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSending && <Loader2 className="w-5 h-5 animate-spin" />}
          {isSending ? 'Sending...' : `Send Code via ${channelOptions.find(o => o.value === channel)?.label}`}
        </button>
      )}

      {/* OTP Input */}
      {countdown > 0 && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
              Enter 6-digit code
            </label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Resend Button */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleSendOTP}
              disabled={countdown > 0 || isSending}
              className="text-indigo-600 font-semibold hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
          </div>
        </>
      )}

      {/* Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
          {success}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Verifying...</span>
        </div>
      )}

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-4 w-full py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
