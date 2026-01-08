'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-600 hover:text-gray-900">Help Center</Link></li>
              <li><Link href="/help/contact-support" className="text-gray-600 hover:text-gray-900">Contact Us</Link></li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Hosting</h3>
            <ul className="space-y-2">
              <li><Link href="/host" className="text-gray-600 hover:text-gray-900">Host your home</Link></li>
              <li><Link href="/resources" className="text-gray-600 hover:text-gray-900">Resources</Link></li>
            </ul>
          </div>

          
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          {/* Trust Badges - Payment & Security */}
          <div className="mb-6">
            <div className="flex flex-col items-center gap-4">
              {/* Secure Payment Badge */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-medium">Secure SSL Payment</span>
              </div>

              {/* Payment Methods */}
              <div className="flex items-center gap-4 flex-wrap justify-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-gray-200">
                  {/* Visa */}
                  <div className="text-blue-700 font-bold text-sm">VISA</div>
                  {/* Mastercard */}
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-red-500 opacity-80"></div>
                    <div className="w-5 h-5 rounded-full bg-orange-400 opacity-80 -ml-3"></div>
                  </div>
                  {/* PayPal */}
                  <div className="text-blue-600 font-bold text-sm">PayPal</div>
                  {/* Amex */}
                  <div className="text-blue-500 font-bold text-xs">AMEX</div>
                </div>
              </div>

              {/* Trust Certifications */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verified Hosts</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>256-bit Encryption</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Houseiana. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
