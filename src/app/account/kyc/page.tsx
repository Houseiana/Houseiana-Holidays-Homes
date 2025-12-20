'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Shield,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import {
  AccountHeader,
  AccountFooter,
  AccountBreadcrumb,
  SecuritySection,
} from '@/components/account';

type KycStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

export default function KycVerificationPage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  const [kycStatus, setKycStatus] = useState<KycStatus>('not_started');
  const [kycId, setKycId] = useState('');
  const [savedKycId, setSavedKycId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Redirect if not signed in
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, router]);

  // Load saved KYC data (in real app, this would come from API)
  useEffect(() => {
    // Mock: Check if user has saved KYC ID
    const storedKycId = localStorage.getItem(`kyc_${user?.id}`);
    if (storedKycId) {
      setSavedKycId(storedKycId);
      setKycStatus('pending'); // or 'verified' based on verification status
    }
  }, [user?.id]);

  const handleStartKyc = () => {
    window.open('https://www.goldenloonie.com', '_blank', 'noopener,noreferrer');
  };

  const handleSubmitKycId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycId.trim()) return;

    setIsSubmitting(true);

    try {
      // In real app, this would call your API to save the KYC ID
      // await AccountAPI.saveKycId(kycId);

      // Mock: Save to localStorage for demo
      localStorage.setItem(`kyc_${user?.id}`, kycId);

      setSavedKycId(kycId);
      setKycStatus('pending');
      setShowSuccess(true);
      setKycId('');

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving KYC ID:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyKycId = () => {
    if (savedKycId) {
      navigator.clipboard.writeText(savedKycId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const userAvatar = user.firstName?.charAt(0).toUpperCase() || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase() || 'U';

  const statusConfig = {
    not_started: {
      icon: AlertTriangle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      label: 'Not Started',
      description: 'Complete your KYC verification to unlock all features',
    },
    pending: {
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      label: 'Pending Verification',
      description: 'Your KYC is being reviewed. This usually takes 1-2 business days.',
    },
    verified: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      label: 'Verified',
      description: 'Your identity has been verified. You have full access to all features.',
    },
    rejected: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      label: 'Rejected',
      description: 'Your KYC verification was rejected. Please try again with valid documents.',
    },
  };

  const currentStatus = statusConfig[kycStatus];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-white">
      <AccountHeader userAvatar={userAvatar} />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        <AccountBreadcrumb />

        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">KYC Verification</h1>
        <p className="text-gray-500 mb-8">Verify your identity to unlock all platform features.</p>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">
                KYC Verification ID submitted successfully! We&apos;ll verify your identity shortly.
              </p>
            </div>
          </div>
        )}

        {/* Current Status */}
        <div className={`p-6 rounded-xl ${currentStatus.bgColor} mb-8`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full ${currentStatus.bgColor} flex items-center justify-center`}>
              <StatusIcon className={`w-6 h-6 ${currentStatus.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">Status: {currentStatus.label}</h3>
              </div>
              <p className="text-gray-600">{currentStatus.description}</p>

              {savedKycId && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Your KYC Verification ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-gray-900 font-mono font-medium">{savedKycId}</code>
                    <button
                      onClick={handleCopyKycId}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Start KYC Section */}
        <SecuritySection title="Start Your KYC Verification">
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Verify with Golden Loonie
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We partner with Golden Loonie for secure identity verification. Click the button below to start
                    your KYC process on their platform. Once completed, you&apos;ll receive a verification ID to enter here.
                  </p>
                  <button
                    onClick={handleStartKyc}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Start Your KYC
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p className="mb-2"><strong>What you&apos;ll need:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Valid government-issued ID (Passport, National ID, or Driving License)</li>
                <li>A clear selfie for facial verification</li>
                <li>Proof of address (utility bill or bank statement)</li>
              </ul>
            </div>
          </div>
        </SecuritySection>

        {/* Enter KYC ID Section */}
        <SecuritySection title="Enter Your KYC Verification ID">
          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-600 mb-4">
              After completing your verification on Golden Loonie, enter the verification ID you received below.
            </p>

            <form onSubmit={handleSubmitKycId} className="space-y-4">
              <div>
                <label htmlFor="kycId" className="block text-sm font-medium text-gray-700 mb-2">
                  KYC Verification ID
                </label>
                <input
                  type="text"
                  id="kycId"
                  value={kycId}
                  onChange={(e) => setKycId(e.target.value)}
                  placeholder="Enter your verification ID (e.g., GL-KYC-123456)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono"
                  disabled={isSubmitting}
                />
                <p className="mt-2 text-sm text-gray-500">
                  This ID was provided to you after completing verification on Golden Loonie.
                </p>
              </div>

              <button
                type="submit"
                disabled={!kycId.trim() || isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Submit Verification ID
                  </>
                )}
              </button>
            </form>
          </div>
        </SecuritySection>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Why do I need to verify my identity?</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Identity verification helps us maintain a safe and trusted community. Verified users can:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• List properties as a host</li>
                <li>• Make instant bookings without additional approval</li>
                <li>• Access premium features and promotions</li>
                <li>• Build trust with hosts and guests</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <AccountFooter />
    </div>
  );
}
