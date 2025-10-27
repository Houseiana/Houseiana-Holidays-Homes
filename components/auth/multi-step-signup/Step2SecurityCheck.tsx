'use client';

import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';

interface Step2SecurityCheckProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function Step2SecurityCheck({ onContinue, onBack }: Step2SecurityCheckProps) {
  const [captchaCode, setCaptchaCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Generate random captcha code
  useEffect(() => {
    const randomCode = Math.random().toString(36).substring(2, 18).toUpperCase();
    setCaptchaCode(randomCode);
  }, []);

  const handleStartVerification = () => {
    setIsVerifying(true);

    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      setShowSuccess(true);

      // Auto-continue after showing success
      setTimeout(() => {
        onContinue();
      }, 1500);
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-6 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-[#FF385C] rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">You're all set!</h2>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-6 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto border-4 border-[#FF385C] rounded-full flex items-center justify-center relative">
              <svg className="w-16 h-16 text-[#FF385C]" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <div className="absolute inset-0 border-4 border-t-[#FF385C] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Let's do a quick security check
          </h2>
          <p className="text-gray-600">
            Complete a short puzzle so we know you're not a robot. This helps us keep your account secure.
          </p>
        </div>
      </div>
    );
  }

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
        </div>

        {/* Security Check Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-[#FFF0F5] rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-[#FF385C]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Security check
          </h1>

          <p className="text-gray-600 mb-8 max-w-sm mx-auto">
            Complete a short puzzle so we know you're not a robot. This helps us keep your account secure.
          </p>

          {/* Captcha Display */}
          <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500 font-mono tracking-wider">
                {captchaCode}
              </span>
              <button className="text-gray-600 hover:text-gray-900">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartVerification}
            className="w-full py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Start now
          </button>

          {/* Captcha ID */}
          <p className="text-xs text-gray-400 mt-4 font-mono">
            {captchaCode.substring(0, 12)}
          </p>

          {/* Audio Option */}
          <button className="mt-4 text-sm text-gray-900 underline hover:text-gray-700 flex items-center justify-center gap-2 mx-auto">
            <Volume2 className="w-4 h-4" />
            Switch to audio
          </button>
        </div>
      </div>
    </div>
  );
}
