import { PropertyFormData } from '../types';
import { usePropertiesTypes } from '@/hooks/property/use-properties-types';

interface PropertyTypeStepProps {
  listing: PropertyFormData;
  setListing: (listing: PropertyFormData) => void;
}

export const PropertyTypeStep = ({ listing, setListing }: PropertyTypeStepProps) => {
  const { propertyTypes, loading } = usePropertiesTypes();

  if (loading) {
    return <div className="text-center py-10">Loading property types...</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {propertyTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => setListing({ ...listing, propertyType: type.id })}
          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-start gap-2 hover:border-gray-900 ${
            listing.propertyType === type.id
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200'
          }`}
        >
          <type.icon className="w-8 h-8 text-gray-900" strokeWidth={1.5} />
          <span className="text-xs font-medium text-gray-900 text-center line-clamp-1 leading-tight text-ellipsis">{type.label}</span>
        </button>
      ))}
    </div>
  );
};
