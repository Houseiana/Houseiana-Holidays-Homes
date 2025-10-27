'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Mail, ArrowLeft, Check, Eye, EyeOff, Upload, Shield, AlertCircle, ChevronDown } from 'lucide-react';

type SignupMethod = 'phone' | 'email' | 'social';
type SignupStep = 'method' | 'input' | 'confirm' | 'password' | 'otp' | 'kyc' | 'social-redirect';

// Country codes data
const countryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
  { code: '+7', country: 'RU', flag: '🇷🇺', name: 'Russia' },
  { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', country: 'MX', flag: '🇲🇽', name: 'Mexico' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
  { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
  { code: '+31', country: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+46', country: 'SE', flag: '🇸🇪', name: 'Sweden' },
  { code: '+47', country: 'NO', flag: '🇳🇴', name: 'Norway' },
  { code: '+45', country: 'DK', flag: '🇩🇰', name: 'Denmark' },
  { code: '+41', country: 'CH', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+43', country: 'AT', flag: '🇦🇹', name: 'Austria' },
  { code: '+32', country: 'BE', flag: '🇧🇪', name: 'Belgium' },
  { code: '+48', country: 'PL', flag: '🇵🇱', name: 'Poland' },
  { code: '+420', country: 'CZ', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+36', country: 'HU', flag: '🇭🇺', name: 'Hungary' },
  { code: '+351', country: 'PT', flag: '🇵🇹', name: 'Portugal' },
  { code: '+30', country: 'GR', flag: '🇬🇷', name: 'Greece' },
  { code: '+90', country: 'TR', flag: '🇹🇷', name: 'Turkey' },
  { code: '+972', country: 'IL', flag: '🇮🇱', name: 'Israel' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+974', country: 'QA', flag: '🇶🇦', name: 'Qatar' },
  { code: '+965', country: 'KW', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+973', country: 'BH', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+968', country: 'OM', flag: '🇴🇲', name: 'Oman' },
  { code: '+20', country: 'EG', flag: '🇪🇬', name: 'Egypt' },
  { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+254', country: 'KE', flag: '🇰🇪', name: 'Kenya' },
  { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', country: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+66', country: 'TH', flag: '🇹🇭', name: 'Thailand' },
  { code: '+84', country: 'VN', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+63', country: 'PH', flag: '🇵🇭', name: 'Philippines' },
  { code: '+62', country: 'ID', flag: '🇮🇩', name: 'Indonesia' },
];

export default function SignupPage() {
  const router = useRouter();

  // State management
  const [step, setStep] = useState<SignupStep>('method');
  const [method, setMethod] = useState<SignupMethod | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPhoneNumber, setConfirmPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [name, setName] = useState('');

  // KYC State
  const [kycData, setKycData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    idCopy: null as File | null
  });

  // Send OTP function
  const sendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const endpoint = method === 'email' ? '/api/otp/send-email' : '/api/otp/send-twilio';
      const fullPhoneNumber = method === 'phone' ? `${selectedCountryCode.code}${phoneNumber}` : '';
      const body = method === 'email'
        ? { email }
        : { phoneNumber: fullPhoneNumber, method: 'sms' };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.sessionId);
        setSuccess(data.message);
        setStep('otp');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and create account
  const verifyOTPAndSignup = async () => {
    setLoading(true);
    setError('');

    try {
      // Step 1: Verify OTP
      const verifyEndpoint = method === 'email'
        ? '/api/otp/verify-email'
        : '/api/otp/verify-twilio';

      const fullPhoneNumber = method === 'phone' ? `${selectedCountryCode.code}${phoneNumber}` : '';
      const verifyBody = method === 'email'
        ? { email, code: otpCode }
        : { phoneNumber: fullPhoneNumber, code: otpCode };

      const verifyResponse = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyBody)
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        setError(verifyData.message || 'Invalid OTP code');
        setLoading(false);
        return;
      }

      // Move to KYC step instead of creating account immediately
      setSuccess('Verification successful!');
      setLoading(false);
      setStep('kyc');
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  // Submit KYC and create account
  const submitKYCAndCreateAccount = async () => {
    setLoading(true);
    setError('');

    try {
      // Step 1: Upload ID document
      let idCopyUrl = '';
      if (kycData.idCopy) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', kycData.idCopy);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        });

        const uploadData = await uploadResponse.json();
        if (!uploadData.success) {
          setError('Failed to upload ID document');
          setLoading(false);
          return;
        }
        idCopyUrl = uploadData.url;
      }

      // Step 2: Create account with all data
      const signupResponse = await fetch('/api/auth/otp-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          phoneNumber: method === 'phone' ? `${selectedCountryCode.code}${phoneNumber}` : undefined,
          email: method === 'email' ? email : undefined,
          password,
          isVerified: true,
          firstName: method === 'email' && name ? name.split(' ')[0] : kycData.firstName,
          lastName: method === 'email' && name ? name.split(' ').slice(1).join(' ') || name.split(' ')[0] : kycData.lastName,
          idNumber: kycData.idNumber,
          idCopy: idCopyUrl,
          kycCompleted: true
        })
      });

      const signupData = await signupResponse.json();

      if (signupData.success) {
        // Save auth token
        if (signupData.token) {
          localStorage.setItem('auth_token', signupData.token);
          localStorage.setItem('auth_user', JSON.stringify(signupData.user));
        }

        // Redirect to dashboard
        router.push('/client-dashboard');
      } else {
        setError(signupData.message || 'Signup failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setLoading(true);
    setError('');

    try {
      // Redirect to social auth provider
      window.location.href = `/api/auth/social/${provider}`;
    } catch (err) {
      setError('Social login failed. Please try again.');
      setLoading(false);
    }
  };

  // Validation functions
  const validateConfirmStep = () => {
    if (method === 'phone') {
      // Clean both numbers to remove any extra characters
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      const cleanConfirmPhoneNumber = confirmPhoneNumber.replace(/\D/g, '');

      if (cleanPhoneNumber !== cleanConfirmPhoneNumber) {
        setError('Phone numbers do not match');
        return false;
      }
    } else {
      if (email !== confirmEmail) {
        setError('Email addresses do not match');
        return false;
      }
    }
    setError('');
    return true;
  };

  const validatePasswordStep = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    setError('');
    return true;
  };

  const validateKYCStep = () => {
    if (!kycData.firstName || !kycData.lastName) {
      setError('Please enter your legal name');
      return false;
    }
    if (!kycData.idNumber) {
      setError('Please enter your ID number');
      return false;
    }
    if (!kycData.idCopy) {
      setError('Please upload your ID document');
      return false;
    }
    setError('');
    return true;
  };

  // Render method selection step
  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
        <p className="text-gray-600">Choose how you'd like to sign up</p>
      </div>

      {/* Phone Number Signup */}
      <button
        onClick={() => {
          setMethod('phone');
          setStep('input');
        }}
        className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
      >
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200">
          <Phone className="w-6 h-6 text-orange-600" />
        </div>
        <div className="text-left flex-1">
          <h3 className="font-semibold text-gray-900">Sign up with Phone Number</h3>
          <p className="text-sm text-gray-500">We'll send you an SMS verification code</p>
        </div>
      </button>

      {/* Email Signup */}
      <button
        onClick={() => {
          setMethod('email');
          setStep('input');
        }}
        className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
      >
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200">
          <Mail className="w-6 h-6 text-orange-600" />
        </div>
        <div className="text-left flex-1">
          <h3 className="font-semibold text-gray-900">Sign up with Email</h3>
          <p className="text-sm text-gray-500">We'll send you an email verification code</p>
        </div>
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">or continue with</span>
        </div>
      </div>

      {/* Social Login Options */}
      <div className="space-y-3">
        {/* Google */}
        <button
          onClick={() => handleSocialLogin('google')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Facebook */}
        <button
          onClick={() => handleSocialLogin('facebook')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Continue with Facebook
        </button>

        {/* Apple */}
        <button
          onClick={() => handleSocialLogin('apple')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Continue with Apple
        </button>
      </div>

      {/* Login Link */}
      <div className="text-center pt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-orange-600 hover:text-orange-500 font-semibold"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );

  // Render input step - Email signup with enhanced form
  const renderInputStep = () => {
    if (method === 'email') {
      return (
        <div className="space-y-6">
          <button
            onClick={() => setStep('method')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to options
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-600">
              Fill in your details to get started
            </p>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Email Address Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Confirm Email Address Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Email Address *
            </label>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Register Button */}
          <button
            onClick={() => {
              // Validation
              if (!name.trim()) {
                setError('Please enter your name');
                return;
              }
              if (!email.trim()) {
                setError('Please enter your email address');
                return;
              }
              if (email !== confirmEmail) {
                setError('Email addresses do not match');
                return;
              }
              if (password.length < 8) {
                setError('Password must be at least 8 characters long');
                return;
              }
              if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
              }
              setError('');
              sendOTP();
            }}
            disabled={loading || !name || !email || !confirmEmail || !password || !confirmPassword}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending verification code...' : 'Register'}
          </button>

          {/* Already have an account? Login */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-orange-600 hover:text-orange-500 font-semibold"
              >
                Login
              </button>
            </p>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      );
    }

    // Phone signup remains the same
    return (
      <div className="space-y-6">
        <button
          onClick={() => setStep('method')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to options
        </button>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enter your phone number
          </h1>
          <p className="text-gray-600">
            We'll send you a verification code
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="flex gap-2">
            {/* Country Code Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[100px]"
              >
                <span className="text-lg">{selectedCountryCode.flag}</span>
                <span className="text-sm font-medium">{selectedCountryCode.code}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {isCountryDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto w-72">
                  {countryCodes.map((country) => (
                    <button
                      key={country.country}
                      type="button"
                      onClick={() => {
                        setSelectedCountryCode(country);
                        setIsCountryDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-sm font-medium">{country.code}</span>
                      <span className="text-sm text-gray-600 truncate">{country.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone Number Input */}
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="123456789"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        <button
          onClick={() => setStep('confirm')}
          disabled={loading || !phoneNumber}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    );
  };

  // Render confirmation step
  const renderConfirmStep = () => (
    <div className="space-y-6">
      <button
        onClick={() => setStep('input')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Confirm your {method === 'phone' ? 'phone number' : 'email'}
        </h1>
        <p className="text-gray-600">
          Please re-enter to confirm
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm {method === 'phone' ? 'Phone Number' : 'Email Address'}
        </label>
        {method === 'phone' ? (
          <div className="flex gap-2">
            {/* Country Code Display (Read-only) */}
            <div className="flex items-center gap-2 px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 min-w-[100px]">
              <span className="text-lg">{selectedCountryCode.flag}</span>
              <span className="text-sm font-medium">{selectedCountryCode.code}</span>
            </div>

            {/* Phone Number Confirmation Input */}
            <input
              type="tel"
              value={confirmPhoneNumber}
              onChange={(e) => setConfirmPhoneNumber(e.target.value)}
              placeholder="123456789"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        ) : (
          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={() => {
          if (validateConfirmStep()) {
            setStep('password');
          }
        }}
        disabled={method === 'phone' ? !confirmPhoneNumber : !confirmEmail}
        className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );

  // Render password step
  const renderPasswordStep = () => (
    <div className="space-y-6">
      <button
        onClick={() => setStep('confirm')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a password</h1>
        <p className="text-gray-600">
          Must be at least 8 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password *
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={() => {
          if (validatePasswordStep()) {
            sendOTP();
          }
        }}
        disabled={!password || !confirmPassword || loading}
        className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending verification code...' : 'Continue'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );

  // Render OTP verification step
  const renderOTPStep = () => (
    <div className="space-y-6">
      <button
        onClick={() => setStep('password')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Change {method === 'phone' ? 'phone number' : 'email'}
      </button>

      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enter verification code</h1>
        <p className="text-gray-600">
          We sent a code to {method === 'phone' ? `${selectedCountryCode.code}${phoneNumber}` : email}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          maxLength={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <button
        onClick={verifyOTPAndSignup}
        disabled={loading || otpCode.length !== 6}
        className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Verifying...</span>
          </div>
        ) : (
          'Verify code'
        )}
      </button>

      <button
        onClick={sendOTP}
        disabled={loading}
        className="w-full text-orange-600 hover:text-orange-500 font-medium transition-colors"
      >
        Didn't receive the code? Resend
      </button>
    </div>
  );

  // Render KYC step
  const renderKYCStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
        <p className="text-sm text-gray-600">Required for account verification</p>
      </div>

      {/* Why we need this */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Why we need this information</h3>
            <p className="text-sm text-blue-700">
              This information is required to verify your identity and comply with regulations.
              Your data is securely encrypted and never shared.
            </p>
          </div>
        </div>
      </div>

      {/* Legal First Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Legal First Name *
        </label>
        <p className="text-xs text-gray-500 mb-2">As shown on your ID</p>
        <input
          type="text"
          value={kycData.firstName}
          onChange={(e) => setKycData({ ...kycData, firstName: e.target.value })}
          placeholder="John"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Legal Last Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Legal Last Name *
        </label>
        <p className="text-xs text-gray-500 mb-2">As shown on your ID</p>
        <input
          type="text"
          value={kycData.lastName}
          onChange={(e) => setKycData({ ...kycData, lastName: e.target.value })}
          placeholder="Doe"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* ID Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ID Number *
        </label>
        <p className="text-xs text-gray-500 mb-2">National ID or Passport number</p>
        <input
          type="text"
          value={kycData.idNumber}
          onChange={(e) => setKycData({ ...kycData, idNumber: e.target.value })}
          placeholder="123456789"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* ID Document Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ID Document Copy *
        </label>
        <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-orange-400 transition-colors">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none">
                <span>Click to upload</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setKycData({ ...kycData, idCopy: e.target.files[0] });
                    }
                  }}
                  className="sr-only"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">JPG, PNG or PDF (max. 5MB)</p>
            {kycData.idCopy && (
              <p className="text-sm text-green-600 font-medium mt-2">
                Selected: {kycData.idCopy.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={() => {
          if (validateKYCStep()) {
            submitKYCAndCreateAccount();
          }
        }}
        disabled={loading || !kycData.firstName || !kycData.lastName || !kycData.idNumber || !kycData.idCopy}
        className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creating account...</span>
          </div>
        ) : (
          'Submit and Continue'
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {step === 'method' && renderMethodSelection()}
        {step === 'input' && renderInputStep()}
        {step === 'confirm' && renderConfirmStep()}
        {step === 'password' && renderPasswordStep()}
        {step === 'otp' && renderOTPStep()}
        {step === 'kyc' && renderKYCStep()}
      </div>
    </div>
  );
}
