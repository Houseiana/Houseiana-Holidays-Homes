'use client';

import { ShieldCheck } from 'lucide-react';
import type { PropertyDetail } from '@/hooks';
import Image from 'next/image';

export interface HostInfoProps {
  host: PropertyDetail['host'];
}

export function HostInfo({ host }: HostInfoProps) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src={host.avatar}
        alt={host.name}
        width={48}
        height={48}
        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100"
        onError={(e) => {
          e.currentTarget.src = 'https://via.placeholder.com/50';
        }}
      />
      <div>
        <p className="font-semibold text-gray-900">Hosted by {host.name}</p>
        <p className="text-sm text-gray-600">New on Houseiana</p>
        {host.verified && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full mt-1">
            <ShieldCheck className="w-3 h-3" />
            Verified host
          </span>
        )}
      </div>
    </div>
  );
}
