'use client';

import { Download, X } from 'lucide-react';

interface DataRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DataRequestModal({ isOpen, onClose, onConfirm }: DataRequestModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
            <Download className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Request your data</h2>
          <p className="text-gray-600 mb-4">
            We&apos;ll prepare a copy of your personal data and send you an email when it&apos;s ready to download. This usually takes up to 30 days.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Your data package will include:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Profile information</li>
              <li>• Booking history</li>
              <li>• Messages and reviews</li>
              <li>• Payment history</li>
              <li>• Account activity</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-teal-500 rounded-lg hover:bg-teal-600"
            >
              Request data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
