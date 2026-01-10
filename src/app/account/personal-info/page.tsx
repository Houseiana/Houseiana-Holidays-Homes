'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Shield, AlertCircle, Eye, EyeOff, Loader2, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import {

  AccountFooter,
  AccountBreadcrumb,
  InfoRow,
  EditFormActions
} from '@/features/auth/components';
import { AccountService } from '@/features/auth/api/auth.service';
import { AccountAPI, LookupsAPI } from '@/lib/backend-api';
import { PhoneInput } from '@/components/ui/phone-input';
import { useCountries, useCities } from '@/hooks/use-locations';

interface PassportInfo {
  passportNumber: string;
  numberMasked: string;
  issuingCountry: string;
  issueDate: string;
  expiryDate: string;
  documentUrl: string | null;
}

interface Gender {
  id: string;
  name: string;
}

interface NationalIdInfo {
  number: string;
  numberMasked: string;
  issuingCountry: string;
  issueDate: string;
  expiryDate: string;
  frontImageUrl: string | null;
  backImageUrl: string | null;
}

interface EmergencyContact {
  fullName: string;
  relationship: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  genderId: 'male' | 'female' | null;
  email: string;
  emailMasked: string;
  emailVerified: boolean;
  phone: string;
  phoneMasked: string;
  phoneVerified: boolean;
  imageUrl: string;
  nationality: string | null;
  address: {
    street: string;
    apt: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  } | null;
  residencyCountry: string | null;
  passport: PassportInfo | null;
  nationalId: NationalIdInfo | null;
  emergencyContact: EmergencyContact | null;
}



