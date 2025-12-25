
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

// Qatar destinations
const destinations: Array<{
  name: string;
  properties: string;
  avgPrice: string;
  image: string;
  trending: boolean;
}> = [
  {
    name: 'Ad Dawhah (Doha)',
    properties: '150+',
    avgPrice: 'QAR 450',
    image: 'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?w=800&h=600&fit=crop',
    trending: true
  },
  {
    name: 'Lusail',
    properties: '80+',
    avgPrice: 'QAR 600',
    image: 'https://images.unsplash.com/photo-1609839699246-2b7e02ed4d45?w=800&h=600&fit=crop',
    trending: true
  },
  {
    name: 'The Pearl-Qatar',
    properties: '60+',
    avgPrice: 'QAR 750',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    trending: false
  },
  {
    name: 'West Bay',
    properties: '45+',
    avgPrice: 'QAR 550',
    image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&h=600&fit=crop',
    trending: false
  }
];

export function TrendingDestinations() {
  // Don't render section if no destinations available
  if (destinations.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Trending Destinations
        </h2>
        <p className="text-xl text-gray-600">
          Discover the most popular places to stay in Qatar
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {destinations.map((destination, index) => (
          <Link
            key={destination.name}
            href={`/discover?location=${destination.name.split(',')[0]}`}
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="relative h-64">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundImage: `url(${destination.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {destination.trending && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </div>
              )}
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-lg font-bold mb-1">{destination.name}</h3>
              <div className="flex justify-between items-center text-sm">
                <span>{destination.properties} properties</span>
                <span className="font-semibold">from {destination.avgPrice}/night</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
