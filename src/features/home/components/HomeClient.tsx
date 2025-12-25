'use client';

import { useState } from 'react';
import { Footer } from '@/layout';
import HomeHeader from './HomeHeader';
import PropertyGrid from './PropertyGrid';
import { PropertySummary } from '@/types/property';

interface HomeClientProps {
  initialProperties: PropertySummary[];
}

export default function HomeClient({ initialProperties }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState('all');

  // Property state - initialized with server data
  const [properties, setProperties] = useState<PropertySummary[]>(initialProperties);
  const loading = false;

  // Filter properties by category
  const filteredProperties = activeCategory === 'all'
    ? properties
    : properties.filter(p => p.title?.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <HomeHeader activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {/* Property Grid */}
      <PropertyGrid properties={filteredProperties} loading={loading} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
