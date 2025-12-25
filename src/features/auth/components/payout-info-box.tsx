'use client';

import { AlertCircle } from 'lucide-react';

interface PayoutInfoBoxProps {
  title?: string;
  description?: string;
}

export function PayoutInfoBox({
  title = 'When will I get my payout?',
  description = "Payouts are typically released 24 hours after your guest's scheduled check-in time. The time it takes for the payout to arrive depends on your payout method.",
}: PayoutInfoBoxProps) {
  return (
    <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-blue-800">
        <p className="font-medium mb-1">{title}</p>
        <p>{description}</p>
      </div>
    </div>
  );
}
