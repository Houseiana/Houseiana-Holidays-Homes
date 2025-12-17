'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Shield, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  AccountHeader,
  AccountFooter,
  AccountBreadcrumb,
  InfoRow,
  EditFormActions
} from '@/components/account';
import { AccountAPI } from '@/lib/backend-api';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  email: string;
  emailMasked: string;
  emailVerified: boolean;
  phone: string;
  phoneMasked: string;
  phoneVerified: boolean;
  imageUrl: string;
  address: {
    street: string;
    apt: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  } | null;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  } | null;
  governmentId: {
    verified: boolean;
    type: string | null;
  };
}

export default function PersonalInfoPage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<any>({});
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await AccountAPI.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Redirect if not signed in
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, router]);

  // Fetch profile on mount
  useEffect(() => {
    if (isSignedIn) {
      fetchProfile();
    }
  }, [isSignedIn, fetchProfile]);

  const handleEdit = (field: string) => {
    setEditingField(field);
    setSaveMessage(null);

    // Pre-populate form data based on field
    if (field === 'legalName' && profile) {
      setFormData({ firstName: profile.firstName, lastName: profile.lastName });
    } else if (field === 'email' && profile) {
      setFormData({ email: profile.email });
    } else if (field === 'phone' && profile) {
      setFormData({ phone: profile.phone });
    } else if (field === 'preferredName' && profile) {
      setFormData({ preferredName: profile.preferredName || '' });
    } else if (field === 'address' && profile) {
      setFormData(profile.address || { street: '', apt: '', city: '', state: '', zip: '', country: 'Qatar' });
    } else if (field === 'emergencyContact' && profile) {
      setFormData(profile.emergencyContact || { name: '', relationship: '', phone: '', email: '' });
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setFormData({});
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (!editingField) return;

    try {
      setIsSaving(true);
      setSaveMessage(null);

      const response = await AccountAPI.updateProfile(editingField, formData);

      if (response.success) {
        if (response.data?.requiresVerification) {
          setSaveMessage({ type: 'success', text: response.data.message });
        } else {
          setSaveMessage({ type: 'success', text: 'Saved successfully!' });
          // Refresh profile data
          await fetchProfile();
          setEditingField(null);
          setFormData({});
        }
      } else {
        setSaveMessage({ type: 'error', text: response.error || 'Failed to save' });
      }
    } catch (error) {
      console.error('Error saving:', error);
      setSaveMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setIsSaving(false);
    }
  };

  // Format address for display
  const formatAddress = (address: UserProfile['address']) => {
    if (!address) return '';
    const parts = [address.street, address.apt, address.city, address.state, address.zip, address.country].filter(Boolean);
    return parts.join(', ');
  };

  // Format emergency contact for display
  const formatEmergencyContact = (contact: UserProfile['emergencyContact']) => {
    if (!contact || !contact.name) return '';
    return `${contact.name} (${contact.relationship})`;
  };

  // Edit form components
  const LegalNameForm = () => (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-500 mt-1">This is the name on your travel document, which could be a license or a passport.</p>
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}
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
      <EditFormActions
        onSave={handleSave}
        onCancel={handleCancel}
        saveText={isSaving ? 'Saving...' : 'Save'}
      />
    </div>
  );

  const PreferredNameForm = () => (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-500">
        This is how your name will appear to hosts and guests.
      </p>
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}
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
      <EditFormActions
        onSave={handleSave}
        onCancel={handleCancel}
        saveText={isSaving ? 'Saving...' : 'Save'}
      />
    </div>
  );

  const EmailForm = () => (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-500">
        Use an address you&apos;ll always have access to.
      </p>
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        />
      </div>
      <p className="text-xs text-gray-400">A verification email will be sent to confirm your new address.</p>
      <EditFormActions
        onSave={handleSave}
        onCancel={handleCancel}
        saveText={isSaving ? 'Saving...' : 'Save'}
      />
    </div>
  );

  const PhoneForm = () => (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-500">
        Add a number so confirmed guests and Houseiana can get in touch. You can add other numbers and choose how they&apos;re used.
      </p>
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
        <input
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+974 XXXX XXXX"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        />
      </div>
      <p className="text-xs text-gray-400">A verification code will be sent to confirm your number.</p>
      <EditFormActions
        onSave={handleSave}
        onCancel={handleCancel}
        saveText={isSaving ? 'Saving...' : 'Save'}
      />
    </div>
  );

  const AddressForm = () => (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-500">
        Use a permanent address where you can receive mail.
      </p>
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}
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
          <option>Kuwait</option>
          <option>Bahrain</option>
          <option>Oman</option>
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
      <EditFormActions
        onSave={handleSave}
        onCancel={handleCancel}
        saveText={isSaving ? 'Saving...' : 'Save'}
      />
    </div>
  );

  const EmergencyContactForm = () => (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-500">
        A trusted contact we can alert in an urgent situation.
      </p>
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}
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
      <EditFormActions
        onSave={handleSave}
        onCancel={handleCancel}
        saveText={isSaving ? 'Saving...' : 'Save'}
      />
    </div>
  );

  // Loading state
  if (!isSignedIn || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const userAvatar = user.firstName?.charAt(0).toUpperCase() || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-white">
      <AccountHeader userAvatar={userAvatar} />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        <AccountBreadcrumb />

        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Personal info</h1>
        <p className="text-gray-500 mb-8">Manage your personal details and how we can reach you.</p>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            <span className="ml-3 text-gray-600">Loading your profile...</span>
          </div>
        ) : profile ? (
          <>
            {/* Info Sections */}
            <div className="divide-y divide-gray-200">
              <InfoRow
                label="Legal name"
                value={`${profile.firstName} ${profile.lastName}`}
                field="legalName"
                isEditing={editingField === 'legalName'}
                onEdit={() => handleEdit('legalName')}
                editForm={<LegalNameForm />}
              />

              <InfoRow
                label="Preferred first name"
                value={profile.preferredName}
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
                    {showEmail ? profile.email : profile.emailMasked}
                    <button
                      onClick={() => setShowEmail(!showEmail)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showEmail ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {profile.emailVerified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                    )}
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
                  profile.phone ? (
                    <span className="flex items-center gap-2">
                      {showPhone ? profile.phone : profile.phoneMasked}
                      <button
                        onClick={() => setShowPhone(!showPhone)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPhone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {profile.phoneVerified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                      )}
                    </span>
                  ) : undefined
                }
                field="phone"
                notProvidedText="Not provided"
                isEditing={editingField === 'phone'}
                onEdit={() => handleEdit('phone')}
                editForm={<PhoneForm />}
              />

              <InfoRow
                label="Government ID"
                value={profile.governmentId.verified ? profile.governmentId.type : undefined}
                field="governmentId"
                isVerified={profile.governmentId.verified}
                verifiedLabel="Verified"
                notProvidedText="Not provided"
                isEditing={editingField === 'governmentId'}
                onEdit={() => handleEdit('governmentId')}
              />

              <InfoRow
                label="Address"
                value={formatAddress(profile.address)}
                field="address"
                notProvidedText="Not provided"
                isEditing={editingField === 'address'}
                onEdit={() => handleEdit('address')}
                editForm={<AddressForm />}
              />

              <InfoRow
                label="Emergency contact"
                value={formatEmergencyContact(profile.emergencyContact)}
                field="emergencyContact"
                notProvidedText="Not provided"
                description="A trusted contact we can alert in an urgent situation."
                isEditing={editingField === 'emergencyContact'}
                onEdit={() => handleEdit('emergencyContact')}
                editForm={<EmergencyContactForm />}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-600">Unable to load profile. Please try again.</p>
          </div>
        )}

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
