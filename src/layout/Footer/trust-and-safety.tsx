
import { Shield, Award, Heart } from 'lucide-react';

export function TrustAndSafety() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Travel with Peace of Mind
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our commitment to safety and trust means you can focus on making memories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">24/7 Customer Support</h3>
            <p className="text-gray-600">Get help whenever you need it with our round-the-clock support team.</p>
          </div>
          <div className="text-center group">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Award className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Verified Properties</h3>
            <p className="text-gray-600">Every property is verified to ensure quality and authenticity.</p>
          </div>
          <div className="text-center group">
            <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Heart className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Host Guarantee</h3>
            <p className="text-gray-600">Protection for your stay with our comprehensive host guarantee.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
