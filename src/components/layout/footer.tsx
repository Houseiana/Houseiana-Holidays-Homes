'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-600 hover:text-gray-900">About Us</Link></li>
              <li><Link href="/careers" className="text-gray-600 hover:text-gray-900">Careers</Link></li>
              <li><Link href="/press" className="text-gray-600 hover:text-gray-900">Press</Link></li>
              <li><Link href="/blog" className="text-gray-600 hover:text-gray-900">Blog</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-600 hover:text-gray-900">Help Center</Link></li>
              <li><Link href="/help/contact-support" className="text-gray-600 hover:text-gray-900">Contact Us</Link></li>
              <li><Link href="/safety" className="text-gray-600 hover:text-gray-900">Safety</Link></li>
              <li><Link href="/cancellation" className="text-gray-600 hover:text-gray-900">Cancellation Options</Link></li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Hosting</h3>
            <ul className="space-y-2">
              <li><Link href="/host" className="text-gray-600 hover:text-gray-900">Host your home</Link></li>
              <li><Link href="/resources" className="text-gray-600 hover:text-gray-900">Resources</Link></li>
              <li><Link href="/community" className="text-gray-600 hover:text-gray-900">Community</Link></li>
              <li><Link href="/responsible-hosting" className="text-gray-600 hover:text-gray-900">Responsible hosting</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="text-gray-600 hover:text-gray-900">Cookie Policy</Link></li>
              <li><Link href="/sitemap" className="text-gray-600 hover:text-gray-900">Sitemap</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            © {new Date().getFullYear()} Houseiana. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