export default function PersonalInfoPage() {
  const { countries } = useCountries();
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
  const [showPassportNumber, setShowPassportNumber] = useState(false);
  const [showIdNumber, setShowIdNumber] = useState(false);
  const [genderOptions, setGenderOptions] = useState<any[]>([]);

  const selectedCountry = countries.find(c => c.name === (formData.country || 'Qatar'));
  const { cities } = useCities(selectedCountry?.id);

  // File upload states
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);
  const idFrontInputRef = useRef<HTMLInputElement>(null);
  const idBackInputRef = useRef<HTMLInputElement>(null);
  const [relationshipOptions, setRelationshipOptions] = useState<any[]>([]);

  const fetchRelationshipOptions = useCallback(async () => {
    try {
      const response = await AccountService.getRelationshipOptions();
      if (response.success && response.data) {
        setRelationshipOptions(response.data);
      }
    } catch (error) {
      console.error('Error fetching relationship options:', error);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      // Fetch relationship options in parallel or just call it here if we want strict loading
      fetchRelationshipOptions();
      setIsLoading(true);
        const [genderResponse, profileResponse, passportResponse, nationalIdResponse, emergencyContactResponse] = await Promise.all([
        LookupsAPI.getGenders(),
        AccountAPI.getProfile(user?.id || ''),
        AccountAPI.getPassport(user?.id || ''),
        AccountAPI.getNationalId(user?.id || ''),
        AccountAPI.getEmergencyContact(user?.id || '')
      ]);

      if (genderResponse.success && genderResponse.data) {
        setGenderOptions(genderResponse.data.data);
      }

      if (profileResponse.success && profileResponse.data) {
        const data = profileResponse.data as any;
        const passportData = passportResponse.success ? passportResponse.data : null; 
        const nationalIdData = nationalIdResponse.success ? nationalIdResponse.data : null;
        const emergencyContactData = emergencyContactResponse.success ? emergencyContactResponse.data.data : null; 

        setProfile({
          id: data.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          dateOfBirth: data.dateOfBirth || null,
          genderId: data.genderId || null,
          gender: data.gender || null,
          email: data.email || '',
          emailMasked: data.emailMasked || '',
          emailVerified: data.emailVerified || false,
          phone: data.phone || '',
          phoneMasked: data.phoneMasked || '',
          phoneVerified: data.phoneVerified || false,
          imageUrl: data.imageUrl || '',
          nationality: data.nationality || null,
          address: data.address || null,
          residencyCountry: data.residencyCountry || null,
          passport: passportData || data.passport || null,
          nationalId: nationalIdData || data.nationalId || null,
          emergencyContact: emergencyContactData || null,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      fetchProfile();
    }
  }, [isSignedIn, fetchProfile]);

  const toInputDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  const handleEdit = (field: string) => {
    setEditingField(field);
    setSaveMessage(null);
    setPassportFile(null);
    setIdFrontFile(null);
    setIdBackFile(null);

    if (field === 'legalName' && profile) {
      setFormData({ firstName: profile.firstName, lastName: profile.lastName });
    } else if (field === 'dateOfBirth' && profile) {
      setFormData({ dateOfBirth: toInputDate(profile.dateOfBirth) });
    } else if (field === 'genderId' && profile) {
      setFormData({ genderId: profile.genderId || '' });
    } else if (field === 'phone' && profile) {
      setFormData({ phone: profile.phone });
    } else if (field === 'email' && profile) {
      setFormData({ email: profile.email });
    } else if (field === 'nationality' && profile) {
      setFormData({ nationality: profile.nationality || '' });
    } else if (field === 'address' && profile) {
      setFormData(profile.address || { street: '', apt: '', city: '', state: '', zip: '', country: 'Qatar' });
    } else if (field === 'residencyCountry' && profile) {
      setFormData({ residencyCountry: profile.residencyCountry || '' });
    } else if (field === 'passport' && profile) {
      setFormData({
        ...(profile.passport || {
          passportNumber: '',
          issuingCountry: '',
          issueDate: '',
          expiryDate: '',
        }),
        issueDate: toInputDate(profile.passport?.issueDate),
        expiryDate: toInputDate(profile.passport?.expiryDate)
      });
    } else if (field === 'nationalId' && profile) {
      setFormData({
        ...(profile.nationalId || {
          number: '',
          issuingCountry: '',
          issueDate: '',
          expiryDate: '',
        }),
        issueDate: toInputDate(profile.nationalId?.issueDate),
        expiryDate: toInputDate(profile.nationalId?.expiryDate)
      });
    } else if (field === 'emergencyContact' && profile) {
      setFormData(profile.emergencyContact || {
        fullName: '',
        relationship: '',
        phoneNumber: '',
        whatsappNumber: '',
        email: '',
      });
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setFormData({});
    setSaveMessage(null);
    setPassportFile(null);
    setIdFrontFile(null);
    setIdBackFile(null);
  };

  const handleSave = async () => {
    if (!editingField) return;

    try {
      setIsSaving(true);
      setSaveMessage(null);

      // Handle file uploads if present
      let uploadData = { ...formData };

      if (editingField === 'passport' && passportFile) {
        // In a real app, upload the file first and get the URL
        uploadData.documentFile = passportFile;
      }

      if (editingField === 'nationalId') {
        const formDataPayload = new FormData();
        
        // Map fields to user requested keys
        if (formData.number) formDataPayload.append('idNumber', formData.number);
        if (formData.issuingCountry) formDataPayload.append('issuingCountry', formData.issuingCountry);
        
        // Ensure dates are in the correct format (ISO string or just date part depending on strictness, user showed ISO)
        // Using toISOString() as requested example showed full ISO format
        if (formData.issueDate) {
          try {
            formDataPayload.append('issueDate', new Date(formData.issueDate).toISOString());
          } catch(e) {
             formDataPayload.append('issueDate', formData.issueDate);
          }
        }
        
        if (formData.expiryDate) {
          try {
            formDataPayload.append('expiryDate', new Date(formData.expiryDate).toISOString());
          } catch(e) {
             formDataPayload.append('expiryDate', formData.expiryDate);
          }
        }
        
        if (idFrontFile) formDataPayload.append('idFrontPhoto', idFrontFile);
        if (idBackFile) formDataPayload.append('idBackPhoto', idBackFile);

        uploadData = formDataPayload;
      }

      // Age validation
      if (editingField === 'dateOfBirth' && formData.dateOfBirth) {
        const birthDate = new Date(formData.dateOfBirth);
        if (isNaN(birthDate.getTime())) {
           setSaveMessage({ type: 'error', text: 'Please enter a valid date' });
           setIsSaving(false);
           return;
        }

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
           setSaveMessage({ type: 'error', text: 'Legally its not allowed to register if you under 18 years' });
           setIsSaving(false);
           return;
        }
      }

      let response;
      if (editingField === 'passport') {
         response = await AccountAPI.updatePassport(user?.id || '', uploadData);
      } else if (editingField === 'nationalId') {
         response = await AccountAPI.addNationalId(user?.id || '', uploadData);
      } else if (editingField === 'emergencyContact') {
         // Map form data to API keys (email -> emailAddress)
         const apiData = {
           fullName: formData.fullName,
           relationship: formData.relationship,
           phoneNumber: formData.phoneNumber,
           whatsappNumber: formData.whatsappNumber,
           emailAddress: formData.email
         };
         response = await AccountAPI.addEmergencyContact(user?.id || '', apiData);
      } else if (editingField === 'address') {
         const apiData = {
           userId: user?.id,
           cityId: Number(formData.cityId),
           streetAddress: formData.street,
           buildingNumber: formData.apt,
           postalCode: formData.zip,
           latitude: null,
           longitude: null 
         };
         response = await AccountAPI.updateAddress(apiData);
      } else {
         response = await AccountAPI.updateProfile(user?.id || '', uploadData);
      }

      if (response.success) {
        if (response.data?.requiresVerification) {
          setSaveMessage({ type: 'success', text: response.data.message });
        } else {
          setSaveMessage({ type: 'success', text: 'Saved successfully!' });
          await fetchProfile();
          setEditingField(null);
          setFormData({});
          setPassportFile(null);
          setIdFrontFile(null);
          setIdBackFile(null);
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

  const formatAddress = (address: UserProfile['address']) => {
    if (!address) return '';
    const parts = [address.street, address.apt, address.city, address.state, address.zip, address.country].filter(Boolean);
    return parts.join(', ');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

 
const formatGender = (genderId: string | null | undefined) => {
  if (!genderId) return '';
  return genderOptions.find(g => g.id === genderId)?.name || '';
};

  const formatPassportSummary = (passport: PassportInfo | null) => {
    if (!passport || !passport.passportNumber) return '';
    return `${passport.numberMasked || passport.passportNumber} - ${passport.issuingCountry || 'N/A'}`;
  };

  const formatNationalIdSummary = (nationalId: NationalIdInfo | null) => {
    if (!nationalId || !nationalId.number) return '';
    return `${nationalId.numberMasked || nationalId.number} - ${nationalId.issuingCountry || 'N/A'}`;
  };

  const formatEmergencyContactSummary = (contact: EmergencyContact | null) => {
    if (!contact || !contact.fullName) return '';
    return `${contact.fullName} (${relationshipOptions.find(r => r.id === contact.relationship)?.name || 'N/A'})`;
  };

  // File upload component
  const FileUploadBox = ({
    label,
    file,
    existingUrl,
    inputRef,
    onFileChange,
    onRemove,
    accept = "image/*,.pdf"
  }: {
    label: string;
    file: File | null;
    existingUrl: string | null;
    inputRef: React.RefObject<HTMLInputElement>;
    onFileChange: (file: File | null) => void;
    onRemove: () => void;
    accept?: string;
  }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-500 transition-colors">
      <input
        type="file"
        ref={inputRef}
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        accept={accept}
        className="hidden"
      />
      {file ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span className="text-sm text-gray-700 truncate max-w-[200px]">{file.name}</span>
          </div>
          <button onClick={onRemove} className="text-red-500 hover:text-red-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : existingUrl ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700">Document uploaded</span>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="text-sm text-teal-600 hover:text-teal-800 font-medium"
          >
            Replace
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full"
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, or PDF up to 10MB</p>
        </button>
      )}
    </div>
  );

  // Form components
  const renderLegalNameForm = () => (
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
      <EditFormActions onSave={handleSave} onCancel={handleCancel} saveText={isSaving ? 'Saving...' : 'Save'} />
    </div>
  );

  const renderDateOfBirthForm = () => (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-500">Your date of birth as it appears on your official documents.</p>
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
        <input
          type="date"
          value={formData.dateOfBirth || ''}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        />
      </div>
      <EditFormActions onSave={handleSave} onCancel={handleCancel} saveText={isSaving ? 'Saving...' : 'Save'} />
    </div>
  );

  const renderGenderForm = () => (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-500">Select your genderId.</p>
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
        <select
          value={formData.genderId || ''}
          onChange={(e) => setFormData({ ...formData, genderId: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
        >
          <option value="">Select genderId</option>
          {genderOptions.map((opt: any) => (
             <option key={opt.id || opt.value || opt} value={opt.id || opt.value || opt}>
               {opt.name || opt.label || opt}
             </option>
          ))}
        </select>
      </div>
      <EditFormActions onSave={handleSave} onCancel={handleCancel} saveText={isSaving ? 'Saving...' : 'Save'} />
    </div>
  );

  const renderPhoneForm = () => (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-500">Add a number so confirmed guests and Houseiana can get in touch.</p>
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
        <PhoneInput
          value={formData.phone || ''}
          onChange={(value) => setFormData({ ...formData, phone: value })}
          placeholder=""
        />
      </div>
      <p className="text-xs text-gray-400">A verification code will be sent to confirm your number.</p>
      <EditFormActions onSave={handleSave} onCancel={handleCancel} saveText={isSaving ? 'Saving...' : 'Save'} />
    </div>
  );

  const renderEmailForm = () => (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-500">Use an address you&apos;ll always have access to.</p>
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
      <EditFormActions onSave={handleSave} onCancel={handleCancel} saveText={isSaving ? 'Saving...' : 'Save'} />
    </div>
  );

  const renderNationalityForm = () => (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-500">Your nationality as shown on your passport or ID.</p>
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
        <select
          value={formData.nationality || ''}
          onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
        >
          <option value="">Select nationality</option>
          {countries.map((country) => (
            <option key={country.id || country.name} value={country.name}>{country.name}</option>
          ))}
        </select>
      </div>
      <EditFormActions onSave={handleSave} onCancel={handleCancel} saveText={isSaving ? 'Saving...' : 'Save'} />
    </div>
  );

  const renderAddressForm = () => (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-500">Use a permanent address where you can receive mail.</p>
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
          {countries.map((country) => (
            <option key={country.id || country.name} value={country.name}>{country.name}</option>
          ))}
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
          <select
            value={formData.cityId || ''}
            onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
          >
            <option value="">Select city</option>
            {cities.map((city: any) => (
              <option key={city.id} value={city.id}>{city.name}</option>
            ))}
          </select>
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
      <EditFormActions onSave={handleSave} onCancel={handleCancel} saveText={isSaving ? 'Saving...' : 'Save'} />
    </div>
  );

  const renderResidencyCountryForm = () => (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-500">The country where you currently reside.</p>
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Country of residency</label>
        <select
          value={formData.residencyCountry || ''}
          onChange={(e) => setFormData({ ...formData, residencyCountry: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
        >
          <option value="">Select country</option>
          {countries.map((country) => (
            <option key={country.id || country.name} value={country.name}>{country.name}</option>
          ))}
        </select>
      </div>
      <EditFormActions onSave={handleSave} onCancel={handleCancel} saveText={isSaving ? 'Saving...' : 'Save'} />
    </div>
  );

  const renderPassportForm = () => (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-500">Your passport information as shown on your travel document.</p>
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
        <input
          type="text"
          value={formData.passportNumber || ''}
          onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
          placeholder="Enter your passport number"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Country</label>
        <select
          value={formData.issuingCountry || ''}
          onChange={(e) => setFormData({ ...formData, issuingCountry: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
        >
          <option value="">Select country</option>
          {countries.map((country) => (
            <option key={country.id || country.name} value={country.name}>{country.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
          <input
            type="date"
            value={formData.issueDate || ''}
            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <input
            type="date"
            value={formData.expiryDate || ''}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Passport Copy</label>
        <FileUploadBox
          label="Upload passport copy"
          file={passportFile}
          existingUrl={profile?.passport?.documentUrl || null}
          inputRef={passportInputRef as React.RefObject<HTMLInputElement>}
          onFileChange={setPassportFile}
          onRemove={() => setPassportFile(null)}
        />
      </div>

      <EditFormActions onSave={handleSave} onCancel={handleCancel} saveText={isSaving ? 'Saving...' : 'Save'} />
    </div>
  );

  const renderNationalIdForm = () => (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-500">Your national ID or QID information.</p>
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
        <input
          type="text"
          value={formData.number || ''}
          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
          placeholder="Enter your ID number"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Country</label>
        <select
          value={formData.issuingCountry || ''}
          onChange={(e) => setFormData({ ...formData, issuingCountry: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
        >
          <option value="">Select country</option>
          {countries.map((country) => (
            <option key={country.id || country.name} value={country.name}>{country.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
          <input
            type="date"
            value={formData.issueDate || ''}
            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <input
            type="date"
            value={formData.expiryDate || ''}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Front Side</label>
          <FileUploadBox
            label="Upload front side"
            file={idFrontFile}
            existingUrl={profile?.nationalId?.frontImageUrl || null}
            inputRef={idFrontInputRef as React.RefObject<HTMLInputElement>}
            onFileChange={setIdFrontFile}
            onRemove={() => setIdFrontFile(null)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Back Side</label>
          <FileUploadBox
            label="Upload back side"
            file={idBackFile}
            existingUrl={profile?.nationalId?.backImageUrl || null}
            inputRef={idBackInputRef as React.RefObject<HTMLInputElement>}
            onFileChange={setIdBackFile}
            onRemove={() => setIdBackFile(null)}
          />
        </div>
      </div>

      <EditFormActions onSave={handleSave} onCancel={handleCancel} saveText={isSaving ? 'Saving...' : 'Save'} />
    </div>
  );

  const renderEmergencyContactForm = () => (
    <div className="mt-4 space-y-4">
       <p className="text-sm text-gray-500">A trusted contact we can reach in case of emergency.</p>
       {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contact name</label>
        <input
          type="text"
          value={formData.fullName || ''}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="Full name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
        <select
          value={formData.relationship || ''}
          onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
        >
          <option value="">Select relationship</option>
          {relationshipOptions.map((opt: any) => (
             <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
          <PhoneInput
            value={formData.phoneNumber || ''}
            onChange={(value) => setFormData({ ...formData, phoneNumber: value })}
            placeholder=""
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp number</label>
          <PhoneInput
            value={formData.whatsappNumber || ''}
            onChange={(value) => setFormData({ ...formData, whatsappNumber: value })}
            placeholder=""
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email address"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        />
      </div>

       <EditFormActions onSave={handleSave} onCancel={handleCancel} saveText={isSaving ? 'Saving...' : 'Save'} />
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AccountBreadcrumb current="Personal info" />
        
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Personal info</h1>

        {/* Profile Completion Alert */}
        {(!profile?.passport && !profile?.nationalId) && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-orange-800">Complete your profile</h3>
              <p className="text-sm text-orange-600 mt-1">
                Please add your government ID (Passport or National ID) to verify your identity and unlock booking features.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <InfoRow
            label="Legal name"
            field="legalName"
            value={profile ? `${profile.firstName} ${profile.lastName}` : ''}
            onEdit={() => handleEdit('legalName')}
            isEditing={editingField === 'legalName'}
            editForm={renderLegalNameForm()}
          />

          <InfoRow
            label="Date of birth"
            field="dateOfBirth"
            value={formatDate(profile?.dateOfBirth || null)}
            onEdit={() => handleEdit('dateOfBirth')}
            isEditing={editingField === 'dateOfBirth'}
            editForm={renderDateOfBirthForm()}
          />

          <InfoRow
            label="Gender"
            field="genderId"
            value={formatGender(profile?.genderId)}
            onEdit={() => handleEdit('genderId')}
            isEditing={editingField === 'genderId'}
            editForm={renderGenderForm()}
          />

          <InfoRow
            label="Email address"
            field="email"
            value={showEmail ? (profile?.email || '') : (profile?.emailMasked || '')}
            onEdit={() => handleEdit('email')}
            isEditing={editingField === 'email'}
            editForm={renderEmailForm()}
            action={
              <button
                onClick={() => setShowEmail(!showEmail)}
                className="text-sm underline text-gray-600 hover:text-gray-900"
              >
                {showEmail ? 'Hide' : 'Show'}
              </button>
            }
          />

          <InfoRow
            label="Phone number"
            field="phone"
            value={showPhone ? (profile?.phone || '') : (profile?.phoneMasked || '')}
            onEdit={() => handleEdit('phone')}
            isEditing={editingField === 'phone'}
            editForm={renderPhoneForm()}
            action={
              <button
                onClick={() => setShowPhone(!showPhone)}
                className="text-sm underline text-gray-600 hover:text-gray-900"
              >
                {showPhone ? 'Hide' : 'Show'}
              </button>
            }
          />

          <InfoRow
            label="Nationality"
            field="nationality"
            value={profile?.nationality}
            onEdit={() => handleEdit('nationality')}
            isEditing={editingField === 'nationality'}
            editForm={renderNationalityForm()}
          />

          <InfoRow
            label="Address"
            field="address"
            value={formatAddress(profile?.address || null)}
            onEdit={() => handleEdit('address')}
            isEditing={editingField === 'address'}
            editForm={renderAddressForm()}
          />
          
          <InfoRow
            label="Country of residency"
            field="residencyCountry"
            value={profile?.residencyCountry || ''}
            onEdit={() => handleEdit('residencyCountry')}
            isEditing={editingField === 'residencyCountry'}
            editForm={renderResidencyCountryForm()}
          />

          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Government ID</h2>
            
            <InfoRow
              label="Passport"
              field="passport"
              value={formatPassportSummary(profile?.passport || null)}
              onEdit={() => handleEdit('passport')}
              isEditing={editingField === 'passport'}
              editForm={renderPassportForm()}
              description="Add passport details"
            />

            <InfoRow
              label="National ID / QID"
              field="nationalId"
              value={formatNationalIdSummary(profile?.nationalId || null)}
              onEdit={() => handleEdit('nationalId')}
              isEditing={editingField === 'nationalId'}
              editForm={renderNationalIdForm()}
              description="Add national ID details"
            />
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h2>
            <InfoRow
              label="Emergency Contact"
              field="emergencyContact"
              value={formatEmergencyContactSummary(profile?.emergencyContact || null)}
              onEdit={() => handleEdit('emergencyContact')}
              isEditing={editingField === 'emergencyContact'}
              editForm={renderEmergencyContactForm()}
              description="Add emergency contact"
            />
          </div>
        </div>
      </main>
      <AccountFooter />
    </div>
  );
}
