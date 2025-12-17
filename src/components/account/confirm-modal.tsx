'use client';

import { AlertTriangle, Check } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  variant?: 'warning' | 'danger';
  bulletPoints?: string[];
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = 'Cancel',
  variant = 'warning',
  bulletPoints,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconBgColor = variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100';
  const iconColor = variant === 'danger' ? 'text-red-600' : 'text-yellow-600';
  const confirmBgColor = variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-gray-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        <div className="p-6">
          <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center mb-4`}>
            <AlertTriangle className={`w-6 h-6 ${iconColor}`} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-4">{description}</p>

          {bulletPoints && bulletPoints.length > 0 && (
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              {bulletPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 text-sm font-semibold text-white ${confirmBgColor} rounded-lg`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
