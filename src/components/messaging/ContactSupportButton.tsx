/**
 * Contact Support Button
 * Opens Intercom to contact admin support (CLIENT/HOST → ADMIN)
 */
'use client';

interface ContactSupportButtonProps {
  userType: 'client' | 'host';
  context?: {
    propertyId?: string;
    bookingId?: string;
    issue?: string;
  };
  className?: string;
  children?: React.ReactNode;
}

export default function ContactSupportButton({
  userType,
  context,
  className = '',
  children,
}: ContactSupportButtonProps) {
  const handleContactSupport = () => {
    if (typeof window !== 'undefined' && window.Intercom) {
      let message = 'Hi, I need help with ';

      if (context?.issue) {
        message += context.issue;
      } else if (context?.bookingId) {
        message += `booking ID: ${context.bookingId}`;
      } else if (context?.propertyId) {
        message += `property ID: ${context.propertyId}`;
      } else {
        message += 'my account.';
      }

      window.Intercom('showNewMessage', message);

      const conversationType = userType === 'host' ? 'HOST_ADMIN' : 'CLIENT_ADMIN';

      window.Intercom('update', {
        conversation_type: conversationType,
        ...(context?.booking_id && { booking_id: context.bookingId }),
        ...(context?.property_id && { property_id: context.propertyId }),
        conversation_about: 'support',
      });
    }
  };

  return (
    <button
      onClick={handleContactSupport}
      className={`flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${className}`}
    >
      {children || (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          Contact Support
        </>
      )}
    </button>
  );
}
