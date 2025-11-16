/**
 * Message Host Button
 * Opens Intercom to message property host (CLIENT → HOST)
 */
'use client';

interface MessageHostButtonProps {
  propertyId: string;
  hostId: string;
  hostName: string;
  className?: string;
}

export default function MessageHostButton({
  propertyId,
  hostId,
  hostName,
  className = '',
}: MessageHostButtonProps) {
  const handleMessageHost = () => {
    if (typeof window !== 'undefined' && window.Intercom) {
      // Open Intercom with pre-filled context
      window.Intercom('showNewMessage',
        `Hi ${hostName}, I'm interested in your property (ID: ${propertyId}). `
      );

      // Update user attributes for routing
      window.Intercom('update', {
        conversation_type: 'CLIENT_HOST',
        property_id: propertyId,
        target_host_id: hostId,
        conversation_about: 'property_inquiry',
      });
    }
  };

  return (
    <button
      onClick={handleMessageHost}
      className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      Message Host
    </button>
  );
}
