'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ChevronLeft, Share, Heart, Star, Diamond, Users,
  CheckCircle, Calendar, Flag, ChevronDown, Minus, Plus,
  ChevronRight, MapPin, Wifi, Car, Coffee, Tv, MoreHorizontal
} from 'lucide-react'

interface Property {
  id: string
  title: string
  type: string
  location: string
  price: number
  rating: number
  reviews: number
  images: string[]
  amenities: string[]
  bedrooms: number
  bathrooms: number
  guests: number
  host: {
    name: string
    avatar: string
    joinDate: string
    verified: boolean
  }
  description: string
  isRareFind: boolean
  guestFavorite: boolean
}

interface BookingForm {
  checkIn: string
  checkOut: string
  guests: number
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [showGuestDropdown, setShowGuestDropdown] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [activeTab, setActiveTab] = useState('photos')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const [bookingForm, setBookingForm] = useState<BookingForm>({
    checkIn: '',
    checkOut: '',
    guests: 1
  })

  useEffect(() => {
    loadProperty(params.id as string)
    setDefaultDates()
  }, [params.id])

  const loadProperty = (id: string) => {
    // Mock property data
    const mockProperty: Property = {
      id,
      title: 'kawans Inn lembongan villa',
      type: 'Entire villa',
      location: 'Nusapenida, Indonesia',
      price: 31.82,
      rating: 4.82,
      reviews: 199,
      images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'
      ],
      amenities: ['wifi', 'pool', 'kitchen', 'parking', 'air-conditioning', 'tv'],
      bedrooms: 3,
      bathrooms: 2,
      guests: 6,
      host: {
        name: 'Nyoman',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        joinDate: 'June 2020',
        verified: true
      },
      description: 'lembongan Inn has a private room decorated with gardens around it, strategic location of the Inn, close to diving shop and yoga place just 5 minutes walk. we invite tourists to stay at the Inn.',
      isRareFind: true,
      guestFavorite: true
    }

