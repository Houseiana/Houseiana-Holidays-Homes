'use client';

import { getSocialIcon, SocialIconType } from './social-icons';

export interface ConnectedService {
  id: string;
  name: string;
  email: string | null;
  connected: boolean;
  icon: SocialIconType;
}

interface ConnectedServiceItemProps {
  service: ConnectedService;
  onConnect: (serviceId: string) => void;
  onDisconnect: (serviceId: string) => void;
}

export function ConnectedServiceItem({
  service,
  onConnect,
  onDisconnect,
}: ConnectedServiceItemProps) {
  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            {getSocialIcon(service.icon)}
          </div>
          <div>
            <h3 className="text-gray-900 font-medium">{service.name}</h3>
            {service.connected ? (
              <p className="text-gray-500 text-sm">{service.email}</p>
            ) : (
              <p className="text-gray-400 text-sm">Not connected</p>
            )}
          </div>
        </div>
        <button
          onClick={() => service.connected ? onDisconnect(service.id) : onConnect(service.id)}
          className="text-sm font-semibold text-gray-900 underline hover:text-gray-600"
        >
          {service.connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  );
}
