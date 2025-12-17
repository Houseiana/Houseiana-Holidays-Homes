'use client';

import { Shield, ExternalLink, AlertCircle } from 'lucide-react';

export function PrivacyPolicyBox() {
  return (
    <div className="p-6 bg-gray-50 rounded-xl">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-gray-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Your privacy matters</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            Learn more about how we collect, use, and protect your personal information. You have rights over your data under applicable privacy laws.
          </p>
          <div className="flex gap-4">
            <a href="/privacy-policy" className="text-sm font-semibold text-gray-900 underline hover:text-gray-600 flex items-center gap-1">
              Privacy Policy
              <ExternalLink className="w-3 h-3" />
            </a>
            <a href="/cookie-policy" className="text-sm font-semibold text-gray-900 underline hover:text-gray-600 flex items-center gap-1">
              Cookie Policy
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GdprNotice() {
  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-xl">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Your rights:</span> Under GDPR, CCPA, and other applicable laws, you have the right to access, correct, delete, or port your data. You can also object to certain processing activities.{' '}
            <a href="/help/privacy-rights" className="text-gray-900 underline">Learn more about your rights</a>
          </p>
        </div>
      </div>
    </div>
  );
}
