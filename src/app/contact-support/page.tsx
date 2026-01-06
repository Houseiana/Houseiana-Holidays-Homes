'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  User,
  AtSign,
  FileText,
  Send,
  CheckCircle
} from 'lucide-react';

interface SupportOption {
  id: 'email' | 'chat' | 'phone';
  title: string;
  description: string;
  icon: any;
  responseTime: string;
  available: boolean;
}

interface IssueCategory {
  value: string;
  label: string;
}

interface ContactFormData {
  name: string;
  email: string;
  category: string;
  bookingReference: string;
  subject: string;
  message: string;
}

export default function ContactSupport() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    category: '',
    bookingReference: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const supportOptions: SupportOption[] = [
    {
      id: 'email',
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: Mail,
      responseTime: 'Response within 24h',
      available: true
    },
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      responseTime: 'Instant response',
      available: true
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Speak directly with a support representative',
      icon: Phone,
      responseTime: 'Available 24/7',
      available: true
    }
  ];

  const issueCategories: IssueCategory[] = [
    { value: 'booking', label: 'Booking Issues' },
    { value: 'payment', label: 'Payment & Billing' },
    { value: 'account', label: 'Account Management' },
    { value: 'property', label: 'Property Concerns' },
    { value: 'host', label: 'Host Support' },
    { value: 'technical', label: 'Technical Problems' },
    { value: 'safety', label: 'Safety & Security' },
    { value: 'other', label: 'Other' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Contact form submitted:', formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startLiveChat = () => {
    // Simulate opening chat widget
    alert('Live chat feature would be integrated here');
  };

  const callSupport = () => {
    window.open('tel:+18004687342');
  };

  const goBack = () => {
    router.push('/help');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="py-6">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Help Center
            </button>

            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Contact Support
              </h1>
              <p className="text-gray-600 mt-2">Get help from our customer service team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Support Options */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-6">Choose how to contact us</h2>
            <div className="space-y-4">
              {supportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedOption === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedOption(option.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedOption === option.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{option.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {option.responseTime}
                        </div>
                      </div>
                      {selectedOption === option.id && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">

            {/* Email Form */}
            {selectedOption === 'email' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-6">Send us a message</h2>

                {/* Success Message */}
                {isSubmitted && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Message sent successfully!</h3>
                    <p className="text-gray-600">We&apos;ve received your message and will get back to you within 24 hours.</p>
                  </div>
                )}

                {/* Contact Form */}
                {!isSubmitted && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <User className="w-4 h-4" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <AtSign className="w-4 h-4" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="your.email@example.com"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <FileText className="w-4 h-4" />
                          Issue Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.category ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select a category</option>
                          {issueCategories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Booking Reference (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.bookingReference}
                          onChange={(e) => handleInputChange('bookingReference', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., BK123456"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Subject *
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.subject ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Brief description of your issue"
                      />
                      {errors.subject && (
                        <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Message *
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        rows={6}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                          errors.message ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Please provide as much detail as possible about your issue..."
                      />
                      {errors.message && (
                        <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {formData.message.length} characters
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all ${
                        isSubmitting
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      }`}
                    >
                      {isSubmitting ? (
                        <span>Sending...</span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Send Message
                        </span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Live Chat */}
            {selectedOption === 'chat' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Start Live Chat</h2>
                <p className="text-gray-600 mb-6">
                  Connect with our support team instantly. Average wait time: less than 2 minutes.
                </p>
                <button
                  onClick={startLiveChat}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Start Chatting Now
                </button>
              </div>
            )}

            {/* Phone Support */}
            {selectedOption === 'phone' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Call Us</h2>
                <p className="text-gray-600 mb-6">
                  Speak directly with our support team. We&apos;re available 24/7 to help you.
                </p>
                <div className="text-2xl font-bold text-gray-900 mb-2">+1-800-HOUSEIANA</div>
                <div className="text-lg text-gray-600 mb-6">(+1-800-468-7342)</div>
                <button
                  onClick={callSupport}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Call Now
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Additional Help */}
        <div className="mt-12 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Before contacting us</h3>
          <p className="text-gray-600 mb-4">You might find the answer you&apos;re looking for in our help center:</p>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => router.push('/help')}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Browse Help Articles
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push('/help')}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Frequently Asked Questions
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push('/help')}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Community Forum
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}