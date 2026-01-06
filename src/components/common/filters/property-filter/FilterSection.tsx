import React from 'react';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

export const FilterSection = ({ title, children }: FilterSectionProps) => (
  <div className="py-6 border-b border-gray-200 last:border-b-0">
    <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
    {children}
  </div>
);
