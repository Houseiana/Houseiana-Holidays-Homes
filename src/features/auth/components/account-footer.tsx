'use client';

import { Globe } from 'lucide-react';

export function AccountFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span>© 2024 Houseiana, Inc.</span>
            <span>|</span>
            <a href="/privacy" className="hover:underline flex items-center">Privacy</a>
            <span>|</span>
            <a href="/terms" className="hover:underline flex items-center">Terms</a>
          </div>
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm font-medium hover:underline">
              <Globe className="w-4 h-4" />
              English (US)
            </button>
            <span className="text-sm font-medium">$ USD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
