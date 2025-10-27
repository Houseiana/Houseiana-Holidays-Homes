'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Modal from '@/components/ui/modal';
import OTPLogin from '@/components/auth/otp-login';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupClick?: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSignupClick, onSuccess }: LoginModalProps) {
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  // Reset form when modal closes
  const handleClose = () => {
    setLoginMethod('email');
    setFormData({ email: '', password: '', rememberMe: false });
    setShowPassword(false);
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  const handleOTPSuccess = () => {
    handleClose();
    if (onSuccess) {
      onSuccess();
    } else {
      // Redirect to unified dashboard (default to guest mode)
      window.location.href = '/dashboard';
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: undefined }));
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    }
    if (password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: undefined }));
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValid = validateEmail(formData.email);
    const passwordValid = validatePassword(formData.password);

    if (emailValid && passwordValid) {
      setIsLoading(true);
      setErrors(prev => ({ ...prev, general: undefined }));

      try {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.ok && !result.error) {
          handleClose(); // Close modal on successful login
          if (onSuccess) {
            onSuccess();
          } else {
            // Redirect to unified dashboard (default to guest mode)
            window.location.href = '/dashboard';
          }
        } else {
          setErrors(prev => ({ ...prev, general: result?.error || 'Invalid email or password' }));
        }
      } catch (error) {
        setErrors(prev => ({ ...prev, general: 'Login failed. Please try again.' }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await signIn('google', { redirect: false });

      if (result?.ok && !result.error) {
        handleClose(); // Close modal on successful login
        if (onSuccess) {
          onSuccess();
        } else {
          // Redirect to unified dashboard
          window.location.href = '/dashboard';
        }
      } else {
        setErrors(prev => ({ ...prev, general: 'Google login failed. Please try again.' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'Google login failed. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      const result = await signIn('facebook', { redirect: false });

      if (result?.ok && !result.error) {
        handleClose(); // Close modal on successful login
        if (onSuccess) {
          onSuccess();
        } else {
          // Redirect to unified dashboard
          window.location.href = '/dashboard';
        }
      } else {
        setErrors(prev => ({ ...prev, general: 'Facebook login failed. Please try again.' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'Facebook login failed. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await signIn('apple', { redirect: false });

      if (result?.ok && !result.error) {
        handleClose(); // Close modal on successful login
        if (onSuccess) {
          onSuccess();
        } else {
          // Redirect to unified dashboard
          window.location.href = '/dashboard';
        }
      } else {
        setErrors(prev => ({ ...prev, general: 'Apple login failed. Please try again.' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'Apple login failed. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  if (loginMethod === 'otp') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        maxWidth="2xl"
        showCloseButton={true}
        className="login-modal"
      >
        <OTPLogin onBack={() => setLoginMethod('email')} onSuccess={handleOTPSuccess} />
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="2xl"
      showCloseButton={true}
      title="Welcome back to Houseiana"
      className="login-modal"
    >
      <div className="p-8 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Log in</h2>
          <p className="text-lg text-gray-600">Access your account as both Guest and Host</p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-700 text-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleFacebookLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-700 text-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </button>

          <button
            onClick={handleAppleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-700 text-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>

          <button
            onClick={() => setLoginMethod('otp')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-700 text-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <span className="text-2xl">📱</span>
            Continue with Phone (OTP)
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-200" />
          </div>
          <div className="relative flex justify-center text-base">
            <span className="px-6 bg-white text-gray-500 font-medium">or continue with email</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-base font-semibold text-gray-900 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                onBlur={() => validateEmail(formData.email)}
                placeholder="john.doe@example.com"
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C] transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-base font-semibold text-gray-900 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                onBlur={() => validatePassword(formData.password)}
                placeholder="Enter your password"
                className={`w-full pl-12 pr-14 py-4 border-2 rounded-xl text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C] transition-all ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                className="w-5 h-5 text-[#FF385C] border-gray-300 rounded focus:ring-[#FF385C]"
              />
              <span className="text-base text-gray-700 font-medium">Remember me</span>
            </label>
            <button
              type="button"
              className="text-base text-[#FF385C] hover:text-[#E31C5F] font-semibold transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-base text-red-600 font-medium">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#FF385C] to-[#E31C5F] text-white py-4 px-6 rounded-xl text-lg font-bold hover:from-[#E31C5F] hover:to-[#C13C51] focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Log in to your account'
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="text-base text-blue-800 font-medium text-center">
            🎉 One account for everything! Switch between Guest and Host modes anytime from your dashboard.
          </p>
        </div>

        {/* Signup Link */}
        {onSignupClick && (
          <div className="text-center mt-8 pt-8 border-t-2 border-gray-200">
            <p className="text-base text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onSignupClick}
                className="text-[#FF385C] hover:text-[#E31C5F] text-lg font-bold transition-colors underline"
              >
                Sign up now
              </button>
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
