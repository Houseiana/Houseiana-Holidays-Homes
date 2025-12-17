'use client';

interface EmptyMessagesProps {
  hostName?: string;
}

export function EmptyMessages({ hostName }: EmptyMessagesProps) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl">💬</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
      <p className="text-gray-600">Start the conversation with {hostName || 'the host'}!</p>
    </div>
  );
}
