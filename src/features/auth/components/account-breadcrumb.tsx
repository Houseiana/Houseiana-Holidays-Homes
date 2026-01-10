'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface AccountBreadcrumbProps {
  backLink?: string;
  backLabel?: string;
  current?: string;
}

export function AccountBreadcrumb({
  backLink = '/client-dashboard?tab=account',
  backLabel = 'Account',
  current
}: AccountBreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm mb-6">
      <Link href={backLink} className="text-gray-500 hover:text-gray-900 flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" />
        {backLabel}
      </Link>
      {current && (
        <>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">{current}</span>
        </>
      )}
    </div>
  );
}
