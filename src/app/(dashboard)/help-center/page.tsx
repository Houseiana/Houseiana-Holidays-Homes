/**
 * Support Page
 * Help desk tickets with real-time chat integration
 */
'use client';

import { useUser } from '@clerk/nextjs';
import ContactSupportButton from '@/components/messaging/ContactSupportButton';

export default function SupportPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Help & Support</h1>

      {/* Quick Help */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Help Center</h3>
          <p className="text-sm text-gray-600 mb-4">
            Browse articles and guides
          </p>
          <button className="text-blue-600 font-medium text-sm hover:underline">
            Visit Help Center
          </button>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
          <p className="text-sm text-gray-600 mb-4">
            Chat with our support team instantly
          </p>
          <ContactSupportButton
            userType={user?.publicMetadata?.isHost ? 'host' : 'client'}
            className="!bg-green-600 hover:!bg-green-700"
          >
            Start Live Chat Now
          </ContactSupportButton>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">📞</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
          <p className="text-sm text-gray-600 mb-4">
            Call us for urgent issues
          </p>
          <button className="text-purple-600 font-medium text-sm hover:underline">
            +974 XXXX XXXX
          </button>
        </div>
      </div>

      {/* Use Intercom for support instead of form */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Need Help?</h2>
          <p className="text-gray-700 mb-6">
            Our support team is here 24/7. Click the chat button in the bottom-right corner or use
            the Live Chat option above to get instant help!
          </p>
          <ContactSupportButton
            userType={user?.publicMetadata?.isHost ? 'host' : 'client'}
            className="!bg-blue-600 hover:!bg-blue-700"
          >
            Open Live Chat
          </ContactSupportButton>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <details className="bg-white rounded-lg p-4 border border-gray-200">
            <summary className="font-medium text-gray-900 cursor-pointer">
              How do I cancel a booking?
            </summary>
            <p className="mt-3 text-sm text-gray-600">
              You can cancel a booking from the "My Trips" page. Click on the booking you want
              to cancel and select "Cancel Booking". Please note that cancellation policies vary
              by property and refunds depend on how far in advance you cancel.
            </p>
          </details>

          <details className="bg-white rounded-lg p-4 border border-gray-200">
            <summary className="font-medium text-gray-900 cursor-pointer">
              How do I become a host?
            </summary>
            <p className="mt-3 text-sm text-gray-600">
              You can become a host by going to your Profile page and clicking "Become a Host".
              Once approved, you'll be able to list your properties and start earning.
            </p>
          </details>

          <details className="bg-white rounded-lg p-4 border border-gray-200">
            <summary className="font-medium text-gray-900 cursor-pointer">
              What payment methods do you accept?
            </summary>
            <p className="mt-3 text-sm text-gray-600">
              We accept all major credit cards (Visa, Mastercard, American Express), debit cards,
              and digital wallets. All payments are processed securely through our payment
              provider Stripe.
            </p>
          </details>

          <details className="bg-white rounded-lg p-4 border border-gray-200">
            <summary className="font-medium text-gray-900 cursor-pointer">
              How do I contact a host?
            </summary>
            <p className="mt-3 text-sm text-gray-600">
              Once you have a confirmed booking, you can message the host directly through the
              "Messages" page. You can also find the "Message Host" button on your booking
              details in the "My Trips" page.
            </p>
          </details>

          <details className="bg-white rounded-lg p-4 border border-gray-200">
            <summary className="font-medium text-gray-900 cursor-pointer">
              What is your refund policy?
            </summary>
            <p className="mt-3 text-sm text-gray-600">
              Refund policies vary by property. Most properties offer full refunds for
              cancellations made 7+ days before check-in, partial refunds for 3-7 days before,
              and no refund for cancellations within 3 days of check-in. Check the specific
              property's cancellation policy before booking.
            </p>
          </details>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Still need help?
        </h3>
        <p className="text-gray-700 mb-4">
          Our support team is available 24/7 to assist you. You can reach us through any of the
          following channels:
        </p>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Email:</strong> support@houseiana.com
          </p>
          <p>
            <strong>Phone:</strong> +974 XXXX XXXX
          </p>
          <p>
            <strong>Hours:</strong> 24/7 Support
          </p>
          <p>
            <strong>Average Response Time:</strong> Within 2 hours
          </p>
        </div>
      </div>
    </div>
  );
}
