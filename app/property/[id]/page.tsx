'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  ChevronLeft, Share, Heart, Star, Diamond, Users,
  CheckCircle, Calendar, Flag, ChevronDown, Minus, Plus,
  ChevronRight, MapPin, Wifi, Car, Coffee, Tv, MoreHorizontal, ShieldCheck, Clock, MessageCircle, Tag, Sparkles, X
} from 'lucide-react'

// Dynamically import GoogleMapsView to avoid SSR issues
const GoogleMapsView = dynamic(() => import('@/components/GoogleMapsView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Loading map...</p>
      </div>
    </div>
  ),
})

interface Property {
  id: string
  title: string
  type: string
  location: string
  latitude?: number
  longitude?: number
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
  perks?: string[]
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

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
      latitude: -8.674,
      longitude: 115.448,
      description: 'lembongan Inn has a private room decorated with gardens around it, strategic location of the Inn, close to diving shop and yoga place just 5 minutes walk. we invite tourists to stay at the Inn.',
      isRareFind: true,
      guestFavorite: true,
      perks: ['Flexible check-in', 'Self check-in', 'Dedicated workspace']
    }

    setProperty(mockProperty)
  }

  const nextImage = () => {
    if (!property) return
    setSelectedImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = () => {
    if (!property) return
    setSelectedImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
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
    if (!nights || !property) return { base: 0, total: 0, service: 0, cleaning: 0 }
    const base = property.price * nights
    const service = Math.round(base * 0.08)
    const cleaning = 35
    const total = base + service + cleaning
    return { base, service, cleaning, total }
  }

  const updateGuests = (change: number) => {
    const newCount = Math.max(1, Math.min(property?.guests || 8, bookingForm.guests + change))
    setBookingForm(prev => ({ ...prev, guests: newCount }))
  }

  const proceedToReserve = () => {
    if (calculateNights() > 0) {
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

  const isNewListing = (property.reviews || 0) < 5
  const reviewLabel = isNewListing ? 'New listing · be among the first guests' : `${property.reviews} reviews`
  const ratingLabel = isNewListing ? 'New on Houseiana' : `${property.rating} • ${reviewLabel}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {showLightbox && property && (
        <Lightbox
          images={property.images}
          index={selectedImageIndex}
          onClose={() => setShowLightbox(false)}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={shareProperty}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-semibold"
            >
              <Share className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm font-semibold ${
                isLiked ? 'text-rose-600 border-rose-200' : 'border-gray-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              Save
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {property.isRareFind && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                <Diamond className="w-4 h-4" /> Rare find
              </span>
            )}
            {property.guestFavorite && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                <Heart className="w-4 h-4 fill-current" /> Guest favorite
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{property.title}</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-gray-800 font-semibold">
                <Star className="w-4 h-4 fill-current text-amber-400" />
                <span className="text-sm">{ratingLabel}</span>
              </div>
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {property.location}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={property.host.avatar}
              alt={property.host.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100"
            />
            <div>
              <p className="font-semibold text-gray-900">Hosted by {property.host.name}</p>
              <p className="text-sm text-gray-600">New on Houseiana</p>
              {property.host.verified && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full mt-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified host
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 h-[280px] sm:h-[360px] md:h-[420px] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
          <div className="col-span-1 sm:col-span-1 md:col-span-2">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover hover:scale-[1.01] transition-transform cursor-pointer"
              onClick={() => { setSelectedImageIndex(0); setShowLightbox(true) }}
            />
          </div>
          <div className="hidden sm:grid sm:col-span-1 md:col-span-2 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            {property.images.slice(1, 5).map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Image ${index + 2}`}
                  className="w-full h-full object-cover hover:scale-[1.01] transition-transform cursor-pointer"
                  onClick={() => { setSelectedImageIndex(index + 1); setShowLightbox(true) }}
                />
                {index === 3 && property.images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <button className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
                      <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Show all photos</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 border border-gray-200 rounded-xl flex items-center gap-3 bg-white shadow-sm">
                <Users className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Up to</p>
                  <p className="text-lg font-semibold text-gray-900">{property.guests} guests</p>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl flex items-center gap-3 bg-white shadow-sm">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="text-lg font-semibold text-gray-900">{property.bedrooms}</p>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl flex items-center gap-3 bg-white shadow-sm">
                <Flag className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                  <p className="text-lg font-semibold text-gray-900">{property.bathrooms}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Why you'll love it</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
              <div className="flex flex-wrap gap-2">
                {(property.perks || ['Flexible check-in', 'Self check-in', 'Dedicated workspace']).map((perk) => (
                  <span key={perk} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                    {perk}
                  </span>
                ))}
              </div>
            </div>

          <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What this place offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {property.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-3 text-gray-800">
                  {getAmenityIcon(amenity)}
                  <span className="font-medium capitalize">{amenity}</span>
                </div>
              ))}
            </div>
            <button className="mt-4 px-4 py-2 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50">
              Show all amenities
            </button>
          </div>

            <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Where you’ll be</h2>
              </div>
              <p className="text-sm text-gray-700">{property.location}</p>
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-64">
                {property.latitude && property.longitude ? (
                  <GoogleMapsView
                    latitude={property.latitude}
                    longitude={property.longitude}
                    title={property.title}
                    zoom={15}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-600">Map not available</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600">Exact location shown on map. Pin placed by host during listing.</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-gray-200 rounded-2xl p-6 shadow-xl bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${property.price.toFixed(0)} <span className="text-sm text-gray-600 font-normal">night</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold">{isNewListing ? 'Intro price for early guests' : reviewLabel}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Share className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <MessageCircle className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl divide-y divide-gray-200">
                <div className="grid grid-cols-2">
                  <div className="p-3 border-r border-gray-200">
                    <label className="text-xs font-semibold text-gray-600">CHECK-IN</label>
                    <input
                      type="date"
                      value={bookingForm.checkIn}
                      onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                      className="w-full text-sm font-semibold text-gray-900"
                    />
                  </div>
                  <div className="p-3">
                    <label className="text-xs font-semibold text-gray-600">CHECKOUT</label>
                    <input
                      type="date"
                      value={bookingForm.checkOut}
                      onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                      className="w-full text-sm font-semibold text-gray-900"
                    />
                  </div>
                </div>
                <div className="p-3">
                  <label className="text-xs font-semibold text-gray-600">GUESTS</label>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm font-semibold text-gray-900">{bookingForm.guests} guests</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateGuests(-1)}
                        className="p-2 rounded-full border border-gray-200 hover:border-gray-300 disabled:opacity-50"
                        disabled={bookingForm.guests <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateGuests(1)}
                        className="p-2 rounded-full border border-gray-200 hover:border-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={proceedToReserve}
                className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white py-3 rounded-xl font-bold hover:from-rose-600 hover:to-amber-600 transition-all shadow-lg shadow-rose-200"
              >
                Reserve
              </button>

              <p className="text-center text-sm text-gray-600">You won't be charged yet</p>

              <div className="border-t pt-4 space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>${property.price.toFixed(0)} x {calculateNights()} nights</span>
                  <span>${calculateTotal().base?.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>${calculateTotal().cleaning?.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>${calculateTotal().service?.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total before taxes</span>
                  <span>${calculateTotal().total?.toFixed(0)}</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">48-hour free cancellation</p>
                    <p className="text-xs text-gray-600">Then moderate policy applies</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Houseiana protection</p>
                    <p className="text-xs text-gray-600">Secure payments and verified hosts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Instant confirmation</p>
                    <p className="text-xs text-gray-600">You'll get details right away</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Lightbox overlay for photo carousel
function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  if (!images.length) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10"
      >
        <X className="w-6 h-6" />
      </button>
      <button
        onClick={onPrev}
        className="absolute left-5 text-white/80 hover:text-white p-3 rounded-full bg-white/10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div className="max-w-5xl w-full px-6">
        <img
          src={images[index]}
          alt={`Photo ${index + 1}`}
          className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
        />
        <div className="mt-4 flex justify-center gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </div>
      <button
        onClick={onNext}
        className="absolute right-5 text-white/80 hover:text-white p-3 rounded-full bg-white/10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  )
}
