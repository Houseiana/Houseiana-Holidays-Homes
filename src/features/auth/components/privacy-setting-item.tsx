'use client';

import { LucideIcon } from 'lucide-react';
import { PrivacyToggle } from './privacy-toggle';

interface PrivacySettingItemProps {
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

export function PrivacySettingItem({
  icon: Icon,
  iconBgColor = 'bg-gray-100',
  iconColor = 'text-gray-600',
  title,
  description,
  enabled,
  onToggle,
}: PrivacySettingItemProps) {
  return (
    <div className="py-6">
      <div className="flex items-start justify-between gap-8">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-10 h-10 ${iconBgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <h3 className="text-gray-900 font-medium">{title}</h3>
            <p className="text-gray-500 text-sm mt-1">{description}</p>
          </div>
        </div>
        <PrivacyToggle enabled={enabled} onChange={onToggle} />
      </div>
    </div>
  );
}

interface DataActionItemProps {
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  description: string;
  actionLabel: string;
  actionColor?: string;
  onAction: () => void;
}

export function DataActionItem({
  icon: Icon,
  iconBgColor = 'bg-gray-100',
  iconColor = 'text-gray-600',
  title,
  description,
  actionLabel,
  actionColor = 'text-gray-900 hover:text-gray-600',
  onAction,
}: DataActionItemProps) {
  return (
    <div className="py-6">
      <div className="flex items-start justify-between gap-8">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-10 h-10 ${iconBgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <h3 className="text-gray-900 font-medium">{title}</h3>
            <p className="text-gray-500 text-sm mt-1">{description}</p>
          </div>
        </div>
        <button
          onClick={onAction}
          className={`text-sm font-semibold ${actionColor} underline`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
