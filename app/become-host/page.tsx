'use client';

import { useState } from 'react';
import { Home, Globe, Menu, User, ChevronDown, CheckCircle2, ArrowRight } from 'lucide-react';

export default function BecomeHost() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [address, setAddress] = useState('');

  const faqCategories = {
    top: {
      title: 'Top questions',
      items: [
        {
          question: 'Is my place right for Houseiana?',
          answer: 'Houseiana guests are interested in all kinds of places—spare rooms, apartments, houses, vacation homes, and unique stays. Whether you have a cozy room or a luxury villa, there\'s a guest looking for exactly what you offer.'
        },
        {
          question: 'Do I have to host all the time?',
          answer: 'Not at all—you control your calendar. You can host once a year, a few nights a month, or more often. It\'s completely up to you when you want to welcome guests.'
        },
        {
          question: 'What are Houseiana\'s fees?',
          answer: 'It\'s free to create a listing, and Houseiana typically collects a service fee of 3% of the reservation subtotal once you get paid. In many areas, we automatically collect and pay sales and tourism taxes on your behalf.'
        },
      ]
    },
    basics: {
      title: 'Hosting basics',
      items: [
        {
          question: 'How do I get started?',
          answer: 'You can create a listing in just a few steps, all at your own pace. Start by telling us about your home, take some photos, and add details about what makes it unique.'
        },
        {
          question: 'How do I get my home ready for guests?',
          answer: 'Make sure your home is clean, clutter-free, and that everything is working properly. Items like fresh linens and stocked toiletries help create a comfortable and inviting place to stay.'
        },
        {
          question: 'How am I protected when I host?',
          answer: 'Houseiana provides secure payment processing and guest verification to help protect hosts. We also offer 24/7 customer support to assist with any issues that may arise during a stay.'
        },
        {
          question: 'Any tips on being a great host?',
          answer: 'From sharing a list of your favorite local places to responding quickly to guest messages, there are lots of ways to be an excellent host. Quick responses and personal touches go a long way!'
        },
      ]
    },
    policy: {
      title: 'Policy & regulations',
      items: [
        {
          question: 'Are there any regulations that apply in my area?',
          answer: 'Some areas have laws and regulations for hosting your home. It\'s important to familiarize yourself with any laws that may apply to your location. Also, depending on where you live, you may need to check with your HOA, read your lease agreement, or notify your landlord.'
        },
        {
          question: 'What if I have other questions?',
          answer: 'Local hosts are a great source for information and insights. We can connect you with an experienced Houseiana host in your area who may be able to answer additional questions.'
        },
      ]
    }
  };

  const FaqItem = ({ question, answer, isOpen, onClick }: {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
  }) => (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-start justify-between text-left"
      >
        <span className="text-lg font-medium text-gray-900 pr-4">{question}</span>
        <ChevronDown className={`w-6 h-6 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-6 pr-12">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">houseiana</span>
            </a>

            {/* Right Menu */}
            <div className="flex items-center gap-2">
              <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                <Globe className="w-5 h-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 border border-gray-300 rounded-full p-1 pl-3 hover:shadow-md transition-shadow"
                >
                  <Menu className="w-4 h-4 text-gray-600" />
                  <div className="bg-gray-500 rounded-full p-1.5">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 py-2">
                    <div className="border-b border-gray-200 pb-2">
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-50 font-semibold">Sign up</button>
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-50">Log in</button>
                    </div>
                    <div className="pt-2">
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-50">Help Center</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Your home could make money on Houseiana
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Join over 50,000 hosts in the Middle East earning extra income by sharing their space
            </p>

            {/* Earnings Calculator */}
            <div className="bg-white rounded-2xl p-6 text-gray-900 shadow-2xl max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your address to see your earning potential
              </label>
              <div className="relative mb-4">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Estimated earnings</p>
                  <p className="text-3xl font-bold text-teal-600">$1,200<span className="text-lg font-normal text-gray-500">/month</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">7 nights at</p>
                  <p className="text-lg font-semibold">$171/night</p>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 transition-all">
                Get started
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Estimates based on similar listings in your area
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Easy to List Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                It's easy to list your home on Houseiana
              </h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Create a listing for your place in just a few steps</h3>
                    <p className="text-gray-600">Add photos, details, and set your price in under 10 minutes</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Go at your own pace, and make changes whenever</h3>
                    <p className="text-gray-600">Update your calendar, pricing, and details anytime</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Get 1:1 support from experienced hosts at any time</h3>
                    <p className="text-gray-600">Our Superhost community is here to help you succeed</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
                alt="Beautiful home interior"
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              All the tools you need to host, all in one app
            </h2>
            <p className="text-xl text-gray-600">
              Manage everything from your phone with our easy-to-use host dashboard
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: '📝',
                title: 'Set up your listing',
                description: 'Take photos, set prices, and create an arrival guide'
              },
              {
                icon: '🏠',
                title: 'Get your home ready',
                description: 'Prepare, clean, and maintain your home'
              },
              {
                icon: '📅',
                title: 'Manage reservations',
                description: 'Stay on top of your bookings and guest messages'
              },
              {
                icon: '🤝',
                title: 'Assist your guests',
                description: 'Handle check-ins, checkouts, and onsite requests'
              },
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Not Only for Homeowners */}
      <section className="py-20 md:py-28 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Hosting isn't only for homeowners
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Whether you're renting an apartment or have a spare room, you can earn extra income by hosting when you're away or have space to share.
              </p>
              <button className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Learn more
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"
                alt="Modern apartment"
                className="rounded-3xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Your questions, answered
          </h2>

          {Object.entries(faqCategories).map(([key, category]) => (
            <div key={key} className="mb-12">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                {category.title}
              </h3>
              <div className="border-t border-gray-200">
                {category.items.map((item, index) => (
                  <FaqItem
                    key={index}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openFaq === `${key}-${index}`}
                    onClick={() => setOpenFaq(openFaq === `${key}-${index}` ? null : `${key}-${index}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-teal-500 to-teal-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to become a host?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join thousands of hosts earning extra income on Houseiana
          </p>
          <button className="bg-white text-teal-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
            Get started
          </button>
          <p className="text-teal-200 mt-4 text-sm">
            Takes less than 10 minutes to create your listing
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">Help Center</a></li>
                <li><a href="#" className="hover:underline">Safety information</a></li>
                <li><a href="#" className="hover:underline">Cancellation options</a></li>
                <li><a href="#" className="hover:underline">Report a concern</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hosting</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">List your home</a></li>
                <li><a href="#" className="hover:underline">Host resources</a></li>
                <li><a href="#" className="hover:underline">Responsible hosting</a></li>
                <li><a href="#" className="hover:underline">Community forum</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Houseiana</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">About us</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Press</a></li>
                <li><a href="#" className="hover:underline">Investors</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Travel Services</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">Meet & Assist</a></li>
                <li><a href="#" className="hover:underline">VIP Lounge Access</a></li>
                <li><a href="#" className="hover:underline">Airport Transfers</a></li>
                <li><a href="#" className="hover:underline">Local Experiences</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>© 2024 Houseiana, Inc.</span>
              <span>·</span>
              <a href="#" className="hover:underline">Privacy</a>
              <span>·</span>
              <a href="#" className="hover:underline">Terms</a>
              <span>·</span>
              <a href="#" className="hover:underline">Sitemap</a>
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
    </div>
  );
}
