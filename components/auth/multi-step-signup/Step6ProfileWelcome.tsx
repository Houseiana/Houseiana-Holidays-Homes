'use client';

interface Step6ProfileWelcomeProps {
  onContinue: () => void;
  onClose: () => void;
}

export default function Step6ProfileWelcome({ onContinue, onClose }: Step6ProfileWelcomeProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Houseiana Logo */}
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-3xl">H</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Welcome to Houseiana
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Discover luxury properties and unique experiences in Qatar and around the world.
          </p>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
