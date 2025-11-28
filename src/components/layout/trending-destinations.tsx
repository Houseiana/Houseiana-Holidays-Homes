
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

// TODO: Fetch from API - trending destinations based on booking data
const destinations: Array<{
  name: string;
  properties: string;
  avgPrice: string;
  image: string;
  trending: boolean;
}> = [];

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
          Discover the most popular places to stay around the world
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
