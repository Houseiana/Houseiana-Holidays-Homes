'use client';

interface Step5CommunityCommitmentProps {
  onContinue: () => void;
  onDecline: () => void;
}

export default function Step5CommunityCommitment({ onContinue, onDecline }: Step5CommunityCommitmentProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8">
        {/* Houseiana Logo */}
        <div className="mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Our community commitment
          </p>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Houseiana is a community where anyone can belong
          </h1>
        </div>

        {/* Main Content */}
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed mb-4">
            To ensure this, we're asking you to commit to the following:
          </p>

          <p className="text-gray-900 leading-relaxed">
            I agree to treat everyone in the Houseiana community—regardless of their race, religion, national origin, ethnicity, skin color, disability, sex, gender identity, sexual orientation or age—with respect, and without judgment or bias.
          </p>
        </div>

        {/* Learn More Link */}
        <div className="mb-8">
          <a href="#" className="text-gray-900 font-semibold underline hover:text-gray-700 flex items-center gap-1">
            Learn more
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="w-full py-4 bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-lg font-semibold transition-colors"
          >
            Agree and continue
          </button>

          <button
            onClick={onDecline}
            className="w-full py-4 bg-white border-2 border-gray-900 hover:bg-gray-50 text-gray-900 rounded-lg font-semibold transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
