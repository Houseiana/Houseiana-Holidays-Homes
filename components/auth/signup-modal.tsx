'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Modal from '@/components/ui/modal';
import Step1PhoneNumber from '@/components/auth/multi-step-signup/Step1PhoneNumber';
import Step3VerificationCode from '@/components/auth/multi-step-signup/Step3VerificationCode';
import Step4UserDetails from '@/components/auth/multi-step-signup/Step4UserDetails';
import Step5CommunityCommitment from '@/components/auth/multi-step-signup/Step5CommunityCommitment';
import Step6ProfileWelcome from '@/components/auth/multi-step-signup/Step6ProfileWelcome';
import Step7ProfilePhoto from '@/components/auth/multi-step-signup/Step7ProfilePhoto';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick?: () => void;
}

type SignupData = {
  countryCode: string;
  phoneNumber: string;
  userType?: string;
  verificationCode: string;
  firstName: string;
  lastName: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  email: string;
  profilePhoto?: string;
};

export default function SignupModal({ isOpen, onClose, onLoginClick }: SignupModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [signupData, setSignupData] = useState<Partial<SignupData>>({});

  // Reset modal state when closed
  const handleClose = () => {
    setCurrentStep(1);
    setSignupData({});
    onClose();
  };

  // Step 1: Phone Number
  const handlePhoneNumberContinue = (countryCode: string, phoneNumber: string) => {
    setSignupData((prev) => ({ ...prev, countryCode, phoneNumber }));
    setCurrentStep(2); // Skip security check, go directly to verification
  };

  // Step 2: Verification Code (removed security check)
  const handleVerificationContinue = (code: string) => {
    setSignupData((prev) => ({ ...prev, verificationCode: code }));
    setCurrentStep(3);
  };

  // Step 3: User Details (updated step numbers)
  const handleUserDetailsContinue = (data: {
    firstName: string;
    lastName: string;
    birthMonth: string;
    birthDay: string;
    birthYear: string;
    email: string;
  }) => {
    setSignupData((prev) => ({ ...prev, ...data }));
    setCurrentStep(4);
  };

  // Step 4: Community Commitment
  const handleCommitmentContinue = () => {
    setCurrentStep(5);
  };

  const handleCommitmentDecline = () => {
    alert('You must agree to the community commitment to continue.');
  };

  // Step 5: Profile Welcome
  const handleWelcomeContinue = () => {
    setCurrentStep(6);
  };

  const handleWelcomeClose = () => {
    setCurrentStep(6);
  };

  // Step 6: Profile Photo
  const handleProfilePhotoContinue = async (photoUrl?: string) => {
    const finalData = { ...signupData, profilePhoto: photoUrl };

    try {
      console.log('Signup completed with data:', finalData);

      // Call NextAuth signup API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${finalData.firstName} ${finalData.lastName}`,
          email: finalData.email,
          password: 'temp_password', // You may want to add password step
          phone: `${finalData.countryCode}${finalData.phoneNumber}`,
          countryCode: finalData.countryCode,
          profilePhoto: photoUrl,
          birthDate: `${finalData.birthYear}-${finalData.birthMonth}-${finalData.birthDay}`,
          isPhoneVerified: true
        })
      });

      if (response.ok) {
        const authData = await response.json();

        // Auto-login after successful registration
        const signInResult = await signIn('credentials', {
          email: finalData.email,
          password: 'temp_password',
          redirect: false
        });

        if (signInResult?.ok) {
          handleClose(); // Close modal on successful signup
          // Redirect to unified dashboard
          window.location.href = '/dashboard';
        } else {
          throw new Error('Auto-login failed');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup. Please try again.');
    }
  };

  const handleProfilePhotoSkip = () => {
    handleProfilePhotoContinue();
  };

  // Navigation handlers
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      handleClose();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PhoneNumber
            onContinue={handlePhoneNumberContinue}
            onBack={handleClose}
          />
        );
      case 2:
        return (
          <Step3VerificationCode
            phoneNumber={signupData.phoneNumber || ''}
            countryCode={signupData.countryCode || ''}
            onContinue={handleVerificationContinue}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step4UserDetails
            onContinue={handleUserDetailsContinue}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <Step5CommunityCommitment
            onContinue={handleCommitmentContinue}
            onDecline={handleCommitmentDecline}
          />
        );
      case 5:
        return (
          <Step6ProfileWelcome
            onContinue={handleWelcomeContinue}
            onClose={handleWelcomeClose}
          />
        );
      case 6:
        return (
          <Step7ProfilePhoto
            onContinue={handleProfilePhotoContinue}
            onSkip={handleProfilePhotoSkip}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="lg"
      showCloseButton={false}
      className="signup-modal"
    >
      <div className="min-h-[60vh] flex items-center justify-center">
        {renderCurrentStep()}
      </div>

      {/* Login Link at Bottom */}
      {currentStep === 1 && onLoginClick && (
        <div className="p-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onLoginClick}
              className="text-[#FF385C] hover:text-[#E31C5F] font-semibold transition-colors"
            >
              Log in
            </button>
          </p>
        </div>
      )}
    </Modal>
  );
}