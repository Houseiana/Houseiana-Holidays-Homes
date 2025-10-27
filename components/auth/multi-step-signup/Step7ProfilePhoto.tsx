'use client';

import { useState, useRef } from 'react';
import { Upload, Facebook } from 'lucide-react';

interface Step7ProfilePhotoProps {
  onContinue: (photoUrl?: string) => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function Step7ProfilePhoto({ onContinue, onSkip, onBack }: Step7ProfilePhotoProps) {
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDone = () => {
    onContinue(uploadedPhoto || undefined);
  };

  const handleChangePhoto = () => {
    setUploadedPhoto(null);
  };

  if (uploadedPhoto) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="absolute top-6 left-6 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Header */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                STEP 1 OF 1
              </p>
              <h1 className="text-2xl font-semibold text-gray-900">
                Looking good!
              </h1>
            </div>

            {/* Photo Preview */}
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200">
                <img
                  src={uploadedPhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              This photo will be added to your profile. It will also be seen by hosts or guests, so be sure it doesn't include any personal or sensitive info.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDone}
                className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold transition-colors"
              >
                Done
              </button>

              <button
                onClick={handleChangePhoto}
                className="w-full py-4 bg-white border-2 border-gray-900 hover:bg-gray-50 text-gray-900 rounded-lg font-semibold transition-colors"
              >
                Change photo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Close Button */}
        <button
          onClick={onSkip}
          className="absolute top-6 right-6 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center mt-8">
          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              STEP 1 OF 1
            </p>
            <h1 className="text-2xl font-semibold text-gray-900">
              Add a profile photo
            </h1>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            Pick an image that shows your face. Hosts won't be able to see your profile photo until your reservation is confirmed.
          </p>

          {/* Profile Photo Placeholder */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Upload Options */}
          <div className="space-y-3">
            {/* Upload Button */}
            <button
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full py-4 px-4 border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 ${
                isDragging ? 'bg-gray-100' : 'bg-white'
              }`}
            >
              <Upload className="w-5 h-5 text-gray-900" />
              <span className="font-semibold text-gray-900">Upload a photo</span>
            </button>

            {/* Facebook Photo Button */}
            <button className="w-full py-4 px-4 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center gap-3 bg-white">
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Use Facebook photo</span>
            </button>

            {/* Skip Button */}
            <button
              onClick={onSkip}
              className="w-full py-4 text-gray-900 font-semibold underline hover:text-gray-700"
            >
              I'll do this later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
