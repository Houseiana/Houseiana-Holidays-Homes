import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
}

export function StatCard({ label, value, icon, iconBgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 ${iconBgColor} rounded-full flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
