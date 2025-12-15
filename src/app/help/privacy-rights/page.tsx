'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function PrivacyRightsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-8 h-8 text-teal-600" strokeWidth={2.5} />
              <span className="text-xl font-bold text-teal-600">Houseiana</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/help" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to help center
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-6">Your Privacy Rights</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              At Houseiana, we respect your privacy rights and are committed to protecting your personal
              information. This page explains your rights regarding your personal data and how you can
              exercise them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Right to Access</h3>
                <p className="text-gray-600">
                  You have the right to request a copy of the personal information we hold about you.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Right to Rectification</h3>
                <p className="text-gray-600">
                  You can request that we correct any inaccurate or incomplete personal information.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Right to Erasure</h3>
                <p className="text-gray-600">
                  Also known as the &quot;right to be forgotten,&quot; you can request that we delete your personal
                  data under certain circumstances.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Right to Restrict Processing</h3>
                <p className="text-gray-600">
                  You can request that we limit how we use your personal information.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Right to Data Portability</h3>
                <p className="text-gray-600">
                  You can request a copy of your data in a structured, commonly used format.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">6. Right to Object</h3>
                <p className="text-gray-600">
                  You can object to certain types of processing, including direct marketing.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">7. Rights Related to Automated Decision-Making</h3>
                <p className="text-gray-600">
                  You have the right not to be subject to decisions based solely on automated processing.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Exercise Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To exercise any of these rights, you can:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Access your account settings to update or delete information</li>
              <li>Contact us directly at <a href="mailto:privacy@houseiana.com" className="text-teal-600 hover:underline">privacy@houseiana.com</a></li>
              <li>Use the privacy controls in your account dashboard</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We will respond to your request within 30 days. In some cases, we may need to verify
              your identity before processing your request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Regional Privacy Rights</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">European Economic Area (EEA)</h3>
                <p className="text-gray-600">
                  If you are located in the EEA, you have additional rights under the General Data
                  Protection Regulation (GDPR), including the right to lodge a complaint with your
                  local data protection authority.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">California</h3>
                <p className="text-gray-600">
                  California residents have specific rights under the California Consumer Privacy Act
                  (CCPA), including the right to know what personal information is collected and the
                  right to opt-out of the sale of personal information.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions or Concerns</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about your privacy rights or concerns about how we handle
              your personal information, please don&apos;t hesitate to contact us at{' '}
              <a href="mailto:privacy@houseiana.com" className="text-teal-600 hover:underline">
                privacy@houseiana.com
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
