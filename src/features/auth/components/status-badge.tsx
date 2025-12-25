'use client';

import { Check, Clock, AlertCircle, XCircle, RefreshCw } from 'lucide-react';

type BadgeVariant = 'completed' | 'pending' | 'refunded' | 'failed' | 'ready' | 'processing';

interface StatusBadgeProps {
  status: BadgeVariant | string;
  showIcon?: boolean;
  className?: string;
}

const variantConfig: Record<BadgeVariant, { bg: string; text: string; icon: typeof Check }> = {
  completed: { bg: 'bg-green-50', text: 'text-green-700', icon: Check },
  ready: { bg: 'bg-green-50', text: 'text-green-700', icon: Check },
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
  processing: { bg: 'bg-blue-50', text: 'text-blue-700', icon: RefreshCw },
  refunded: { bg: 'bg-orange-50', text: 'text-orange-700', icon: RefreshCw },
  failed: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
};

export function StatusBadge({ status, showIcon = true, className = '' }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() as BadgeVariant;
  const config = variantConfig[normalizedStatus] || variantConfig.pending;
  const Icon = config.icon;

  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {displayStatus}
    </span>
  );
}
