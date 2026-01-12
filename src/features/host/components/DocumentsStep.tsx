import { PropertyFormData } from '../types';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface DocumentsStepProps {
  listing: PropertyFormData;
  setListing: (listing: PropertyFormData) => void;
}

export const DocumentsStep = ({ listing, setListing }: DocumentsStepProps) => {
  const handleFileChange = (field: keyof typeof listing.documentOfProperty, file: File | null) => {
    setListing({
      ...listing,
      documentOfProperty: {
        ...listing.documentOfProperty,
        [field]: file
      }
    });
  };

  const renderUploadBox = (
    field: keyof typeof listing.documentOfProperty,
    label: string,
    description: string
  ) => {
    const file = listing.documentOfProperty[field];

    return (
      <div className="bg-white border rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        
        {file ? (
          <div className="flex items-center justify-between p-4 bg-teal-50 border border-teal-100 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600" />
              <div>
                <p className="text-sm font-medium text-teal-900 truncate max-w-[200px]">
                  {file.name}
                </p>
                <p className="text-xs text-teal-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => handleFileChange(field, null)}
              className="p-1 hover:bg-teal-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-teal-600" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="mb-2 p-2 bg-gray-100 rounded-full">
                <Upload className="w-5 h-5 text-gray-500" />
              </div>
              <p className="mb-1 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400">PDF, JPG, PNG (MAX. 5MB)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(field, e.target.files[0]);
                }
              }}
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-left max-w-2xl mx-auto mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Required Documents</h2>
        <p className="text-gray-500 mt-2">
          Please provide the following documents to verify your property and identity.
          These documents are kept secure and confidential.
        </p>
      </div>

      <div className="space-y-4">
        {renderUploadBox(
          'PrpopertyDocoument',
          'Property Document',
          'Proof of ownership or lease agreement for the property.'
        )}
        
        {renderUploadBox(
          'HostId',
          'Host Verification ID',
          'A valid government-issued ID (Passport, National ID, etc.).'
        )}

        {renderUploadBox(
          'PowerOfAttorney',
          'Power of Attorney',
          'Required if you are managing this property on behalf of the owner.'
        )}
      </div>
    </div>
  );
};
