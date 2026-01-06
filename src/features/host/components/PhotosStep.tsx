import { PropertyFormData } from '../types';
import { Camera, X } from 'lucide-react';

interface PhotosStepProps {
  listing: PropertyFormData;
  setListing: (listing: PropertyFormData) => void;
}

export const PhotosStep = ({ listing, setListing }: PhotosStepProps) => {
  const handlePhotoUpload = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files);
      setListing({
        ...listing,
        photos: [...listing.photos, ...newPhotos].slice(0, 20)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-gray-400 transition-colors cursor-pointer group">
        <div className="flex flex-col items-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handlePhotoUpload(e.target.files)}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
              <Camera className="w-10 h-10 text-gray-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Add your photos here</h3>
            <p className="text-gray-500 mb-6">Add at least 5 photos</p>
            <span className="px-6 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              Upload from your device
            </span>
          </label>
        </div>
      </div>

      {listing.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {listing.photos.map((photo, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(photo)}
                alt={`Photo ${index + 1}`}
                className="w-full aspect-square object-cover rounded-xl"
              />
              <button
                onClick={() => setListing({ ...listing, photos: listing.photos.filter((_, i) => i !== index) })}
                className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-900" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
