import { Globe, CheckCircle, Star, Shield, Clock, Compass } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Over 2 million properties in 190+ countries worldwide'
  },
  {
    icon: CheckCircle,
    title: 'Instant Booking',
    description: 'Book instantly with no waiting for host approval'
  },
  {
    icon: Star,
    title: 'Top Rated',
    description: '4.8/5 average rating from millions of satisfied guests'
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Your payment information is always safe and secure'
  },
  {
    icon: Clock,
    title: 'Flexible Cancellation',
    description: 'Many properties offer free cancellation options'
  },
  {
    icon: Compass,
    title: 'Local Experiences',
    description: 'Discover unique experiences curated by local hosts'
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Why Choose Houseiana?
        </h2>
        <p className="text-xl text-gray-600">
          We make travel simple, safe, and memorable
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {features.map((feature, index) => (
          <div key={feature.title} className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <feature.icon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}