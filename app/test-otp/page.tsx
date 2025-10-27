'use client';

import { useState } from 'react';

export default function TestOTPPage() {
  const [phoneNumber, setPhoneNumber] = useState('+97430424433');
  const [method, setMethod] = useState<'sms' | 'email'>('sms');
  const [email, setEmail] = useState('test@example.com');
  const [otpCode, setOtpCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    setLoading(true);
    setResult(null);

    try {
      const endpoint = method === 'email' ? '/api/otp/send-email' : '/api/otp/send-twilio';
      const body = method === 'email'
        ? { email }
        : { phoneNumber, method };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, message: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/otp/verify-twilio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: method === 'email' ? email : phoneNumber,
          code: otpCode,
          method
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, message: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">🧪 OTP Test Page</h1>

        {/* Method Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select OTP Method:
          </label>
          <div className="flex gap-2">
            {(['sms', 'email'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  method === m
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {m === 'sms' ? '📱 SMS' : '📧 Email'}
              </button>
            ))}
          </div>
        </div>

        {/* Phone/Email Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {method === 'email' ? 'Email Address:' : 'Phone Number:'}
          </label>
          {method === 'email' ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="test@example.com"
            />
          ) : (
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+97430424433"
            />
          )}
        </div>

        {/* Send OTP Button */}
        <button
          onClick={sendOTP}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {loading ? 'Sending...' : `Send OTP via ${method.toUpperCase()}`}
        </button>

        {/* OTP Verification */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter OTP Code:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="123456"
              maxLength={6}
            />
            <button
              onClick={verifyOTP}
              disabled={loading || !otpCode}
              className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify
            </button>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className={`p-4 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.success ? '✅ Success' : '❌ Error'}
            </div>
            <div className={`text-sm mt-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.message}
            </div>
            {result.sessionId && (
              <div className="text-xs text-gray-500 mt-2">
                Session ID: {result.sessionId}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">📋 Testing Instructions:</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>SMS Verification:</strong></p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Enter your phone number with country code (e.g., +97430424433)</li>
              <li>Check your phone for the SMS with 6-digit OTP code</li>
              <li>Enter the code to verify</li>
            </ul>
            <p className="mt-2"><strong>Email Verification:</strong></p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Enter your email address</li>
              <li>Check your inbox for the email with 6-digit OTP code</li>
              <li>Enter the code to verify</li>
            </ul>
            <p className="mt-2"><strong>Development Mode:</strong> Use OTP code "123456" when Twilio/SendGrid not configured</p>
          </div>
        </div>

        {/* Environment Info */}
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600">
            <div>Environment: {process.env.NODE_ENV || 'development'}</div>
            <div>Twilio Config: {process.env.TWILIO_ACCOUNT_SID ? '✅ Available' : '❌ Missing'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}