'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Globe, Menu, ChevronLeft, User, Mail, Phone, MapPin, Shield, AlertCircle, Check, X, Eye, EyeOff } from 'lucide-react';

export default function PersonalInfoPage() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  // User data state
  const [userData, setUserData] = useState({
    legalName: { firstName: 'Mohamed', lastName: 'Elsayed' },
    preferredName: '',
    email: 'm••••d@gmail.com',
    emailFull: 'mohamed@gmail.com',
    phone: '+974 •••• ••89',
    phoneFull: '+974 5555 5589',
    governmentId: { verified: true, type: 'Passport' },
    address: '',
    emergencyContact: '',
  });

  const [formData, setFormData] = useState<any>({});
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const user = {
    name: 'Mohamed',
    avatar: 'M',
  };

  const handleEdit = (field: string) => {
    setEditingField(field);
    // Pre-populate form data based on field
    if (field === 'legalName') {
      setFormData({ firstName: userData.legalName.firstName, lastName: userData.legalName.lastName });
    } else if (field === 'email') {
      setFormData({ email: userData.emailFull });
    } else if (field === 'phone') {
      setFormData({ phone: userData.phoneFull });
    } else if (field === 'preferredName') {
      setFormData({ preferredName: userData.preferredName });
    } else if (field === 'address') {
      setFormData({ street: '', apt: '', city: '', state: '', zip: '', country: 'Qatar' });
    } else if (field === 'emergencyContact') {
      setFormData({ name: '', relationship: '', phone: '', email: '' });
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setFormData({});
  };

  const handleSave = () => {
    // In real app, this would save to backend
    setEditingField(null);
    setFormData({});
  };

  const InfoRow = ({ label, value, field, description, isVerified, verifiedLabel, notProvidedText = 'Not provided' }: {
    label: string;
    value?: any;
    field: string;
    description?: string;
    isVerified?: boolean;
    verifiedLabel?: string;
    notProvidedText?: string;
  }) => {
    const isEditing = editingField === field;

    return (
      <div className="py-6 border-b border-gray-200 last:border-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-gray-900 font-medium">{label}</h3>
            {!isEditing && (
              <>
                {value ? (
                  <p className="text-gray-500 mt-1">{value}</p>
                ) : (
                  <p className="text-gray-400 mt-1">{notProvidedText}</p>
                )}
                {isVerified && (
                  <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                    <Check className="w-4 h-4" />
                    <span>{verifiedLabel}</span>
                  </div>
                )}
                {description && !value && (
                  <p className="text-gray-400 text-sm mt-1">{description}</p>
                )}
              </>
            )}
          </div>
          {!isEditing && (
            <button
              onClick={() => handleEdit(field)}
              className="text-sm font-semibold text-gray-900 underline hover:text-gray-600"
            >
              {value || isVerified ? 'Edit' : 'Add'}
            </button>
          )}
        </div>

        {/* Edit Forms */}
        {isEditing && field === 'legalName' && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-500 mt-1">This is the name on your travel document, which could be a license or a passport.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isEditing && field === 'preferredName' && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-500">
              This is how your name will appear to hosts and guests.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred first name (optional)</label>
              <input
                type="text"
                value={formData.preferredName || ''}
                onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                placeholder="Preferred first name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isEditing && field === 'email' && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-500">
              Use an address you&apos;ll always have access to.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isEditing && field === 'phone' && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-500">
              Add a number so confirmed guests and Houseiana can get in touch. You can add other numbers and choose how they&apos;re used.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isEditing && field === 'address' && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-500">
              Use a permanent address where you can receive mail.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country/region</label>
              <select
                value={formData.country || 'Qatar'}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
              >
                <option>Qatar</option>
                <option>United Arab Emirates</option>
                <option>Saudi Arabia</option>
                <option>United States</option>
                <option>United Kingdom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street address</label>
              <input
                type="text"
                value={formData.street || ''}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apt, suite, bldg. (optional)</label>
              <input
                type="text"
                value={formData.apt || ''}
                onChange={(e) => setFormData({ ...formData, apt: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal code</label>
                <input
                  type="text"
                  value={formData.zip || ''}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isEditing && field === 'emergencyContact' && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-500">
              A trusted contact we can alert in an urgent situation.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contact's full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
              <input
                type="text"
                value={formData.relationship || ''}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                placeholder="e.g. Parent, Spouse, Friend"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">houseiana</span>
            </Link>

            {/* Right Menu */}
            <div className="flex items-center gap-2">
              <button className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-3 rounded-full transition-colors">
                List your home
              </button>
              <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                <Globe className="w-5 h-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 border border-gray-300 rounded-full p-1 pl-3 hover:shadow-md transition-shadow"
                >
                  <Menu className="w-4 h-4 text-gray-600" />
                  <div className="bg-teal-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{user.avatar}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/client-dashboard?tab=account" className="text-gray-500 hover:text-gray-900 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Account
          </Link>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Personal info</h1>
        <p className="text-gray-500 mb-8">Manage your personal details and how we can reach you.</p>

        {/* Info Sections */}
        <div className="divide-y divide-gray-200">
          <InfoRow
            label="Legal name"
            value={`${userData.legalName.firstName} ${userData.legalName.lastName}`}
            field="legalName"
          />

          <InfoRow
            label="Preferred first name"
            value={userData.preferredName}
            field="preferredName"
            notProvidedText="Not provided"
            description="This is how your first name will appear to hosts and guests."
          />

          <InfoRow
            label="Email address"
            value={
              <span className="flex items-center gap-2">
                {showEmail ? userData.emailFull : userData.email}
                <button
                  onClick={() => setShowEmail(!showEmail)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showEmail ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </span>
            }
            field="email"
          />

          <InfoRow
            label="Phone number"
            value={
              <span className="flex items-center gap-2">
                {showPhone ? userData.phoneFull : userData.phone}
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPhone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </span>
            }
            field="phone"
          />

          <InfoRow
            label="Government ID"
            value={userData.governmentId.verified ? userData.governmentId.type : null}
            field="governmentId"
            isVerified={userData.governmentId.verified}
            verifiedLabel="Verified"
          />

          <InfoRow
            label="Address"
            value={userData.address}
            field="address"
            notProvidedText="Not provided"
          />

          <InfoRow
            label="Emergency contact"
            value={userData.emergencyContact}
            field="emergencyContact"
            notProvidedText="Not provided"
            description="A trusted contact we can alert in an urgent situation."
          />
        </div>

        {/* Privacy Notice */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Which details can be edited?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Contact info and personal details can be edited. If this info was used to verify your identity, you&apos;ll need to get verified again the next time you book—or to continue hosting.
              </p>
            </div>
          </div>
        </div>

        {/* Data Sharing Notice */}
        <div className="mt-6 p-6 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What info is shared with others?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Houseiana only releases contact information for hosts and guests after a reservation is confirmed.
              </p>
              <button className="text-sm font-semibold text-gray-900 underline mt-3 hover:text-gray-600">
                Learn more about privacy
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>© 2024 Houseiana, Inc.</span>
              <span>·</span>
              <a href="#" className="hover:underline">Privacy</a>
              <span>·</span>
              <a href="#" className="hover:underline">Terms</a>
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
