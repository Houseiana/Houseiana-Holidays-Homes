'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquare, Headphones } from 'lucide-react';

interface Host {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  photo: string | null;
  properties: { id: string; title: string }[];
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (type: 'support' | 'host', data: any) => void;
  userId: string;
}

export default function NewConversationModal({
  isOpen,
  onClose,
  onCreateConversation,
  userId,
}: NewConversationModalProps) {
  const [conversationType, setConversationType] = useState<'support' | 'host' | null>(null);
  const [loading, setLoading] = useState(false);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'GENERAL_INQUIRY',
    priority: 'MEDIUM',
  });

  // Fetch hosts when modal opens and host type is selected
  useEffect(() => {
    if (isOpen && conversationType === 'host') {
      fetchHosts();
    }
  }, [isOpen, conversationType]);

  const fetchHosts = async () => {
    try {
      const response = await fetch('/api/users/hosts');
      const data = await response.json();
      if (data.success) {
        setHosts(data.data);
      }
    } catch (error) {
      console.error('Error fetching hosts:', error);
    }
  };

  if (!isOpen) return null;

  const handleCreateSupport = () => {
    // Open Zendesk widget instead of custom form
    if (window.zE) {
      window.zE('webWidget', 'open');
      onClose(); // Close this modal
    } else {
      // Fallback to custom form if Zendesk not loaded
      setConversationType('support');
    }
  };

  const handleCreateHost = () => {
    setConversationType('host');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onCreateConversation('support', formData);
  };

  const handleSelectHost = (host: Host) => {
    setSelectedHost(host);
  };

  const handleSendMessage = async () => {
    if (!selectedHost || !message.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/support-chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'GUEST_HOST',
          participant2Id: selectedHost.id,
          participant2Type: 'USER',
          title: `Chat with ${selectedHost.name}`,
          initialMessage: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create conversation');
      }

      const result = await response.json();

      // Trigger conversation creation callback
      onCreateConversation('host', result.data);

      // Reset and close
      setMessage('');
      setSelectedHost(null);
      setConversationType(null);
      setLoading(false);
      onClose();
    } catch (error) {
      console.error('Error creating host conversation:', error);
      alert(error instanceof Error ? error.message : 'Failed to create conversation');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedHost ? `Message ${selectedHost.name}` : 'Start New Conversation'}
          </h2>
          <button
            onClick={() => {
              setSelectedHost(null);
              setConversationType(null);
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Choose conversation type */}
          {!conversationType ? (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">Choose who you'd like to chat with:</p>

              {/* Support Option */}
              <button
                onClick={handleCreateSupport}
                disabled={loading}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Headphones className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Contact Support
                    </h3>
                    <p className="text-sm text-gray-600">
                      Get help from our customer support team with any questions or issues
                    </p>
                  </div>
                </div>
              </button>

              {/* Host Option */}
              <button
                onClick={handleCreateHost}
                disabled={loading}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Message a Host
                    </h3>
                    <p className="text-sm text-gray-600">
                      Chat with property hosts about your bookings or inquiries
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ) : conversationType === 'host' && !selectedHost ? (
            /* Step 2: Select a host */
            <div className="space-y-4">
              <button
                onClick={() => setConversationType(null)}
                className="text-sm text-blue-600 hover:underline mb-4"
              >
                ← Back
              </button>
              <p className="text-gray-600 mb-4">Select a host to message:</p>

              {hosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hosts available at the moment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {hosts.map((host) => (
                    <button
                      key={host.id}
                      onClick={() => handleSelectHost(host)}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                          {host.firstName[0]}{host.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{host.name}</h4>
                          {host.properties.length > 0 && (
                            <p className="text-sm text-gray-600">
                              {host.properties.length} propert{host.properties.length === 1 ? 'y' : 'ies'}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : conversationType === 'host' && selectedHost ? (
            /* Step 3: Write message to host */
            <div className="space-y-4">
              <button
                onClick={() => setSelectedHost(null)}
                className="text-sm text-blue-600 hover:underline mb-4"
              >
                ← Back to host list
              </button>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                    {selectedHost.firstName[0]}{selectedHost.lastName[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedHost.name}</h4>
                    <p className="text-sm text-gray-600">Property Host</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="Write your message here..."
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !message.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
                <button
                  onClick={() => setSelectedHost(null)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : conversationType === 'support' && !loading ? (
            /* Support form fallback */
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <button
                onClick={() => setConversationType(null)}
                type="button"
                className="text-sm text-blue-600 hover:underline mb-4"
              >
                ← Back
              </button>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="GENERAL_INQUIRY">General Inquiry</option>
                  <option value="BOOKING_ISSUE">Booking Issue</option>
                  <option value="PAYMENT_ISSUE">Payment Problem</option>
                  <option value="PROPERTY_ISSUE">Property Listing</option>
                  <option value="ACCOUNT_ISSUE">Account Settings</option>
                  <option value="TECHNICAL_ISSUE">Technical Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Please describe your issue..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setConversationType(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Creating conversation...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!conversationType && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
