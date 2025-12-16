
export function NewsletterSignup() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Stay in the Loop
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Get exclusive deals, travel tips, and destination inspiration delivered to your inbox
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-6 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          />
          <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105">
            Subscribe
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          No spam, unsubscribe at any time. By subscribing you agree to our Terms of Service.
        </p>
      </div>
    </section>
  );
}
