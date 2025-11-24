'use client';

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Shield, Clock, Zap, Star, ArrowRight, Menu, X, MapPin, Calendar, Users, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import LocationDropdown from '@/components/search/location-dropdown'
import DatePicker from '@/components/search/date-picker'
import GuestSelector from '@/components/search/guest-selector'

export default function HomePage() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn, isLoaded } = useUser()
  
  // Search State
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [guests, setGuests] = useState({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0
  })
  
  const [activeDropdown, setActiveDropdown] = useState<'location' | 'checkIn' | 'checkOut' | 'guests' | null>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    if (location) {
      params.set('location', location)
    }

    if (checkIn) {
      params.set('checkin', checkIn.toISOString())
    }

    if (checkOut) {
      params.set('checkout', checkOut.toISOString())
    }

    const totalGuests = guests.adults + guests.children
    if (totalGuests > 0) {
      params.set('guests', totalGuests.toString())
    }

    router.push(`/discover?${params.toString()}`)
  }

  const formatDateRange = () => {
    if (!checkIn && !checkOut) return 'Add dates'
    if (checkIn && !checkOut) {
      return `${checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - Add checkout`
    }
    if (checkIn && checkOut) {
      return `${checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    }
    return 'Add dates'
  }

  const formatGuests = () => {
    const total = guests.adults + guests.children
    if (total === 0) return 'Add guests'
    if (total === 1) return '1 guest'
    return `${total} guests`
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white tracking-tighter">
              Houseiana<span className="text-orange-500">.</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/explore" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Explore</Link>
            <Link href="/become-host" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Become a Host</Link>
            <Link href="/help-center" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Support</Link>

            <div className={`transition-opacity duration-200 ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}>
              {isSignedIn ? (
                 <Link href="/client-dashboard">
                  <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-white/20 transition-all">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/sign-in" className="text-sm font-medium text-white/90 hover:text-white transition-colors">Sign In</Link>
                  <Link href="/sign-up">
                    <button className="bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-600/20">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white p-2">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-xl p-4 md:hidden flex flex-col space-y-4 animate-fade-in-down">
            <Link href="/explore" className="text-gray-900 font-medium">Explore</Link>
            <Link href="/become-host" className="text-gray-900 font-medium">Become a Host</Link>
            <Link href="/help-center" className="text-gray-900 font-medium">Support</Link>
            <div className="border-t border-gray-100 pt-4 flex flex-col space-y-3">
              <div className={`transition-opacity duration-200 ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}>
                {isSignedIn ? (
                  <Link href="/client-dashboard" className="bg-orange-600 text-white px-4 py-2 rounded-lg text-center font-bold">Dashboard</Link>
                ) : (
                  <>
                    <Link href="/sign-in" className="text-gray-600 font-medium">Sign In</Link>
                    <Link href="/sign-up" className="bg-orange-600 text-white px-4 py-2 rounded-lg text-center font-bold">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-[95vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
            alt="Luxury Home"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
          <div className="inline-block mb-4 px-4 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="text-orange-400 font-bold text-xs tracking-widest uppercase">The Future of Hospitality</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-bold text-white mb-8 tracking-tight leading-tight">
            Find your place <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">in the world.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Discover handpicked holiday homes for your next adventure. Unmatched comfort, verified quality, and unforgettable memories.
          </p>

          {/* Search Bar CTA */}
          <div ref={searchBarRef} className="bg-white p-2 rounded-3xl shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2 animate-fade-in-up transform hover:scale-[1.01] transition-transform duration-300 relative">
            
            {/* Location */}
            <div className="flex-1 w-full md:w-auto relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
                className="w-full px-6 py-4 text-left border-b md:border-b-0 md:border-r border-gray-100 group hover:bg-gray-50 rounded-2xl transition-colors"
              >
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 group-hover:text-orange-600 transition-colors">
                  Where
                </label>
                <div className="text-gray-900 font-medium truncate">
                  {location || 'Search destinations'}
                </div>
              </button>
              
              {activeDropdown === 'location' && (
                <LocationDropdown
                  value={location}
                  onChange={(val) => {
                    setLocation(val)
                    setActiveDropdown(null)
                  }}
                  onClose={() => setActiveDropdown(null)}
                />
              )}
            </div>

            {/* Dates */}
            <div className="flex-1 w-full md:w-auto relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'checkIn' ? null : 'checkIn')}
                className="w-full px-6 py-4 text-left border-b md:border-b-0 md:border-r border-gray-100 group hover:bg-gray-50 rounded-2xl transition-colors"
              >
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 group-hover:text-orange-600 transition-colors">
                  Check in / out
                </label>
                <div className="text-gray-900 font-medium truncate">
                  {formatDateRange()}
                </div>
              </button>

              {(activeDropdown === 'checkIn' || activeDropdown === 'checkOut') && (
                <DatePicker
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onCheckInChange={setCheckIn}
                  onCheckOutChange={setCheckOut}
                  onClose={() => setActiveDropdown(null)}
                  focusedInput={activeDropdown}
                />
              )}
            </div>

            {/* Guests */}
            <div className="flex-1 w-full md:w-auto relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'guests' ? null : 'guests')}
                className="w-full px-6 py-4 text-left group hover:bg-gray-50 rounded-2xl transition-colors"
              >
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 group-hover:text-orange-600 transition-colors">
                  Guests
                </label>
                <div className="text-gray-900 font-medium truncate">
                  {formatGuests()}
                </div>
              </button>

              {activeDropdown === 'guests' && (
                <GuestSelector
                  guests={guests}
                  onChange={setGuests}
                  onClose={() => setActiveDropdown(null)}
                />
              )}
            </div>

            {/* Search Button */}
            <div className="w-full md:w-auto p-2">
              <button 
                onClick={handleSearch}
                className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white rounded-2xl px-8 py-4 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/30 group"
              >
                <Search className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="md:hidden font-bold">Search</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Why Choose Houseiana?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-xl">We redefine the vacation rental experience with premium standards and exceptional service.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Verified Properties</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Every home is personally verified by our team to ensure it meets our high standards of luxury and comfort.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-8 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-500">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">24/7 Concierge</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Our support team is available round the clock to assist you with anything from reservations to local recommendations.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-8 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-500">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Booking</h3>
              <p className="text-gray-600 leading-relaxed text-lg">No waiting for approvals. Book your dream stay instantly and start planning your trip immediately.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-32 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-8 bg-orange-50 w-fit px-4 py-2 rounded-full">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                  ))}
                </div>
                <span className="text-orange-800 font-bold text-sm">Trusted by 10,000+ Travelers</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                Loved by travelers <br />
                <span className="text-orange-600">worldwide.</span>
              </h2>
              <blockquote className="text-2xl text-gray-600 mb-10 leading-relaxed italic border-l-4 border-orange-500 pl-6">
                "Houseiana transformed our family vacation. The villa was exactly as pictured, and the service was impeccable. We'll never book anywhere else."
              </blockquote>
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                   <div className="flex text-yellow-400 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-6 h-6 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-gray-900 text-lg">4.9/5 Average Rating</span>
                </div>
                <div className="h-12 w-px bg-gray-200"></div>
                <div>
                   <p className="font-bold text-gray-900 text-lg">2,500+</p>
                   <p className="text-gray-500">Verified Reviews</p>
                </div>
              </div>
            </div>
            <div className="flex-1 relative w-full">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50 animate-pulse" />
              <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse" />
              <div className="relative grid grid-cols-2 gap-6">
                <img src="https://images.unsplash.com/photo-1512918760532-3ed64bc8066e?q=80&w=1000&auto=format&fit=crop" alt="Review 1" className="rounded-3xl shadow-2xl transform translate-y-12 hover:-translate-y-2 transition-transform duration-500" />
                <img src="https://images.unsplash.com/photo-1600596542815-2a4d9fdd4070?q=80&w=1000&auto=format&fit=crop" alt="Review 2" className="rounded-3xl shadow-2xl hover:-translate-y-2 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
           <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop" alt="Background" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">Ready to start your journey?</h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">Join thousands of happy travelers and hosts on Houseiana today. Your next adventure awaits.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/explore">
              <button className="px-10 py-5 bg-orange-600 text-white rounded-2xl font-bold text-xl hover:bg-orange-700 transition-all shadow-xl hover:shadow-orange-600/30 flex items-center gap-3 transform hover:scale-105">
                Start Exploring <ArrowRight className="w-6 h-6" />
              </button>
            </Link>
            <Link href="/become-host">
              <button className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-xl hover:bg-white/20 transition-all transform hover:scale-105">
                Become a Host
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
            <div className="col-span-1 md:col-span-1">
              <Link href="/" className="text-2xl font-bold text-gray-900 mb-6 block">
                Houseiana<span className="text-orange-500">.</span>
              </Link>
              <p className="text-gray-500 leading-relaxed">Luxury holiday homes for the modern traveler. Experience the world with comfort and style.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-lg">Support</h4>
              <ul className="space-y-4 text-gray-600">
                <li><Link href="/help-center" className="hover:text-orange-600 transition-colors">Help Center</Link></li>
                <li><Link href="/safety" className="hover:text-orange-600 transition-colors">Safety Information</Link></li>
                <li><Link href="/cancellation" className="hover:text-orange-600 transition-colors">Cancellation Options</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-lg">Company</h4>
              <ul className="space-y-4 text-gray-600">
                <li><Link href="/about" className="hover:text-orange-600 transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-orange-600 transition-colors">Careers</Link></li>
                <li><Link href="/press" className="hover:text-orange-600 transition-colors">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-lg">Legal</h4>
              <ul className="space-y-4 text-gray-600">
                <li><Link href="/privacy" className="hover:text-orange-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-orange-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center text-gray-500 text-sm">
            © 2024 Houseiana. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
