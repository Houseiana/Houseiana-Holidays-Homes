'use client';

import { ReactNode } from 'react';

interface SecuritySectionProps {
  title: string;
  children: ReactNode;
  headerAction?: ReactNode;
}

export function SecuritySection({ title, children, headerAction }: SecuritySectionProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {headerAction}
      </div>
      {children}
    </section>
  );
}
