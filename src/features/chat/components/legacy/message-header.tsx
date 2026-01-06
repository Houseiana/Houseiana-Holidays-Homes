'use client';

import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';

interface Conversation {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  lastMessageAt: string;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
}

interface MessageHeaderProps {
  conversation: Conversation | null;
  onBack: () => void;
}

export function MessageHeader({ conversation, onBack }: MessageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
              {conversation?.hostName?.charAt(0).toUpperCase() || 'H'}
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{conversation?.hostName || 'Host'}</h1>
              <p className="text-xs text-gray-500">Usually replies within an hour</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
