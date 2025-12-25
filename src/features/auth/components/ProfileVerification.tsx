'use client';

import { Shield, Mail, Phone, CreditCard, Check, Clock, X } from 'lucide-react';
import { VerificationBadge, TrustIndicator } from '@/types/profile';

interface ProfileVerificationProps {
  verifications: VerificationBadge[];
  trustIndicators: TrustIndicator[];
  isOwnProfile?: boolean;
  onVerify?: (type: string) => void;
}

const verificationConfig = {
  identity: {
    icon: Shield,
    label: 'Identity Verified',
    description: 'Government ID has been verified',
    pendingLabel: 'Identity Pending',
    notVerifiedLabel: 'Verify Identity',
  },
  email: {
    icon: Mail,
    label: 'Email Verified',
    description: 'Email address has been confirmed',
    pendingLabel: 'Email Pending',
    notVerifiedLabel: 'Verify Email',
  },
  phone: {
    icon: Phone,
    label: 'Phone Verified',
    description: 'Phone number has been confirmed',
    pendingLabel: 'Phone Pending',
    notVerifiedLabel: 'Verify Phone',
  },
  government_id: {
    icon: CreditCard,
    label: 'Government ID',
    description: 'Official ID document verified',
    pendingLabel: 'ID Pending',
    notVerifiedLabel: 'Add Government ID',
  },
};

export default function ProfileVerification({
  verifications,
  trustIndicators,
  isOwnProfile = false,
  onVerify,
}: ProfileVerificationProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <Check size={14} className="text-white" />;
      case 'pending':
        return <Clock size={14} className="text-white" />;
      default:
        return <X size={14} className="text-white" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusLabel = (type: string, status: string) => {
    const config = verificationConfig[type as keyof typeof verificationConfig];
    if (!config) return status;

    switch (status) {
      case 'verified':
        return config.label;
      case 'pending':
        return config.pendingLabel;
      default:
        return config.notVerifiedLabel;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      {/* Verifications Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={20} className="text-green-500" />
          Verified Information
        </h3>

        <div className="space-y-3">
          {verifications.map((verification) => {
            const config = verificationConfig[verification.type as keyof typeof verificationConfig];
            if (!config) return null;

            const Icon = config.icon;
            const isClickable = isOwnProfile && verification.status !== 'verified' && onVerify;

            return (
              <div
                key={verification.type}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  verification.status === 'verified'
                    ? 'bg-green-50'
                    : verification.status === 'pending'
                    ? 'bg-yellow-50'
                    : 'bg-gray-50'
                } ${isClickable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
                onClick={() => isClickable && onVerify?.(verification.type)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      verification.status === 'verified'
                        ? 'bg-green-100'
                        : verification.status === 'pending'
                        ? 'bg-yellow-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        verification.status === 'verified'
                          ? 'text-green-600'
                          : verification.status === 'pending'
                          ? 'text-yellow-600'
                          : 'text-gray-400'
                      }
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getStatusLabel(verification.type, verification.status)}
                    </p>
                    {verification.status === 'verified' && verification.verifiedAt && (
                      <p className="text-xs text-gray-500">
                        Verified {new Date(verification.verifiedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className={`p-1 rounded-full ${getStatusColor(verification.status)}`}
                >
                  {getStatusIcon(verification.status)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust Indicators Section */}
      {trustIndicators.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Trust Indicators</h3>
          <div className="space-y-3">
            {trustIndicators.map((indicator, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{indicator.label}</p>
                  {indicator.description && (
                    <p className="text-xs text-gray-500">{indicator.description}</p>
                  )}
                </div>
                <span className="text-sm font-bold text-blue-600">{indicator.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Note */}
      {verifications.some((v) => v.status === 'verified') && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 leading-relaxed">
            Verified information helps build trust between hosts and guests on Houseiana.
            All personal information is kept private and secure.
          </p>
        </div>
      )}
    </div>
  );
}
