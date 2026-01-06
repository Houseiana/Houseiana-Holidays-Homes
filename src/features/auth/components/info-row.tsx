'use client';

import { ReactNode } from 'react';
import { Check } from 'lucide-react';

interface InfoRowProps {
  label: string;
  value?: ReactNode;
  field: string;
  description?: string;
  isVerified?: boolean;
  verifiedLabel?: string;
  notProvidedText?: string;
  isEditing: boolean;
  onEdit: () => void;
  editForm?: ReactNode;
}

export function InfoRow({
  label,
  value,
  field,
  description,
  isVerified,
  verifiedLabel,
  notProvidedText = 'Not provided',
  isEditing,
  onEdit,
  editForm,
}: InfoRowProps) {
  return (
    <div className="py-6 border-b border-gray-200 last:border-0">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-gray-900 font-medium">{label}</h3>
          {!isEditing && (
            <>
              {value ? (
                <div className="text-gray-500 mt-1">{value}</div>
              ) : (
                <p className="text-gray-400 mt-1">{notProvidedText}</p>
              )}
              {isVerified && (
                <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                  <Check className="w-4 h-4" />
                  <span>{verifiedLabel}</span>
                </div>
              )}
              {description && !value && (
                <p className="text-gray-400 text-sm mt-1">{description}</p>
              )}
            </>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="text-sm font-semibold text-gray-900 underline hover:text-gray-600"
          >
            {value || isVerified ? 'Edit' : 'Add'}
          </button>
        )}
      </div>

      {/* Edit Form */}
      {isEditing && editForm}
    </div>
  );
}
