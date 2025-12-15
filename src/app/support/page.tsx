'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import {
  Home, Globe, Menu, Search, ChevronRight, ChevronDown, ChevronUp, MessageCircle,
  Phone, Mail, CreditCard, Calendar, Key, Shield, Star, Heart, DollarSign,
  BookOpen, Headphones, FileText, Users, XCircle, Home as HomeIcon, User
} from 'lucide-react';

interface Topic {
  icon: any;
  title: string;
  description: string;
  articles: string[];
}

interface FAQ {
  question: string;
  answer: string;
}

interface PopularArticle {
  title: string;
  icon: any;
}

export default function SupportPage() {
  const { isSignedIn, user } = useUser();
  const [activeTab, setActiveTab] = useState<'guest' | 'host'>('guest');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const userName = isSignedIn && user ? (user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0] || 'there') : 'there';
  const userAvatar = isSignedIn && user ? (user.firstName?.charAt(0).toUpperCase() || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase() || 'U') : 'U';

  // Guest topics
  const guestTopics: Topic[] = [
    {
      icon: Calendar,
      title: 'Booking and reservations',
      description: 'Make, modify, or cancel a reservation',
      articles: ['How to book a place', 'Cancellation policies', 'Change your reservation', 'Request a refund'],
    },
    {
      icon: CreditCard,
      title: 'Payments and pricing',
      description: 'Payment methods, pricing, and refunds',
      articles: ['Payment methods', 'When you\'ll be charged', 'Refund timing', 'Price breakdown'],
    },
    {
      icon: Key,
      title: 'Check-in and access',
      description: 'Arriving at your stay',
      articles: ['Check-in instructions', 'Self check-in', 'Contact your host', 'Early check-in requests'],
    },
    {
      icon: Shield,
      title: 'Safety and accessibility',
      description: 'Stay safe during your trip',
      articles: ['Emergency support', 'Report a safety issue', 'Accessibility features', 'Travel advisories'],
    },
    {
      icon: Star,
      title: 'Reviews',
      description: 'Write and manage reviews',
      articles: ['How reviews work', 'Write a review', 'Edit a review', 'Review policies'],
    },
    {
      icon: Heart,
      title: 'Wishlists and saved',
      description: 'Save places for later',
      articles: ['Create a wishlist', 'Share wishlists', 'Manage saved homes'],
    },
  ];

  // Host topics
  const hostTopics: Topic[] = [
    {
      icon: HomeIcon,
      title: 'Your listings',
      description: 'Create and manage your listings',
      articles: ['Create a listing', 'Edit listing details', 'Photos and descriptions', 'Listing status'],
    },
    {
      icon: Calendar,
      title: 'Reservations and bookings',
      description: 'Manage guest reservations',
      articles: ['Accept or decline requests', 'Reservation requirements', 'Calendar and availability', 'Booking settings'],
    },
    {
      icon: DollarSign,
      title: 'Earnings and payouts',
      description: 'Get paid for hosting',
      articles: ['Payout methods', 'When you\'ll get paid', 'Transaction history', 'Taxes and reporting'],
    },
    {
      icon: Users,
      title: 'Guest communication',
      description: 'Connect with your guests',
      articles: ['Message guests', 'Pre-booking messages', 'House rules', 'Response rate tips'],
    },
    {
      icon: Shield,
      title: 'Host protection',
      description: 'Coverage and support for hosts',
      articles: ['Host damage protection', 'Host liability insurance', 'Report guest damage', 'Resolution center'],
    },
    {
      icon: Star,
      title: 'Reviews and ratings',
      description: 'Build your reputation',
      articles: ['How host reviews work', 'Respond to reviews', 'Improve your ratings', 'Superhost program'],
    },
  ];

  // FAQs
  const guestFaqs: FAQ[] = [
    {
      question: 'How do I cancel my reservation?',
      answer: 'To cancel a reservation, go to your Trips, select the reservation you want to cancel, and click "Cancel reservation." The refund amount depends on the host\'s cancellation policy and how far in advance you cancel.',
    },
    {
      question: 'When will I be charged for my booking?',
      answer: 'For most bookings, you\'ll be charged the full amount when your reservation is confirmed. For longer stays, you may have the option to pay in installments. The exact timing depends on your payment method and the booking details.',
    },
    {
      question: 'What if there\'s a problem with my stay?',
      answer: 'Contact your host first through the Houseiana app. If they can\'t resolve the issue, contact our support team within 72 hours. Take photos of any problems as documentation.',
    },
    {
      question: 'How do I contact my host?',
      answer: 'You can message your host directly through the Houseiana app or website. Go to your Trips, select the reservation, and tap "Message host." All communication should stay within Houseiana for your protection.',
    },
    {
      question: 'Can I get a refund if I need to cancel?',
      answer: 'Refund eligibility depends on the host\'s cancellation policy and when you cancel. Review the cancellation policy before booking. In certain circumstances, like documented emergencies, additional refund considerations may apply.',
    },
  ];

  const hostFaqs: FAQ[] = [
    {
      question: 'How do I get started as a host?',
      answer: 'Click "List your home" and follow the steps to create your listing. You\'ll add photos, descriptions, house rules, and pricing. Once published, guests can start booking your space.',
    },
    {
      question: 'When will I receive my payout?',
      answer: 'Payouts are typically released 24 hours after your guest\'s scheduled check-in time. The time it takes to arrive depends on your payout method. Bank transfers usually take 3-5 business days.',
    },
    {
      question: 'What are Houseiana\'s host fees?',
      answer: 'Houseiana charges a 3% service fee on each booking, which is deducted from your payout. This fee helps cover payment processing, 24/7 support, and platform maintenance.',
    },
    {
      question: 'How do I handle a difficult guest?',
      answer: 'Document any issues with photos and messages within the app. Contact our support team if you need assistance. For safety concerns, contact local authorities first, then reach out to our emergency line.',
    },
    {
      question: 'What protection do I have as a host?',
      answer: 'Houseiana provides host damage protection for eligible claims. We also offer secure payment processing, guest verification, and 24/7 support. Review our Host Protection guidelines for full details.',
    },
  ];

  const currentTopics = activeTab === 'guest' ? guestTopics : hostTopics;
  const currentFaqs = activeTab === 'guest' ? guestFaqs : hostFaqs;

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Popular articles (quick links)
  const popularArticles: PopularArticle[] = [
    { title: 'Cancel your reservation', icon: XCircle },
    { title: 'Payment methods', icon: CreditCard },
    { title: 'Change your booking', icon: Calendar },
    { title: 'Contact your host', icon: MessageCircle },
    { title: 'Refund policies', icon: DollarSign },
    { title: 'Check-in help', icon: Key },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">houseiana</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link href="/host-dashboard/add-listing">
                <button className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-3 rounded-full transition-colors">
                  List your home
                </button>
              </Link>
              <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                <Globe className="w-5 h-5" />
              </button>

              <div className="relative">
                <button className="flex items-center gap-3 border border-gray-300 rounded-full p-1 pl-3 hover:shadow-md transition-shadow">
                  <Menu className="w-4 h-4 text-gray-600" />
                  {isSignedIn ? (
                    <div className="bg-teal-500 rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{userAvatar}</span>
                    </div>
                  ) : (
                    <div className="bg-gray-500 rounded-full w-8 h-8 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Hi {userName}, how can we help?</h1>
          <p className="text-teal-100 mb-8">Search our help center or browse topics below</p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-teal-300 shadow-lg"
            />
          </div>

          {/* Popular searches */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-teal-200 text-sm">Popular:</span>
            {['Cancel booking', 'Refund', 'Payment', 'Check-in'].map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* User Type Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setActiveTab('guest')}
              className={`px-8 py-3 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'guest'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Guest
            </button>
            <button
              onClick={() => setActiveTab('host')}
              className={`px-8 py-3 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'host'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Host
            </button>
          </div>
        </div>

        {/* Quick Links - Popular Articles */}
        {activeTab === 'guest' && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular articles</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularArticles.map((article, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
                    <article.icon className="w-6 h-6 text-teal-500" />
                  </div>
                  <span className="text-sm text-gray-700 text-center font-medium">{article.title}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Browse Topics */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Browse {activeTab === 'guest' ? 'guest' : 'host'} topics
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTopics.map((topic, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                    <topic.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{topic.description}</p>
                    <ul className="space-y-1">
                      {topic.articles.slice(0, 3).map((article, i) => (
                        <li key={i}>
                          <Link href="#" className="text-sm text-gray-600 hover:text-teal-600 hover:underline flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" />
                            {article}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently asked questions</h2>
          <div className="space-y-3">
            {currentFaqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-12">
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Need more help?</h2>
              <p className="text-gray-600">Our support team is here for you 24/7</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Message Support */}
              <button
                onClick={() => setShowContactModal(true)}
                className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-teal-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-1">Message us</h3>
                  <p className="text-sm text-gray-500">Chat with our support team</p>
                </div>
              </button>

              {/* Call Support */}
              <a
                href="tel:+97444444444"
                className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                  <Phone className="w-7 h-7 text-teal-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-1">Call us</h3>
                  <p className="text-sm text-gray-500">+974 4444 4444</p>
                </div>
              </a>

              {/* Email Support */}
              <a
                href="mailto:support@houseiana.net"
                className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                  <Mail className="w-7 h-7 text-teal-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-1">Email us</h3>
                  <p className="text-sm text-gray-500">support@houseiana.net</p>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Community */}
            <Link href="#" className="flex items-start gap-4 p-6 border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Community Center</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Connect with other guests and hosts. Share stories, ask questions, and get advice from the community.
                </p>
                <span className="text-sm font-medium text-teal-600 flex items-center gap-1">
                  Visit Community <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Host Resources */}
            <Link href="#" className="flex items-start gap-4 p-6 border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Resource Center</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Tips, guides, and best practices for hosts. Learn how to improve your listings and grow your business.
                </p>
                <span className="text-sm font-medium text-teal-600 flex items-center gap-1">
                  Explore Resources <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Safety */}
            <Link href="#" className="flex items-start gap-4 p-6 border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Trust & Safety</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Learn about our safety policies, verification process, and how we protect both guests and hosts.
                </p>
                <span className="text-sm font-medium text-teal-600 flex items-center gap-1">
                  Learn More <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Policies */}
            <Link href="#" className="flex items-start gap-4 p-6 border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Policies & Guidelines</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Review our terms of service, cancellation policies, and community guidelines.
                </p>
                <span className="text-sm font-medium text-teal-600 flex items-center gap-1">
                  View Policies <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowContactModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-teal-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Support</h2>
                <p className="text-gray-600">We typically respond within a few hours</p>
              </div>

              {/* Issue Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">What can we help you with?</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none">
                  <option>Select a topic</option>
                  <option>Booking or reservation</option>
                  <option>Payments or refunds</option>
                  <option>Account issues</option>
                  <option>Problem with a stay</option>
                  <option>Host inquiry</option>
                  <option>Technical issue</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Reservation (if applicable) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Related reservation (optional)</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none">
                  <option>No reservation selected</option>
                  {/* TODO: Populate from user's actual reservations */}
                </select>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">How can we help?</label>
                <textarea
                  rows={4}
                  placeholder="Describe your issue or question..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Submit */}
              <button className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all">
                Send message
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                For urgent safety concerns, please call our emergency line at +974 4444 4444
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900 hover:underline">Help Center</Link></li>
                <li><Link href="#" className="hover:text-gray-900 hover:underline">Safety information</Link></li>
                <li><Link href="#" className="hover:text-gray-900 hover:underline">Cancellation options</Link></li>
                <li><Link href="#" className="hover:text-gray-900 hover:underline">Report a concern</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Hosting</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900 hover:underline">List your home</Link></li>
                <li><Link href="#" className="hover:text-gray-900 hover:underline">Host resources</Link></li>
                <li><Link href="#" className="hover:text-gray-900 hover:underline">Community forum</Link></li>
                <li><Link href="#" className="hover:text-gray-900 hover:underline">Responsible hosting</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Houseiana</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900 hover:underline">About us</Link></li>
                <li><Link href="#" className="hover:text-gray-900 hover:underline">Careers</Link></li>
                <li><Link href="#" className="hover:text-gray-900 hover:underline">Press</Link></li>
                <li><Link href="#" className="hover:text-gray-900 hover:underline">Investors</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Travel Services</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900 hover:underline">Meet & Assist</Link></li>
                <li><Link href="#" className="hover:text-gray-900 hover:underline">VIP Lounge Access</Link></li>
                <li><Link href="#" className="hover:text-gray-900 hover:underline">Airport Transfers</Link></li>
                <li><Link href="#" className="hover:text-gray-900 hover:underline">Travel Insurance</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>© 2024 Houseiana, Inc.</span>
                <span>·</span>
                <Link href="#" className="hover:underline">Privacy</Link>
                <span>·</span>
                <Link href="#" className="hover:underline">Terms</Link>
                <span>·</span>
                <Link href="#" className="hover:underline">Sitemap</Link>
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
        </div>
      </footer>
    </div>
  );
}
