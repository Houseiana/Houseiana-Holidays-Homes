'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Search, HelpCircle, MessageCircle, Mail, Phone, 
  ChevronRight, ChevronDown, FileText, Shield, CreditCard, Home
} from 'lucide-react';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const categories = [
    { id: 'booking', icon: CalendarIcon, title: 'Booking & Trips', desc: 'Reservations, cancellations, and trip details' },
    { id: 'hosting', icon: Home, title: 'Hosting', desc: 'Listing your home, earnings, and host tools' },
    { id: 'payments', icon: CreditCard, title: 'Payments', desc: 'Refunds, taxes, and payment methods' },
    { id: 'account', icon: Shield, title: 'Account & Safety', desc: 'Login, security, and profile settings' },
  ];

  const faqs = [
    {
      id: '1',
      question: 'How do I cancel my reservation?',
      answer: 'Go to "My Trips", select the reservation you want to cancel, and click "Cancel Booking". Refund amounts depend on the host\'s cancellation policy.'
    },
    {
      id: '2',
      question: 'When will I be charged?',
      answer: 'You will be charged as soon as the host accepts your booking request. For instant book properties, you are charged immediately upon booking.'
    },
    {
      id: '3',
      question: 'How do I contact my host?',
      answer: 'You can message your host directly through the "Messages" tab in your dashboard or from the trip details page.'
    },
    {
      id: '4',
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard encryption to protect your payment details. We never store your full credit card number.'
    }
  ];

  function CalendarIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
            <span className="font-bold text-xl text-gray-900">Help Center</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Back to Houseiana
          </Link>
        </div>
      </nav>

      {/* Hero Search */}
      <div className="bg-gray-900 py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
           <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl opacity-30" />
           <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-30" />
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">How can we help you?</h1>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search for answers (e.g. 'refund', 'check-in')" 
              className="w-full py-4 pl-12 pr-4 rounded-2xl text-lg outline-none focus:ring-4 focus:ring-orange-500/30 transition-all shadow-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 text-gray-900 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                <cat.icon size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{cat.title}</h3>
              <p className="text-sm text-gray-500">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <button 
                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ChevronDown 
                  size={20} 
                  className={`text-gray-500 transition-transform duration-300 ${openFaq === faq.id ? 'rotate-180' : ''}`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === faq.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-4 pt-0 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Options */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-10 max-w-xl mx-auto">Our support team is available 24/7 to assist you with any issues or questions you may have.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="flex items-center gap-3 px-8 py-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all w-full sm:w-auto">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <MessageCircle size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Chat with us</p>
                <p className="text-xs text-gray-500">Wait time: ~2 mins</p>
              </div>
            </button>

            <button className="flex items-center gap-3 px-8 py-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all w-full sm:w-auto">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Mail size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Email Support</p>
                <p className="text-xs text-gray-500">Response: ~24 hours</p>
              </div>
            </button>

            <button className="flex items-center gap-3 px-8 py-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all w-full sm:w-auto">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Phone size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Call Us</p>
                <p className="text-xs text-gray-500">Available 9am-5pm</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 text-center text-sm text-gray-500">
        <p>© 2024 Houseiana Help Center. All rights reserved.</p>
      </footer>
    </div>
  );
}
