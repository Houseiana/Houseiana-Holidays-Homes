
import { Star } from 'lucide-react';

// TODO: Fetch from API - verified customer reviews
const testimonials: Array<{
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
}> = [];

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
