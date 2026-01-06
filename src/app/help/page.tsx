'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  MessageCircle,
  Phone,
  Mail,
  HelpCircle,
  ChevronRight,
  Star,
  Clock,
  Users,
  Shield,
  Home,
  CreditCard,
  User,
  Settings,
  ArrowLeft
} from 'lucide-react';

interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  title: string;
  summary: string;
  views: number;
  helpful: number;
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  action: string;
}

export default function Help() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const helpCategories: HelpCategory[] = [
    {
      id: 'booking',
      title: 'Booking & Reservations',
      icon: 'home',
      articles: [
        {
          id: '1',
          title: 'How to make a reservation',
          summary: 'Step-by-step guide to booking your perfect stay',
          views: 15420,
          helpful: 89
        },
        {
          id: '2',
          title: 'Cancellation policies explained',
          summary: 'Understanding different cancellation options and refunds',
          views: 12330,
          helpful: 92
        },
        {
          id: '3',
          title: 'Modifying your reservation',
          summary: 'How to change dates, guests, or other booking details',
          views: 8940,
          helpful: 85
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      icon: 'credit-card',
      articles: [
        {
          id: '4',
          title: 'Payment methods accepted',
          summary: 'All the ways you can pay for your reservation',
          views: 11200,
          helpful: 88
        },
        {
          id: '5',
          title: 'Understanding your receipt',
          summary: 'Breakdown of charges, taxes, and fees',
          views: 9650,
          helpful: 84
        },
        {
          id: '6',
          title: 'Refund processing times',
          summary: 'When to expect your refund after cancellation',
          views: 7830,
          helpful: 91
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: 'user',
      articles: [
        {
          id: '7',
          title: 'Creating your account',
          summary: 'Setting up your Houseiana profile',
          views: 13450,
          helpful: 87
        },
        {
          id: '8',
          title: 'Verifying your identity',
          summary: 'Why verification helps keep our community safe',
          views: 10200,
          helpful: 82
        },
        {
          id: '9',
          title: 'Privacy settings',
          summary: 'Managing what information is visible to others',
          views: 6780,
          helpful: 90
        }
      ]
    },
    {
      id: 'hosting',
      title: 'Hosting',
      icon: 'settings',
      articles: [
        {
          id: '10',
          title: 'Getting started as a host',
          summary: 'Everything you need to know to list your property',
          views: 18920,
          helpful: 94
        },
        {
          id: '11',
          title: 'Setting your pricing',
          summary: 'Tips for competitive and profitable pricing',
          views: 14560,
          helpful: 89
        },
        {
          id: '12',
          title: 'Managing bookings',
          summary: 'How to handle reservations and guest communication',
          views: 12100,
          helpful: 91
        }
      ]
    },
    {
      id: 'safety',
      title: 'Safety & Security',
      icon: 'shield',
      articles: [
        {
          id: '13',
          title: 'Safety tips for guests',
          summary: 'How to stay safe during your travels',
          views: 9840,
          helpful: 96
        },
        {
          id: '14',
          title: 'Reporting concerns',
          summary: 'How to report safety issues or inappropriate behavior',
          views: 7650,
          helpful: 93
        },
        {
          id: '15',
          title: 'Travel insurance',
          summary: 'Understanding coverage options for your trip',
          views: 8320,
          helpful: 88
        }
      ]
    }
  ];

  const quickActions: QuickAction[] = [
    {
      title: 'Contact Support',
      description: 'Get help from our customer service team',
      icon: 'message-circle',
      action: 'contact'
    },
    {
      title: 'Live Chat',
      description: 'Chat with us in real-time',
      icon: 'message-circle',
      action: 'chat'
    },
    {
      title: 'Call Us',
      description: '24/7 phone support available',
      icon: 'phone',
      action: 'call'
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: 'mail',
      action: 'email'
    }
  ];

  const popularArticles = [
    {
      rank: 1,
      title: 'How to cancel a reservation',
      description: 'Learn about cancellation policies and how to get refunds',
      views: '24.5k views'
    },
    {
      rank: 2,
      title: 'What to do if your host cancels',
      description: 'Steps to take when your accommodation is cancelled',
      views: '18.2k views'
    },
    {
      rank: 3,
      title: 'Payment and billing questions',
      description: 'Understanding charges, fees, and payment methods',
      views: '16.8k views'
    }
  ];

  const searchHelp = () => {
    console.log('Searching for:', searchQuery);
  };

  const selectCategory = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'contact':
      case 'chat':
      case 'call':
      case 'email':
        console.log(`${action} action triggered`);
        break;
    }
  };

  const goBack = () => {
    router.back();
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'home': return <Home className="w-6 h-6" />;
      case 'credit-card': return <CreditCard className="w-6 h-6" />;
      case 'user': return <User className="w-6 h-6" />;
      case 'settings': return <Settings className="w-6 h-6" />;
      case 'shield': return <Shield className="w-6 h-6" />;
      default: return <HelpCircle className="w-6 h-6" />;
    }
  };

  const getQuickActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'message-circle': return <MessageCircle className="w-6 h-6" />;
      case 'phone': return <Phone className="w-6 h-6" />;
      case 'mail': return <Mail className="w-6 h-6" />;
      default: return <HelpCircle className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={goBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">How can we help you?</h1>
            <p className="text-lg text-gray-600 mb-8">Find answers to common questions or get in touch with our support team</p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchHelp()}
                  type="text"
                  placeholder="Search for help topics..."
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Quick Actions */}
          <div className="lg:col-span-4 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Need immediate help?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                      {getQuickActionIcon(action.icon)}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Help Categories */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse help topics</h2>
            <div className="space-y-4">
              {helpCategories.map((category) => (
                <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div
                    onClick={() => selectCategory(category.id)}
                    className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mr-4">
                        {getCategoryIcon(category.icon)}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${
                        selectedCategory === category.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>

                  {/* Articles List */}
                  {selectedCategory === category.id && (
                    <div className="border-t border-gray-200">
                      {category.articles.map((article) => (
                        <div key={article.id} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{article.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {article.views.toLocaleString()} views
                              </span>
                              <span className="flex items-center">
                                <Star className="w-3 h-3 mr-1 text-yellow-400" />
                                {article.helpful}% helpful
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Popular Articles */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular articles</h3>
              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {article.rank}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{article.title}</h4>
                      <p className="text-xs text-gray-600 mb-1">{article.description}</p>
                      <p className="text-xs text-gray-500">{article.views}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Still need help?</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Live Chat</h4>
                  <p className="text-sm text-gray-600 mb-3">Available 24/7 for immediate assistance</p>
                  <button
                    onClick={() => handleQuickAction('chat')}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Start Chat
                  </button>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Phone Support</h4>
                  <p className="text-sm text-gray-600 mb-3">Call us at +1-800-HOUSEIANA</p>
                  <button
                    onClick={() => handleQuickAction('call')}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Call Now
                  </button>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Email Support</h4>
                  <p className="text-sm text-gray-600 mb-3">Get detailed help via email</p>
                  <button
                    onClick={() => handleQuickAction('email')}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}