
import Link from 'next/link';
import { Home, Building, Mountain, Trees } from 'lucide-react';

const propertyTypes = [
  {
    icon: Building,
    title: 'Apartments & Condos',
    description: 'Stylish apartments in the heart of cities',
    count: '500K+',
    color: 'bg-blue-500'
  },
  {
    icon: Home,
    title: 'Houses & Villas',
    description: 'Complete privacy in a home away from home',
    count: '300K+',
    color: 'bg-green-500'
  },
  {
    icon: Mountain,
    title: 'Cabins & Chalets',
    description: 'Escape to nature in cozy mountain retreats',
    count: '150K+',
    color: 'bg-orange-500'
  },
  {
    icon: Trees,
    title: 'Unique Stays',
    description: "Farm stays, houseboats & more unique experiences",
    count: '75K+',
    color: 'bg-purple-500'
  }
];

export function PropertyTypes() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Stay Anywhere
          </h2>
          <p className="text-xl text-gray-600">
            Choose from a wide variety of properties that suit your travel style
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {propertyTypes.map((type, index) => (
            <Link
              key={type.title}
              href="/discover"
              className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className={`w-16 h-16 ${type.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                <type.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{type.title}</h3>
              <p className="text-gray-600 mb-4">{type.description}</p>
              <div className="text-2xl font-bold text-gray-900">{type.count}</div>
              <div className="text-sm text-gray-500">available</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
