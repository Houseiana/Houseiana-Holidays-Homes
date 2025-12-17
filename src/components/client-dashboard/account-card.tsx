'use client';

interface AccountCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

export function AccountCard({ icon, title, description, onClick }: AccountCardProps) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="w-8 h-8 text-gray-900 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
