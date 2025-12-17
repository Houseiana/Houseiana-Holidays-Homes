'use client';

import { useState } from 'react';
import { Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import {
  AccountHeader,
  AccountFooter,
  AccountBreadcrumb,
  InfoRow,
  EditFormActions
} from '@/components/account';

export default function PersonalInfoPage() {
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

  // Edit form components
  const LegalNameForm = () => (
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
      <EditFormActions onSave={handleSave} onCancel={handleCancel} />
    </div>
  );

  const PreferredNameForm = () => (
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
      <EditFormActions onSave={handleSave} onCancel={handleCancel} />
    </div>
  );

  const EmailForm = () => (
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
      <EditFormActions onSave={handleSave} onCancel={handleCancel} />
    </div>
  );

  const PhoneForm = () => (
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
      <EditFormActions onSave={handleSave} onCancel={handleCancel} />
    </div>
  );

  const AddressForm = () => (
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
      <EditFormActions onSave={handleSave} onCancel={handleCancel} />
    </div>
  );

  const EmergencyContactForm = () => (
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
      <EditFormActions onSave={handleSave} onCancel={handleCancel} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <AccountHeader userAvatar="M" />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        <AccountBreadcrumb />

        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Personal info</h1>
        <p className="text-gray-500 mb-8">Manage your personal details and how we can reach you.</p>

        {/* Info Sections */}
        <div className="divide-y divide-gray-200">
          <InfoRow
            label="Legal name"
            value={`${userData.legalName.firstName} ${userData.legalName.lastName}`}
            field="legalName"
            isEditing={editingField === 'legalName'}
            onEdit={() => handleEdit('legalName')}
            editForm={<LegalNameForm />}
          />

          <InfoRow
            label="Preferred first name"
            value={userData.preferredName}
            field="preferredName"
            notProvidedText="Not provided"
            description="This is how your first name will appear to hosts and guests."
            isEditing={editingField === 'preferredName'}
            onEdit={() => handleEdit('preferredName')}
            editForm={<PreferredNameForm />}
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
            isEditing={editingField === 'email'}
            onEdit={() => handleEdit('email')}
            editForm={<EmailForm />}
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
            isEditing={editingField === 'phone'}
            onEdit={() => handleEdit('phone')}
            editForm={<PhoneForm />}
          />

          <InfoRow
            label="Government ID"
            value={userData.governmentId.verified ? userData.governmentId.type : undefined}
            field="governmentId"
            isVerified={userData.governmentId.verified}
            verifiedLabel="Verified"
            isEditing={editingField === 'governmentId'}
            onEdit={() => handleEdit('governmentId')}
          />

          <InfoRow
            label="Address"
            value={userData.address}
            field="address"
            notProvidedText="Not provided"
            isEditing={editingField === 'address'}
            onEdit={() => handleEdit('address')}
            editForm={<AddressForm />}
          />

          <InfoRow
            label="Emergency contact"
            value={userData.emergencyContact}
            field="emergencyContact"
            notProvidedText="Not provided"
            description="A trusted contact we can alert in an urgent situation."
            isEditing={editingField === 'emergencyContact'}
            onEdit={() => handleEdit('emergencyContact')}
            editForm={<EmergencyContactForm />}
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

      <AccountFooter />
    </div>
  );
}
