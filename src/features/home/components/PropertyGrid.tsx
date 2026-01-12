'use client';

import Link from 'next/link';
import PropertyCard from './PropertyCard';
import { PropertySummary } from '@/types/property';



interface PropertyGridProps {
  properties: PropertySummary[];
  loading: boolean;
}

export default function PropertyGrid({ properties, loading }: PropertyGridProps) {

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No properties found</p>
          <Link href="/properties">
            <button className="mt-4 px-6 py-3 bg-teal-500 text-white rounded-full hover:bg-teal-600">
              Explore All Properties
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {properties.map((property, index) => (
            <PropertyCard key={property.id} property={property} index={index} />
          ))}
        </div>
      )}
    </main>
  );
}