    setProperty(mockProperty)
  }

  const setDefaultDates = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 2)

    setBookingForm({
      checkIn: today.toISOString().split('T')[0],
      checkOut: tomorrow.toISOString().split('T')[0],
      guests: 1
    })
  }

  const calculateNights = () => {
    if (!bookingForm.checkIn || !bookingForm.checkOut) return 0
    const checkIn = new Date(bookingForm.checkIn)
    const checkOut = new Date(bookingForm.checkOut)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    const nights = calculateNights()
    if (!nights || !property) return { base: 0, total: 0 }
    const base = property.price * nights
    return { base, total: base }
  }

  const updateGuests = (change: number) => {
    const newCount = Math.max(1, Math.min(property?.guests || 8, bookingForm.guests + change))
    setBookingForm(prev => ({ ...prev, guests: newCount }))
  }

  const proceedToReserve = () => {
    if (calculateNights() > 0) {
      const bookingData = {
        property,
        booking: bookingForm,
        pricing: calculateTotal(),
        nights: calculateNights()
      }
      router.push('/booking/confirm')
    }
  }

  const shareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: 'Check out this amazing property on Houseiana',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-6 h-6" />
      case 'parking':
        return <Car className="w-6 h-6" />
      case 'kitchen':
        return <Coffee className="w-6 h-6" />
      case 'tv':
        return <Tv className="w-6 h-6" />
      default:
        return <Wifi className="w-6 h-6" />
    }
  }

  if (!property) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back Button */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </header>

      {/* Property Title and Actions */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={shareProperty}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Share className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 ${
                isLiked ? 'text-red-600 border-red-300' : 'border-gray-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              Save
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-4 gap-4 h-96 mb-8 rounded-xl overflow-hidden">
          <div className="col-span-2">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedImageIndex(0)}
            />
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-4">
            {property.images.slice(1, 5).map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Image ${index + 2}`}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImageIndex(index + 1)}
                />
                {index === 3 && property.images.length > 5 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <button className="flex items-center gap-2 text-white font-medium">
                      <MoreHorizontal className="w-5 h-5" />
                      Show all photos
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {/* Property Info Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {property.type} in {property.location}
                </h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>{property.guests} guests</span>
                  <span>·</span>
                  <span>{property.bedrooms} bedroom</span>
                  <span>·</span>
                  <span>{property.bathrooms} bath</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">{property.rating}</span>
                <span className="text-gray-500">({property.reviews} reviews)</span>
              </div>
            </div>

            {/* Rare Find Banner */}
            {property.isRareFind && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg mb-6">
                <Diamond className="w-5 h-5 text-orange-600" />
                <span className="text-orange-800 font-medium">Rare find! This place is usually booked</span>
              </div>
            )}

            {/* Guest Favorite Section */}
            {property.guestFavorite && (
              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg mb-8">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Guest favorite</h3>
                  <p className="text-gray-600">One of the most loved homes on Houseiana, according to guests</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{property.rating}</div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">{property.reviews} Reviews</div>
                </div>
              </div>
            )}

            {/* Host Info */}
            <div className="flex items-center gap-4 pb-8 border-b border-gray-200 mb-8">
              <img
                src={property.host.avatar}
                alt={property.host.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-900">Hosted by {property.host.name}</h3>
                <p className="text-gray-600">Superhost · 9 years hosting</p>
              </div>
            </div>

            {/* Property Features */}
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-gray-400 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Amazing outdoor space</h4>
                  <p className="text-gray-600">Guests mention the pool as a highlight.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-gray-400 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Great check-in experience</h4>
                  <p className="text-gray-600">Recent guests loved the smooth start to this stay.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Calendar className="w-6 h-6 text-gray-400 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Free cancellation for 48 hours</h4>
                  <p className="text-gray-600">Get a full refund if you change your mind.</p>
                </div>
              </div>
            </div>

            {/* Property Description */}
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed mb-4">{property.description}</p>
              <button className="text-orange-600 font-medium hover:underline">Show more</button>
            </div>

            {/* Amenities Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">What this place offers</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {property.amenities.slice(0, 6).map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {getAmenityIcon(amenity)}
                    <span className="text-gray-700 capitalize">{amenity.replace('-', ' ')}</span>
                  </div>
                ))}
              </div>
              {property.amenities.length > 6 && (
                <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Show all {property.amenities.length} amenities
                </button>
              )}
            </div>
          </div>

          {/* Booking Widget Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              {/* Price Section */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-2xl font-bold text-gray-900">${property.price}</span>
                  <span className="text-gray-600"> for {calculateNights()} nights</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{property.rating}</span>
                  <span className="text-gray-500">· {property.reviews} reviews</span>
                </div>
              </div>

              {/* Date Selection */}
              <div className="border border-gray-300 rounded-lg mb-4">
                <div className="grid grid-cols-2">
                  <div className="p-3 border-r border-gray-300">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Check-in</label>
                    <input
                      type="date"
                      value={bookingForm.checkIn}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, checkIn: e.target.value }))}
                      className="w-full text-sm text-gray-900 border-0 p-0 focus:ring-0"
                    />
                  </div>
                  <div className="p-3">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Checkout</label>
                    <input
                      type="date"
                      value={bookingForm.checkOut}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, checkOut: e.target.value }))}
                      className="w-full text-sm text-gray-900 border-0 p-0 focus:ring-0"
                    />
                  </div>
                </div>
              </div>

              {/* Guest Selection */}
              <div className="relative mb-6">
                <button
                  onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                  className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Guests</label>
                    <div className="text-sm text-gray-900">
                      {bookingForm.guests} guest{bookingForm.guests !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showGuestDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showGuestDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Guests</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateGuests(-1)}
                          disabled={bookingForm.guests <= 1}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{bookingForm.guests}</span>
                        <button
                          onClick={() => updateGuests(1)}
                          disabled={bookingForm.guests >= property.guests}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reserve Button */}
              <button
                onClick={proceedToReserve}
                disabled={calculateNights() <= 0}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reserve
              </button>

              <p className="text-center text-gray-600 text-sm mt-3">You won't be charged yet</p>

              {/* Price Breakdown */}
              {calculateNights() > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">${property.price} x {calculateNights()} nights</span>
                    <span className="text-gray-900">${calculateTotal().total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-gray-900">
                    <span>Total before taxes</span>
                    <span>${calculateTotal().total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Report Link */}
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mt-6">
                <Flag className="w-4 h-4" />
                Report this listing
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="border-b border-gray-200 mt-12 mb-8">
          <div className="flex gap-8">
            {['photos', 'amenities', 'reviews', 'location'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>

        {/* Tab Content */}
        <div className="mb-12">
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="text-6xl font-bold text-gray-900 mb-2">{property.rating}</div>
                  <h3 className="text-xl font-semibold mb-2">Guest favorite</h3>
                  <p className="text-gray-600">This home is in the <strong>top 5%</strong> of eligible listings based on ratings, reviews, and reliability</p>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Cleanliness', score: 5.0 },
                    { name: 'Accuracy', score: 5.0 },
                    { name: 'Check-in', score: 5.0 },
                    { name: 'Communication', score: 5.0 },
                    { name: 'Location', score: 5.0 },
                    { name: 'Value', score: 4.9 }
                  ].map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <span className="text-gray-600">{category.name}</span>
                      <span className="font-medium">{category.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Reviews */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1494790108755-2616b612b2f3?w=100"
                      alt="Moon Michelle"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h4 className="font-medium">Moon Michelle</h4>
                      <p className="text-sm text-gray-600">Bellevue, Washington</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">1 week ago · Stayed about a week</span>
                  </div>
                  <p className="text-gray-700">Everything was perfect and the host left no stone unturned. Felt right like home and the location was in a very central part...</p>
                  <button className="text-orange-600 text-sm font-medium mt-2">Show more</button>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
                      alt="Yasmine"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h4 className="font-medium">Yasmine</h4>
                      <p className="text-sm text-gray-600">8 years on Houseiana</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">3 weeks ago · Stayed a few nights</span>
                  </div>
                  <p className="text-gray-700">We had a great time at this Houseiana in Copenhagen! The apartment was spotless. The hosts were welcoming and friendly...</p>
                  <button className="text-orange-600 text-sm font-medium mt-2">Show more</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Where you'll be</h3>
              <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center mb-6">
                <p className="text-gray-600">Map of {property.location}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{property.location}</h4>
                <p className="text-gray-600">Getting there</p>
                <p className="text-gray-600">Banjar Kangin Jungut Batu</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}