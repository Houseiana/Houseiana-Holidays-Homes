
import Link from 'next/link';
import { CheckCircle, ChevronRight, Home, Heart } from 'lucide-react';

export function BecomeAHost() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600" />
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80)'
          }}
        />
      </div>
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Become a Host Today
            </h2>
            <p className="text-xl mb-8 text-emerald-100">
              Join millions of hosts earning extra income by sharing their space.
              It's easy to get started and we're here to help every step of the way.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-300" />
                <span>Free to list your space</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-300" />
                <span>Set your own prices</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-300" />
                <span>Host protection insurance</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-300" />
                <span>24/7 support</span>
              </div>
            </div>
            <Link
              href="/become-host"
              className="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Hosting
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center">
                  <Home className="w-32 h-32 text-white" />
                </div>
              </div>
              <div className="absolute top-12 right-12 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-2xl font-bold text-yellow-800">$</span>
              </div>
              <div className="absolute bottom-16 left-8 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                <Heart className="w-6 h-6 text-green-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
