/**
 * Message Client Button
 * Opens Intercom to message guest about booking (HOST → CLIENT)
 */
'use client';

interface MessageClientButtonProps {
  bookingId: string;
  clientId: string;
  clientName: string;
  className?: string;
}

export default function MessageClientButton({
  bookingId,
  clientId,
  clientName,
  className = '',
}: MessageClientButtonProps) {
  const handleMessageClient = () => {
    if (typeof window !== 'undefined' && window.Intercom) {
      window.Intercom('showNewMessage',
        `Hi ${clientName}, regarding your booking (ID: ${bookingId}). `
      );

      window.Intercom('update', {
        conversation_type: 'HOST_CLIENT',
        booking_id: bookingId,
        target_client_id: clientId,
        conversation_about: 'booking',
      });
    }
  };

  return (
    <button
      onClick={handleMessageClient}
      className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      Message Guest
    </button>
  );
}
