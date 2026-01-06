'use client';

import { Chrome, Smartphone, Monitor } from 'lucide-react';

interface DeviceSession {
  id: number;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  icon: string;
}

interface DeviceSessionItemProps {
  session: DeviceSession;
  onManage: () => void;
}

export function DeviceSessionItem({ session, onManage }: DeviceSessionItemProps) {
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'chrome':
        return <Chrome className="w-6 h-6 text-gray-600" />;
      case 'mobile':
        return <Smartphone className="w-6 h-6 text-gray-600" />;
      case 'safari':
      default:
        return <Monitor className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            {getDeviceIcon(session.icon)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-gray-900 font-medium">{session.device}</h3>
              {session.isCurrent && (
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                  This device
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm">{session.location} · {session.lastActive}</p>
          </div>
        </div>
        {!session.isCurrent && (
          <button
            onClick={onManage}
            className="text-sm font-semibold text-gray-900 underline hover:text-gray-600"
          >
            Manage
          </button>
        )}
      </div>
    </div>
  );
}
