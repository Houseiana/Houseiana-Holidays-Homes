
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    location: 'San Francisco, CA',
    rating: 5,
    text: 'Amazing experience! The property was exactly as described and the host was incredibly helpful.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Marcus Johnson',
    location: 'London, UK',
    rating: 5,
    text: 'Perfect location and beautiful apartment. Would definitely book again for my next trip.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Elena Rodriguez',
    location: 'Barcelona, Spain',
    rating: 5,
    text: 'The booking process was so easy and the property exceeded all my expectations. Highly recommend!',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
  }
];

export function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          What Our Guests Say
        </h2>
        <p className="text-xl text-gray-600">
          Real stories from real travelers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={testimonial.name} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
            <div className="flex items-center">
              <div
                className="w-12 h-12 rounded-full bg-cover bg-center mr-4"
                style={{ backgroundImage: `url(${testimonial.avatar})` }}
              />
              <div>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-gray-500 text-sm">{testimonial.location}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
