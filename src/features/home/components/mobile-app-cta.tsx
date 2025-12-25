
import { Smartphone, Camera, Star, CheckCircle } from 'lucide-react';

export function MobileAppCta() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Take Houseiana with You
            </h2>
            <p className="text-xl mb-8 text-purple-100">
              Download our mobile app and discover amazing places to stay on the go.
              Book instantly, message hosts, and manage your trips all from your phone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-800 transition-colors">
                <Smartphone className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </button>
              <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-800 transition-colors">
                <Camera className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center">
                  <Smartphone className="w-32 h-32 text-white" />
                </div>
              </div>
              <div className="absolute top-16 right-16 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Star className="w-6 h-6 text-yellow-800" />
              </div>
              <div className="absolute bottom-20 left-12 w-10 h-10 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-5 h-5 text-green-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
