'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using Houseiana, you accept and agree to be bound by the terms and
              provisions of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Accounts</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              When you create an account with us, you must provide accurate and complete information.
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Maintaining the security of your account</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Property Listings</h2>
            <p className="text-gray-600 leading-relaxed">
              Hosts are responsible for the accuracy of their property listings, including descriptions,
              photos, availability, and pricing. All listings must comply with local laws and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Booking and Payments</h2>
            <p className="text-gray-600 leading-relaxed">
              All bookings are subject to acceptance by the host. Payment terms, cancellation policies,
              and refund procedures are outlined in our separate payment terms document.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Prohibited Activities</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Users must not:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Engage in fraudulent activities</li>
              <li>Harass or harm other users</li>
              <li>Interfere with the proper functioning of the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              Houseiana acts as a platform connecting guests and hosts. We are not responsible for the
              actual rental transactions or the condition of properties listed on our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@houseiana.com" className="text-teal-600 hover:underline">
                legal@houseiana.com
              </a>
            </p>
          </section>

          <p className="text-sm text-gray-500 pt-6 border-t border-gray-200">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
