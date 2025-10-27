'use client';

import { useState } from 'react';
import LoginModal from '@/components/auth/login-modal';
import SignupModal from '@/components/auth/signup-modal';

export type AuthModalType = 'login' | 'signup' | null;

interface AuthModalsProps {
  activeModal: AuthModalType;
  onClose: () => void;
  onSwitchToSignup?: () => void;
  onSwitchToLogin?: () => void;
}

export default function AuthModals({ activeModal, onClose, onSwitchToSignup, onSwitchToLogin }: AuthModalsProps) {
  return (
    <>
      <LoginModal
        isOpen={activeModal === 'login'}
        onClose={onClose}
        onSignupClick={onSwitchToSignup}
      />

      <SignupModal
        isOpen={activeModal === 'signup'}
        onClose={onClose}
        onLoginClick={onSwitchToLogin}
      />
    </>
  );
}

// Hook for managing auth modals
export function useAuthModals() {
  const [activeModal, setActiveModal] = useState<AuthModalType>(null);

  const openLogin = () => setActiveModal('login');
  const openSignup = () => setActiveModal('signup');
  const closeModal = () => setActiveModal(null);

  const switchToSignup = () => setActiveModal('signup');
  const switchToLogin = () => setActiveModal('login');

  return {
    activeModal,
    openLogin,
    openSignup,
    closeModal,
    switchToSignup,
    switchToLogin
  };
}