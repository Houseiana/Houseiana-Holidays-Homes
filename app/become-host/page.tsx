'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Home,
  Calendar,
  Users,
  DollarSign,
  Shield,
  HelpCircle,
  Star,
  Banknote,
  Clock,
  UserCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Step {
  number: number;
  icon: string;
  title: string;
  description: string;
}

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  location: string;
  image: string;
  rating: number;
  earnings: string;
  quote: string;
}

interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

export default function BecomeHost() {
  const router = useRouter();
  const [nightlyRate, setNightlyRate] = useState(150);
  const [nightsPerMonth, setNightsPerMonth] = useState(15);
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      question: 'How much does it cost to list my property?',
      answer: 'Listing your property on Houseiana is completely free. We only charge a small service fee when you receive a booking.',
      isOpen: false
    },
    {
      question: 'How do I get paid?',
      answer: 'Payments are processed securely and transferred directly to your bank account. You typically receive payment 24 hours after a guest checks in.',
      isOpen: false
    },
    {
      question: 'What if a guest damages my property?',
      answer: 'All hosts are covered by our $1M Host Protection Insurance at no additional cost. We also verify all guests before they book.',
      isOpen: false
    },
    {
      question: 'Can I choose who stays at my property?',
      answer: 'Yes! You have complete control over accepting or declining booking requests. You can also set specific requirements for guests.',
      isOpen: false
    },
    {
      question: 'How long does it take to list my property?',
      answer: 'Most hosts complete their listing in under 10 minutes. You can save your progress and come back anytime.',
      isOpen: false
    },
    {
      question: 'What support do you provide to hosts?',
      answer: 'We offer 24/7 customer support, a comprehensive Host Resource Center, and a community forum where you can connect with other hosts.',
      isOpen: false
    }
  ]);

  // How it works steps
  const steps: Step[] = [
    {
      number: 1,
      icon: 'home',
      title: 'List your space',
      description: 'Create a free listing with photos, details, and pricing in just 10 minutes'
    },
    {
      number: 2,
      icon: 'calendar',
      title: 'Set your schedule',
      description: 'Choose when your property is available and set your own house rules'
    },
    {
      number: 3,
      icon: 'users',
      title: 'Welcome guests',
      description: 'Connect with verified guests and provide them with an amazing experience'
    },
    {
      number: 4,
      icon: 'dollar',
      title: 'Get paid securely',
      description: 'Receive payments directly to your account with our secure payment system'
    }
  ];

  // Benefits
  const benefits: Benefit[] = [
    {
      icon: 'shield',
      title: 'Host Protection',
      description: 'Up to $1M in property damage protection at no cost to you'
    },
    {
      icon: 'support',
      title: '24/7 Support',
      description: 'Our dedicated team is always here to help you and your guests'
    },
    {
      icon: 'star',
      title: 'Top Visibility',
      description: 'Get featured on our platform and reach millions of travelers'
    },
    {
      icon: 'money',
      title: 'Easy Earnings',
      description: 'Set your own prices and get paid fast with secure transactions'
    },
    {
      icon: 'flexible',
      title: 'Full Control',
      description: 'You decide when to host, who to accept, and how to run your space'
    },
    {
      icon: 'community',
      title: 'Host Community',
      description: 'Join thousands of hosts and access exclusive tips and resources'
    }
  ];

  // Host testimonials
  const testimonials: Testimonial[] = [
    {
      name: 'Sarah Johnson',
      location: 'Dubai, UAE',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
      rating: 5,
      earnings: '$3,200/month',
      quote: 'Hosting on Houseiana has been incredible. The platform is easy to use, and I love meeting guests from around the world!'
    },
    {
      name: 'Michael Chen',
      location: 'Doha, Qatar',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
      rating: 5,
      earnings: '$2,800/month',
      quote: 'The best decision I made was listing my property here. Great support team and consistent bookings.'
    },
    {
      name: 'Emma Williams',
      location: 'Abu Dhabi, UAE',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
      rating: 5,
      earnings: '$4,100/month',
      quote: 'I love the flexibility and earning potential. The host protection gives me peace of mind.'
    }
  ];

  const calculateEarnings = (): number => {
    return nightlyRate * nightsPerMonth;
  };

  const calculateYearlyEarnings = (): number => {
    return calculateEarnings() * 12;
  };

  const toggleFaq = (index: number): void => {
    setFaqs(prev => prev.map((faq, i) =>
      i === index ? { ...faq, isOpen: !faq.isOpen } : faq
    ));
  };

  const onGetStarted = (): void => {
    router.push('/register');
  };

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'home': return <Home className="w-6 h-6" />;
      case 'calendar': return <Calendar className="w-6 h-6" />;
      case 'users': return <Users className="w-6 h-6" />;
      case 'dollar': return <DollarSign className="w-6 h-6" />;
      default: return <Home className="w-6 h-6" />;
    }
  };

  const getBenefitIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield': return <Shield className="w-8 h-8" />;
      case 'support': return <HelpCircle className="w-8 h-8" />;
      case 'star': return <Star className="w-8 h-8" />;
      case 'money': return <Banknote className="w-8 h-8" />;
      case 'flexible': return <Clock className="w-8 h-8" />;
      case 'community': return <UserCheck className="w-8 h-8" />;
      default: return <Shield className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Earn extra income by hosting on{' '}
                <span className="text-indigo-600">Houseiana</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Share your space with travelers from around the world and turn your property into a source of income
              </p>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">$2,500+</h3>
                  <p className="text-sm text-gray-600">Average monthly earnings</p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">1M+</h3>
                  <p className="text-sm text-gray-600">Active hosts worldwide</p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">4.8★</h3>
                  <p className="text-sm text-gray-600">Average host rating</p>
                </div>
              </div>

              <button
                onClick={onGetStarted}
                className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <p className="text-sm text-gray-500 mt-4">Free to list • No upfront costs • Cancel anytime</p>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
                alt="Beautiful home interior"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">Verified & Trusted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Estimate your earnings</h2>
            <p className="text-lg text-gray-600">See how much you could earn by hosting your property</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="nightlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Nightly rate
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="nightlyRate"
                      value={nightlyRate}
                      onChange={(e) => setNightlyRate(Number(e.target.value))}
                      min="50"
                      max="1000"
                      className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="nightsPerMonth" className="block text-sm font-medium text-gray-700 mb-2">
                    Nights per month
                  </label>
                  <input
                    type="number"
                    id="nightsPerMonth"
                    value={nightsPerMonth}
                    onChange={(e) => setNightsPerMonth(Number(e.target.value))}
                    min="1"
                    max="30"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly earnings</span>
                    <span className="text-2xl font-bold text-gray-900">${calculateEarnings().toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Yearly potential</span>
                      <span className="text-3xl font-bold text-indigo-600">${calculateYearlyEarnings().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-6 text-center">
              * Earnings are estimates and may vary based on location, season, and property type
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-lg text-gray-600">Get started in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">{step.number}</span>
                </div>
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {getStepIcon(step.icon)}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why host with Houseiana</h2>
            <p className="text-lg text-gray-600">Everything you need to succeed as a host</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                  {getBenefitIcon(benefit.icon)}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host Testimonials */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hear from our hosts</h2>
            <p className="text-lg text-gray-600">See what successful hosts are saying</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{testimonial.earnings}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
            <p className="text-lg text-gray-600">Everything you need to know about hosting</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {faq.isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {faq.isOpen && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start hosting?</h2>
          <p className="text-xl text-indigo-100 mb-8">Join thousands of hosts earning extra income on Houseiana</p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Hosting Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          <p className="text-sm text-indigo-200 mt-4">Takes less than 10 minutes to get started</p>
        </div>
      </section>
    </div>
  );
}