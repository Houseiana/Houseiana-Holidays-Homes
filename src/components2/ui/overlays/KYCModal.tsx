'use client';

import { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';

interface KYCModalProps {
  isOpen: boolean;
  onClose?: () => void; // Optional - modal is mandatory for first-time users
  onComplete: () => void;
}

export default function KYCModal({ isOpen, onClose, onComplete }: KYCModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    idCopy: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [idCopyPreview, setIdCopyPreview] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFormData({ ...formData, idCopy: file });
      setError('');

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setIdCopyPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setIdCopyPreview(''); // PDF - no preview
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate all fields
      if (!formData.firstName || !formData.lastName || !formData.idNumber || !formData.idCopy) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      // Upload ID copy first
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.idCopy);
      uploadFormData.append('type', 'id_document');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        setError('Failed to upload ID document');
        setLoading(false);
        return;
      }

      // Submit KYC data
      const response = await fetch('/api/auth/complete-kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          idNumber: formData.idNumber,
          idCopy: uploadData.url
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update local storage with new user data
        const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
        user.firstName = formData.firstName;
        user.lastName = formData.lastName;
        user.name = `${formData.firstName} ${formData.lastName}`;
        user.hasCompletedKYC = true;
        localStorage.setItem('auth_user', JSON.stringify(user));

        // Call completion callback
        onComplete();
      } else {
        setError(data.message || 'Failed to submit KYC information');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Complete Your Profile</h2>
              <p className="text-orange-100 text-sm mt-1">Required for account verification</p>
            </div>
            {/* Only show close button if onClose is provided (not mandatory) */}
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:text-orange-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Alert */}
          <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-medium">Why we need this information</p>
              <p className="mt-1 text-orange-700">
                This information is required to verify your identity and comply with regulations.
                Your data is securely encrypted and never shared.
              </p>
            </div>
          </div>

          {/* Legal First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900 mb-2">
              Legal First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="As shown on your ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          {/* Legal Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900 mb-2">
              Legal Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="As shown on your ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          {/* ID Number */}
          <div>
            <label htmlFor="idNumber" className="block text-sm font-semibold text-gray-900 mb-2">
              ID Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="idNumber"
              value={formData.idNumber}
              onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              placeholder="National ID or Passport number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          {/* ID Copy Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              ID Document Copy <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {idCopyPreview ? (
                    <div className="relative">
                      <img
                        src={idCopyPreview}
                        alt="ID Preview"
                        className="h-20 object-contain rounded"
                      />
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                        <Upload className="w-4 h-4" />
                      </div>
                    </div>
                  ) : formData.idCopy ? (
                    <div className="flex items-center gap-2">
                      <Upload className="w-8 h-8 text-orange-500" />
                      <p className="text-sm text-gray-600">{formData.idCopy.name}</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-orange-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (max. 5MB)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit and Continue'
            )}
          </button>

          {/* Security Notice */}
          <p className="text-xs text-gray-500 text-center">
            🔒 Your information is encrypted and securely stored
          </p>
        </form>
      </div>
    </div>
  );
}
