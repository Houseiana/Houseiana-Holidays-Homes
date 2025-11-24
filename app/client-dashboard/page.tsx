'use client'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import KYCModal from '@/components/KYCModal'
import {
  LayoutDashboard, Clock, Heart, Search, MessageCircle, CreditCard, User,
  HelpCircle, ArrowRightLeft, Star, Calendar, MapPin, LogOut, ChevronRight, TrendingUp,
  Bell, Settings, Compass, ShieldCheck, Wallet, ArrowUpRight, ArrowDownRight, CheckCircle2,
  AlertTriangle, Receipt, Download
} from 'lucide-react'

interface Booking {
  id: string
  property: {
    title: string
    address?: string
    city?: string
    country?: string
    coverPhoto?: string
    photos?: string[]
  }
  checkIn: string
  checkOut: string
  status: string
  hostId?: string
}

interface SavedProperty {
  id: string
  title: string
  address: {
    city: string
    country: string
  }
  pricing: {
    basePrice: number
  }
  ratings: {
    overall: number
    totalReviews: number
  }
  photos: Array<{ url: string }>
}

interface Payment {
  id: string
  property: string
  propertyLocation?: string
  date: string
  amount: number
  status: 'Paid' | 'Pending' | 'Refunded' | 'Failed'
  method: string
  type: 'reservation' | 'security-deposit' | 'add-on' | 'refund' | 'payment'
}

interface PaymentMethod {
  brand: string
  last4: string
  exp: string
  name: string
  primary?: boolean
}

interface UpcomingCharge {
  id: string
  title: string
  amount: number
  dueDate: string
  status: 'scheduled' | 'processing'
}

interface PaymentSummary {
  outstanding: number
  credits: number
  totalSpend: number
  successRate: number
}

interface PaymentsResponse {
  summary: PaymentSummary
  upcomingCharges: UpcomingCharge[]
  methods: PaymentMethod[]
  history: Payment[]
}

interface ConversationListItem {
  id: string
  type: 'CLIENT_HOST' | 'CLIENT_ADMIN' | 'HOST_ADMIN'
  status?: 'OPEN' | 'CLOSED'
  otherParticipant?: {
    id: string
    name: string
    role?: string
    avatar?: string | null
  }
  lastMessageAt?: string
  lastMessagePreview?: string | null
  bookingId?: string
  propertyId?: string
  unread?: number
}

interface ChatMessage {
  id: string
  body: string
  senderId: string
  senderRole: string
  createdAt: string
  attachments?: any
}

function ClientDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()

  const userProfile = {
    name: user?.name || `${user?.firstName || 'Guest'} ${user?.lastName || ''}`.trim() || 'Guest User',
    initials: user?.initials || `${user?.firstName?.charAt(0) || 'G'}${user?.lastName?.charAt(0) || ''}`.trim() || 'GU',
    email: user?.email || 'guest@example.com',
    profilePhoto: user?.profilePhoto
  };
  const isAuthenticated = Boolean(user?.id)

  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showKYCModal, setShowKYCModal] = useState(false)

  const [tripsLoading, setTripsLoading] = useState(false)
  const [tripsError, setTripsError] = useState<string | null>(null)
  const [trips, setTrips] = useState<Booking[]>([])

  const [exploreLoading, setExploreLoading] = useState(false)
  const [exploreError, setExploreError] = useState<string | null>(null)
  const [exploreResults, setExploreResults] = useState<SavedProperty[]>([])

  const [isPaymentsLoading, setIsPaymentsLoading] = useState(false)
  const [paymentsError, setPaymentsError] = useState<string | null>(null)
  const [paymentsData, setPaymentsData] = useState<PaymentsResponse | null>(null)
  const [paymentsLoaded, setPaymentsLoaded] = useState(false)

  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  const [conversationMessages, setConversationMessages] = useState<Record<string, ChatMessage[]>>({})
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [messagesLoaded, setMessagesLoaded] = useState(false)

  useEffect(() => {
    const kycRequired = searchParams.get('kyc') === 'required'
    const storedUser = localStorage.getItem('auth_user')

    if (kycRequired && storedUser) {
      const userData = JSON.parse(storedUser)
      if (!userData.hasCompletedKYC) {
        setShowKYCModal(true)
      }
    }
  }, [searchParams])

  const [upcomingBookings] = useState<Booking[]>([
    {
      id: '1',
      property: {
        title: 'Modern Downtown Apartment',
        address: 'Downtown, City Center',
        photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop']
      },
      checkIn: '2024-11-01',
      checkOut: '2024-11-05',
      status: 'confirmed',
      hostId: 'host1'
    },
    {
      id: '2',
      property: {
        title: 'Cozy Beach House',
        address: 'Oceanview, Coastal Area',
        photos: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop']
      },
      checkIn: '2024-12-15',
      checkOut: '2024-12-20',
      status: 'pending',
      hostId: 'host2'
    }
  ])

  const [savedProperties] = useState<SavedProperty[]>([
    {
      id: '1',
      title: 'Luxury Villa with Pool',
      address: {
        city: 'Miami',
        country: 'USA'
      },
      pricing: {
        basePrice: 350
      },
      ratings: {
        overall: 4.9,
        totalReviews: 203
      },
      photos: [{ url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop' }]
    },
    {
      id: '2',
      title: 'Mountain Cabin Retreat',
      address: {
        city: 'Aspen',
        country: 'USA'
      },
      pricing: {
        basePrice: 180
      },
      ratings: {
        overall: 4.7,
        totalReviews: 45
      },
      photos: [{ url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop' }]
    }
  ])

  const fallbackConversations: ConversationListItem[] = [
    {
      id: 'conv-host',
      type: 'CLIENT_HOST',
      status: 'OPEN',
      otherParticipant: { id: 'host-1', name: 'Aisha (Host)', role: 'HOST' },
      lastMessageAt: new Date().toISOString(),
      lastMessagePreview: 'See you next month! Let me know if you need anything else.',
      bookingId: 'BKG-2048',
      propertyId: 'prop-1',
      unread: 1
    },
    {
      id: 'conv-support',
      type: 'CLIENT_ADMIN',
      status: 'OPEN',
      otherParticipant: { id: 'admin-1', name: 'Houseiana Support', role: 'ADMIN' },
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      lastMessagePreview: 'We have updated your invoice. Please review.',
      unread: 0
    }
  ]

  const fallbackMessages: Record<string, ChatMessage[]> = {
    'conv-host': [
      {
        id: 'm1',
        body: 'Hi Aisha, can I check in early around 1pm?',
        senderId: 'guest-1',
        senderRole: 'CLIENT',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
      },
      {
        id: 'm2',
        body: 'Hi! Yes, that works. The cleaner will be done by 12:30pm.',
        senderId: 'host-1',
        senderRole: 'HOST',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4.5).toISOString()
      },
      {
        id: 'm3',
        body: 'Amazing, thank you! See you soon.',
        senderId: 'guest-1',
        senderRole: 'CLIENT',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString()
      }
    ],
    'conv-support': [
      {
        id: 's1',
        body: 'Hello! I need the invoice for my last trip.',
        senderId: 'guest-1',
        senderRole: 'CLIENT',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
      },
      {
        id: 's2',
        body: 'Sure, I will send it shortly. Do you need it emailed or downloaded here?',
        senderId: 'admin-1',
        senderRole: 'ADMIN',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7.5).toISOString()
      }
    ]
  }

  const startNewSearch = () => {
    router.push('/discover')
  }

  const refreshWishlist = async () => {
    // Placeholder for future API-driven wishlist fetch
    return Promise.resolve()
  }

  const fetchExplore = async () => {
    setExploreError(null)
    setExploreLoading(true)
    try {
      const response = await fetch('/api/properties?limit=6').catch(() => null)
      if (response && response.ok) {
        const data = await response.json()
        const items = data?.properties || data?.items || data || []
        if (Array.isArray(items) && items.length) {
          const normalized = items.map((item: any) => ({
            id: item.id,
            title: item.title,
            address: {
              city: item.city || item.address?.city || '—',
              country: item.country || item.address?.country || '—'
            },
            pricing: {
              basePrice: item.pricePerNight || item.pricing?.basePrice || 0
            },
            ratings: {
              overall: item.averageRating || 4.8,
              totalReviews: item.totalReviews || 0
            },
            photos: item.photos?.length
              ? (typeof item.photos[0] === 'string'
                  ? item.photos.map((url: string) => ({ url }))
                  : item.photos)
              : [{ url: item.coverPhoto || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop' }]
          })) as SavedProperty[]
          setExploreResults(normalized)
          return
        }
      }
      // fallback to saved properties
      setExploreResults(savedProperties)
    } catch (err) {
      setExploreError(err instanceof Error ? err.message : 'Failed to load recommendations')
      setExploreResults(savedProperties)
    } finally {
      setExploreLoading(false)
    }
  }

  const viewBookingDetails = (bookingId: string) => {
    router.push(`/booking/${bookingId}`)
  }

  const viewPropertyDetails = (propertyId: string) => {
    router.push(`/property/${propertyId}`)
  }

  const messageHost = (hostId: string) => {
    router.push(`/messages/${hostId}`)
  }

  const handleSignOut = () => {
    try {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
      const { logout } = useAuthStore.getState()
      logout()
      router.push('/')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  const formatCurrency = (value: number) =>
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const formatDateShort = (value: string) =>
    new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const daysUntil = (value: string) => {
    const diff = new Date(value).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const handleSendMessage = async () => {
    if (!selectedConversationId || !messageInput.trim()) return
    const tempId = `local-${Date.now()}`
    const newMessage: ChatMessage = {
      id: tempId,
      body: messageInput.trim(),
      senderId: user?.id || 'guest-1',
      senderRole: 'CLIENT',
      createdAt: new Date().toISOString()
    }

    setConversationMessages((prev) => ({
      ...prev,
      [selectedConversationId]: [...(prev[selectedConversationId] || []), newMessage]
    }))
    setMessageInput('')

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const conversation = conversations.find((c) => c.id === selectedConversationId)
      const receiverId = conversation?.otherParticipant?.id

      if (!token || !receiverId) return

      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId,
          body: newMessage.body,
          bookingId: conversation?.bookingId,
          propertyId: conversation?.propertyId
        })
      })
    } catch (err) {
      console.error('Failed to send message', err)
      setMessagesError('Message sent locally. Sync will retry when connection stabilizes.')
    }
  }

  const statusStyles: Record<Payment['status'], string> = {
    Paid: 'bg-green-50 text-green-700 border-green-100',
    Pending: 'bg-amber-50 text-amber-700 border-amber-100',
    Refunded: 'bg-blue-50 text-blue-700 border-blue-100',
    Failed: 'bg-rose-50 text-rose-700 border-rose-100'
  }

  const normalizeBooking = (booking: any): Booking => {
    const propertyPhotos = booking.property?.photos
    const firstPhoto =
      booking.property?.coverPhoto ||
      (Array.isArray(propertyPhotos) && propertyPhotos.length
        ? typeof propertyPhotos[0] === 'string'
          ? propertyPhotos[0]
          : propertyPhotos[0]?.url
        : undefined)

    const addressParts = [booking.property?.city, booking.property?.country].filter(Boolean).join(', ')

    return {
      id: booking.id,
      property: {
        title: booking.property?.title || 'Booked property',
        address: addressParts || booking.property?.address,
        city: booking.property?.city,
        country: booking.property?.country,
        coverPhoto: firstPhoto,
        photos: propertyPhotos
      },
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      status: booking.status || 'PENDING',
      hostId: booking.hostId
    }
  }

  const fetchTrips = async () => {
    setTripsError(null)
    setTripsLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) {
        setTripsError('Please sign in to view your trips.')
        return
      }

      const response = await fetch('/api/bookings?role=guest&limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || 'Failed to load trips')
      }

      const data = await response.json()
      const apiBookings: any[] = data.bookings || data.items || []
      setTrips(apiBookings.map(normalizeBooking))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load trips'
      setTripsError(message)
    } finally {
      setTripsLoading(false)
    }
  }

  useEffect(() => {
    if ((activeTab === 'my-trips' || activeTab === 'dashboard') && !tripsLoading && trips.length === 0 && !tripsError) {
      fetchTrips()
    }
  }, [activeTab, tripsLoading, trips.length, tripsError])

  useEffect(() => {
    if (activeTab === 'explore' && !exploreLoading && exploreResults.length === 0 && !exploreError) {
      fetchExplore()
    }
  }, [activeTab, exploreLoading, exploreResults.length, exploreError])

  const fetchPayments = async () => {
    setPaymentsError(null)
    setIsPaymentsLoading(true)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

      if (!token) {
        setPaymentsError('Please sign in to view your payments.')
        return
      }

      const response = await fetch('/api/payments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || 'Failed to load payments')
      }

      const data: PaymentsResponse = await response.json()
      setPaymentsData(data)
      setPaymentsLoaded(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load payments'
      setPaymentsError(message)
    } finally {
      setIsPaymentsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'payments' && !paymentsLoaded && !isPaymentsLoading) {
      fetchPayments()
    }
  }, [activeTab, paymentsLoaded, isPaymentsLoading])

  const normalizeConversation = (conv: any): ConversationListItem => {
    const other =
      conv.otherParticipant ||
      conv.participant1 ||
      conv.participant2
        ? {
            id: conv.otherParticipant?.id || conv.participant1?.id || conv.participant2?.id || '',
            name:
              conv.otherParticipant?.name ||
              [conv.participant1?.firstName, conv.participant1?.lastName].filter(Boolean).join(' ') ||
              [conv.participant2?.firstName, conv.participant2?.lastName].filter(Boolean).join(' ') ||
              'Traveler',
            role: conv.otherParticipant?.role || conv.participant1?.role || conv.participant2?.role,
            avatar: conv.otherParticipant?.avatar || conv.participant1?.avatar || conv.participant2?.avatar
          }
        : undefined

    return {
      id: conv.id,
      type: conv.type || 'CLIENT_HOST',
      status: conv.status || 'OPEN',
      otherParticipant: other,
      lastMessageAt: conv.lastMessageAt || conv.updatedAt,
      lastMessagePreview: conv.lastMessagePreview,
      bookingId: conv.bookingId,
      propertyId: conv.propertyId,
      unread: conv.unread || 0
    }
  }

  const fetchConversations = async () => {
    setMessagesError(null)
    setMessagesLoading(true)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) {
        throw new Error('Please sign in to view your messages.')
      }

      const res = await fetch('/api/conversations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || 'Failed to load messages')
      }

      const data = await res.json()
      const apiConversations = data.data?.conversations || data.conversations || []
      const mapped = apiConversations.map(normalizeConversation)
      setConversations(mapped)
      setMessagesLoaded(true)
      if (!selectedConversationId && mapped.length) {
        setSelectedConversationId(mapped[0].id)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load messages'
      setMessagesError(msg)
      setConversations(fallbackConversations)
      if (!selectedConversationId && fallbackConversations.length) {
        setSelectedConversationId(fallbackConversations[0].id)
      }
    } finally {
      setMessagesLoading(false)
    }
  }

  const fetchConversationMessages = async (conversationId: string) => {
    if (!conversationId) return
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) {
        throw new Error('Please sign in to view messages.')
      }

      const res = await fetch(`/api/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        throw new Error('Failed to load conversation')
      }

      const data = await res.json()
      const msgs = (data.messages || data.data?.messages || []).map((m: any) => ({
        id: m.id,
        body: m.body || m.content,
        senderId: m.senderId || m.sender?.id,
        senderRole: m.senderRole || m.sender?.role || 'CLIENT',
        createdAt: m.createdAt || m.created_at,
      })) as ChatMessage[]
      setConversationMessages((prev) => ({ ...prev, [conversationId]: msgs }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load conversation'
      setMessagesError(msg)
      if (fallbackMessages[conversationId]) {
        setConversationMessages((prev) => ({ ...prev, [conversationId]: fallbackMessages[conversationId] }))
      }
    }
  }

  useEffect(() => {
    if (activeTab === 'messages' && !messagesLoaded && !messagesLoading) {
      fetchConversations()
    }
  }, [activeTab, messagesLoaded, messagesLoading])

  useEffect(() => {
    if (activeTab === 'messages' && selectedConversationId && !conversationMessages[selectedConversationId]) {
      if (fallbackMessages[selectedConversationId]) {
        setConversationMessages((prev) => ({ ...prev, [selectedConversationId]: fallbackMessages[selectedConversationId] }))
      } else {
        fetchConversationMessages(selectedConversationId)
      }
    }
  }, [activeTab, selectedConversationId, conversationMessages])

  const defaultSummary: PaymentSummary = {
    outstanding: 0,
    credits: 0,
    totalSpend: 0,
    successRate: 100
  }

  const summary = paymentsData?.summary || defaultSummary
  const paymentHistory = paymentsData?.history || []
  const upcomingCharges = paymentsData?.upcomingCharges || []
  const paymentMethods = paymentsData?.methods || []
  const defaultMethod = paymentMethods.find((method) => method.primary) || paymentMethods[0]

  const isUpcomingTrip = (trip: Booking) => {
    const checkout = new Date(trip.checkOut)
    const now = new Date()
    return ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(trip.status?.toUpperCase?.() || '') && checkout >= now
  }

  const upcomingTrips = trips.filter(isUpcomingTrip)
  const pastTrips = trips.filter((trip) => !isUpcomingTrip(trip))
  const highlightTrips = upcomingTrips.length ? upcomingTrips : upcomingBookings

  const tripStatusStyle = (status: string) => {
    const normalized = status?.toUpperCase?.() || ''
    if (normalized === 'CONFIRMED') return 'bg-green-50 text-green-700 border-green-100'
    if (normalized === 'PENDING') return 'bg-amber-50 text-amber-700 border-amber-100'
    if (normalized === 'COMPLETED') return 'bg-blue-50 text-blue-700 border-blue-100'
    if (normalized === 'CANCELLED' || normalized === 'REJECTED') return 'bg-rose-50 text-rose-700 border-rose-100'
    return 'bg-gray-50 text-gray-600 border-gray-100'
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-trips', label: 'My Trips', icon: Clock },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'support', label: 'Support', icon: HelpCircle }
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex">
      <aside className="w-80 bg-gray-900 text-white flex flex-col h-screen sticky top-0 shadow-2xl z-20 hidden lg:flex">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <span className="font-bold text-xl font-serif">H</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">Houseiana</h1>
              <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">Client Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-2xl border border-gray-700/50 mb-6">
            <div className="relative">
              {userProfile.profilePhoto ? (
                <img
                  src={userProfile.profilePhoto}
                  alt={userProfile.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 border-2 border-gray-700 flex items-center justify-center text-white font-bold text-sm">
                  {userProfile.initials}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{userProfile.name}</p>
              <p className="text-xs text-gray-400 truncate">Traveler</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 overflow-y-auto space-y-8 py-2 custom-scrollbar">
          <div>
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Discover</p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  activeTab === 'dashboard'
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('explore')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  activeTab === 'explore'
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Compass size={18} />
                <span>Explore</span>
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  activeTab === 'wishlist'
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Heart size={18} />
                <span>Wishlist</span>
              </button>
            </div>
          </div>

          <div>
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Manage</p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('my-trips')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  activeTab === 'my-trips'
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Clock size={18} />
                <span>My Trips</span>
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  activeTab === 'messages'
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <MessageCircle size={18} />
                <span>Messages</span>
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  activeTab === 'payments'
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <CreditCard size={18} />
                <span>Payments</span>
              </button>
            </div>
          </div>

          <div>
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Settings</p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  activeTab === 'profile'
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <User size={18} />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  activeTab === 'support'
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <HelpCircle size={18} />
                <span>Support</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 space-y-4 bg-gray-900">
          <div
            onClick={() => router.push('/host-dashboard')}
            className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 shadow-lg cursor-pointer group hover:from-gray-700 hover:to-gray-600 transition-all border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Become a Host</span>
              <ArrowRightLeft size={14} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[10px] text-gray-300 leading-relaxed mb-3">Earn extra income by sharing your space.</p>
            <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-3/4"></div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen bg-gray-50 relative">
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white">
              <span className="font-bold">H</span>
            </div>
            <span className="font-bold text-gray-900">Houseiana</span>
          </div>
          <button className="p-2 text-gray-600">
            <Settings size={24} />
          </button>
        </div>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          {isLoading && (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 font-medium">Loading your adventure...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl relative mb-8 flex items-center gap-3" role="alert">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="block sm:inline font-medium">{error}</span>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {activeTab === 'dashboard' && (
                <div className="space-y-10 animate-fade-in">
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 text-white shadow-2xl">
                    <div className="absolute inset-0">
                      <div className="absolute -left-10 top-10 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
                      <div className="absolute right-0 -bottom-10 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_30%)]" />
                    </div>
                    <div className="relative px-6 md:px-10 py-10 flex flex-col lg:flex-row gap-8 lg:items-center">
                      <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold tracking-wide">
                          <Star size={14} className="text-yellow-300 fill-yellow-300" />
                          Premium guest benefits active
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">{user?.firstName || 'Guest'}</span>
                        </h1>
                        <p className="text-white/70 text-lg max-w-2xl">
                          Plan your next stay, track active trips, and pick up where you left off with saved places.
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <button
                            onClick={startNewSearch}
                            className="px-6 py-3 bg-white text-gray-900 rounded-2xl font-bold hover:bg-orange-50 transition-colors flex items-center gap-2"
                          >
                            <Search size={18} />
                            Discover stays
                          </button>
                          <button
                            onClick={() => setActiveTab('wishlist')}
                            className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-2xl font-bold hover:bg-white/15 transition-colors flex items-center gap-2"
                          >
                            <Heart size={18} />
                            View wishlist
                          </button>
                        </div>
                      </div>
                      <div className="bg-white/10 border border-white/15 rounded-2xl p-6 w-full lg:w-80 backdrop-blur-md">
                        <p className="text-sm text-white/70 font-semibold">Next up</p>
                        {highlightTrips.length ? (
                          <div className="mt-3 space-y-2">
                            <p className="text-xl font-bold">{highlightTrips[0].property.title}</p>
                            <p className="text-sm text-white/70 flex items-center gap-2">
                              <Calendar size={14} />
                              {formatDateShort(highlightTrips[0].checkIn)} - {formatDateShort(highlightTrips[0].checkOut)}
                            </p>
                            <div className="flex items-center justify-between text-sm text-white/80">
                              <span className="flex items-center gap-2"><MapPin size={14} /> {highlightTrips[0].property.address || 'TBD'}</span>
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100/10 text-green-200 text-xs font-bold border border-green-200/20">
                                <TrendingUp size={12} /> {daysUntil(highlightTrips[0].checkIn)}d
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 text-sm text-white/70">No upcoming trips. Ready to explore?</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                      {
                        title: 'Upcoming trips',
                        value: highlightTrips.length,
                        icon: <Calendar size={18} />,
                        accent: 'bg-blue-50 text-blue-600',
                        onClick: () => setActiveTab('my-trips')
                      },
                      {
                        title: 'Saved places',
                        value: savedProperties.length,
                        icon: <Heart size={18} />,
                        accent: 'bg-rose-50 text-rose-600',
                        onClick: () => setActiveTab('wishlist')
                      },
                      {
                        title: 'Messages',
                        value: 2,
                        icon: <MessageCircle size={18} />,
                        accent: 'bg-purple-50 text-purple-600'
                      },
                      {
                        title: 'Travel points',
                        value: 450,
                        icon: <Star size={18} />,
                        accent: 'bg-amber-50 text-amber-600'
                      }
                    ].map((card) => (
                      <div
                        key={card.title}
                        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 cursor-pointer"
                        onClick={card.onClick}
                      >
                        <div className={`p-3 rounded-xl ${card.accent}`}>{card.icon}</div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{card.title}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">Upcoming trips</h3>
                        <button onClick={() => setActiveTab('my-trips')} className="text-sm font-semibold text-orange-600 hover:text-orange-700">View all</button>
                      </div>
                      {highlightTrips.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-10 text-center">
                          <div className="w-14 h-14 bg-gray-50 rounded-full mx-auto mb-3 flex items-center justify-center text-gray-400">
                            <Compass size={28} />
                          </div>
                          <p className="font-bold text-gray-900">No upcoming trips</p>
                          <p className="text-sm text-gray-500 mt-1">Book your next stay to see it here.</p>
                          <button onClick={startNewSearch} className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors">
                            Plan a trip
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {highlightTrips.map((booking) => {
                            const photo = booking.property.coverPhoto || booking.property.photos?.[0]
                            return (
                              <div key={booking.id} className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4">
                                <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden bg-gray-50">
                                  {photo ? (
                                    <img src={photo} alt={booking.property.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No photo</div>
                                  )}
                                </div>
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase font-semibold">Booking</p>
                                      <h4 className="text-lg font-bold text-gray-900">{booking.property.title}</h4>
                                      <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <MapPin size={14} />
                                        {booking.property.address || 'Location pending'}
                                      </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tripStatusStyle(booking.status)}`}>
                                      {booking.status}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                                      <Calendar size={14} className="text-orange-500" />
                                      <span className="font-semibold">{formatDateShort(booking.checkIn)}</span>
                                      <span className="text-gray-400">→</span>
                                      <span className="font-semibold">{formatDateShort(booking.checkOut)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                                      <Clock size={14} className="text-gray-500" />
                                      <span>{daysUntil(booking.checkIn)} days away</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">ID: {booking.id}</span>
                                    <button onClick={() => viewBookingDetails(booking.id)} className="text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1">
                                      View <ChevronRight size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-900 text-white rounded-3xl p-5 shadow-lg">
                        <p className="text-xs text-white/70 font-semibold uppercase tracking-wide">Quick win</p>
                        <h3 className="text-xl font-bold">Finish booking</h3>
                        <p className="text-sm text-white/80 mt-1">Jump back into your saved favorites.</p>
                        <button onClick={() => setActiveTab('wishlist')} className="mt-4 px-4 py-3 bg-white text-gray-900 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors">
                          Go to wishlist
                        </button>
                      </div>

                      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-gray-900">Saved highlights</h3>
                          <button onClick={() => setActiveTab('wishlist')} className="text-sm font-semibold text-orange-600 hover:text-orange-700">View all</button>
                        </div>
                        <div className="space-y-3">
                          {savedProperties.slice(0, 2).map((property) => (
                            <div key={property.id} className="flex gap-3 items-center cursor-pointer" onClick={() => viewPropertyDetails(property.id)}>
                              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">
                                <img src={property.photos[0].url} alt={property.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 truncate">{property.title}</p>
                                <p className="text-xs text-gray-500">{property.address.city}, {property.address.country}</p>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">${property.pricing.basePrice}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-gray-900">Travel checklist</h3>
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">On track</span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Confirmed ID</p>
                          <p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Payment method saved</p>
                          <p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Notifications on</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'my-trips' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">My Trips</h2>
                      <p className="text-gray-600 text-sm">Manage upcoming stays, track status, and revisit past adventures.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={fetchTrips}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={startNewSearch}
                        className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 transition-colors flex items-center gap-2"
                      >
                        <Search size={16} />
                        Book a stay
                      </button>
                    </div>
                  </div>

                  {!isAuthenticated && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500" />
                        <div>
                          <p className="font-semibold">Please sign in to view your trips.</p>
                          <p className="text-amber-700/90 text-xs">Your bookings will appear once you’re authenticated.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push('/sign-in')}
                          className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 transition-colors"
                        >
                          Sign in
                        </button>
                        <button
                          onClick={() => router.push('/support')}
                          className="px-4 py-2 rounded-lg border border-amber-200 text-amber-800 text-sm font-semibold hover:bg-amber-100 transition-colors"
                        >
                          Contact support
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold">Upcoming</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{upcomingTrips.length}</p>
                      <p className="text-xs text-gray-500 mt-1">Confirmed or pending</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold">Past trips</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{pastTrips.length}</p>
                      <p className="text-xs text-gray-500 mt-1">Completed or cancelled</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 font-semibold">Status</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {trips.length ? `${Math.round((upcomingTrips.length / Math.max(trips.length, 1)) * 100)}%` : '—'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Active bookings</p>
                    </div>
                    <div className="bg-gray-900 text-white rounded-2xl p-4 shadow-md">
                      <p className="text-xs text-white/70 font-semibold">Need help?</p>
                      <p className="text-lg font-bold mt-1">Message support</p>
                      <p className="text-xs text-white/70 mt-1">We can adjust dates or update guests.</p>
                      <button className="mt-3 px-3 py-2 bg-white text-gray-900 rounded-xl text-xs font-bold hover:bg-orange-50 transition-colors">
                        Contact support
                      </button>
                    </div>
                  </div>

                  {tripsError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {tripsError}
                    </div>
                  )}

                  {tripsLoading ? (
                    <div className="py-16 flex flex-col items-center justify-center text-gray-500">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mb-3"></div>
                      Loading your trips...
                    </div>
                  ) : trips.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-10 text-center">
                      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mx-auto mb-3">
                        <Compass size={28} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{isAuthenticated ? 'No trips yet' : 'Please sign in to view your trips.'}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {isAuthenticated
                          ? 'When you book a stay, it will appear here.'
                          : 'Sign in to load your bookings, or reach out if you need help.'}
                      </p>
                      <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={startNewSearch}
                          className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
                        >
                          Explore stays
                        </button>
                        {!isAuthenticated && (
                          <button
                            onClick={() => router.push('/sign-in')}
                            className="px-6 py-3 border border-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                          >
                            Sign in
                          </button>
                        )}
                        <button
                          onClick={() => router.push('/support')}
                          className="px-6 py-3 border border-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Contact support
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-900">Upcoming & active</h3>
                          <span className="text-xs font-semibold text-gray-500">
                            {upcomingTrips.length} {upcomingTrips.length === 1 ? 'trip' : 'trips'}
                          </span>
                        </div>
                        {upcomingTrips.length === 0 ? (
                          <p className="text-sm text-gray-500">No upcoming trips.</p>
                        ) : (
                          <div className="space-y-3">
                            {upcomingTrips.map((trip) => {
                              const photo = trip.property.coverPhoto || trip.property.photos?.[0]
                              return (
                                <div key={trip.id} className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row gap-4">
                                  <div className="w-full sm:w-48 h-36 rounded-2xl overflow-hidden bg-gray-100">
                                    {photo ? (
                                      <img src={photo} alt={trip.property.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No photo</div>
                                    )}
                                  </div>
                                  <div className="flex-1 flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Booking</p>
                                        <h4 className="text-lg font-bold text-gray-900">{trip.property.title}</h4>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                          <MapPin size={14} />
                                          {trip.property.address || 'Location pending'}
                                        </p>
                                      </div>
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tripStatusStyle(trip.status)}`}>
                                        {trip.status}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                                        <Calendar size={14} className="text-orange-500" />
                                        <span className="font-semibold">{formatDateShort(trip.checkIn)}</span>
                                        <span className="text-gray-400">→</span>
                                        <span className="font-semibold">{formatDateShort(trip.checkOut)}</span>
                                      </div>
                                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                                        <Clock size={14} className="text-gray-500" />
                                        <span>{trip.status === 'PENDING' ? 'Awaiting confirmation' : 'Confirmed'}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="text-xs text-gray-500">ID: {trip.id}</div>
                                      <button
                                        onClick={() => viewBookingDetails(trip.id)}
                                        className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                      >
                                        View details
                                        <ChevronRight size={16} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-900">Past trips</h3>
                          <span className="text-xs font-semibold text-gray-500">
                            {pastTrips.length} {pastTrips.length === 1 ? 'trip' : 'trips'}
                          </span>
                        </div>
                        {pastTrips.length === 0 ? (
                          <p className="text-sm text-gray-500">No past trips yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {pastTrips.map((trip) => {
                              const photo = trip.property.coverPhoto || trip.property.photos?.[0]
                              return (
                                <div key={trip.id} className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row gap-4">
                                  <div className="w-full sm:w-36 h-28 rounded-2xl overflow-hidden bg-gray-100">
                                    {photo ? (
                                      <img src={photo} alt={trip.property.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No photo</div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <h4 className="text-base font-bold text-gray-900">{trip.property.title}</h4>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                          <MapPin size={12} />
                                          {trip.property.address || 'Location pending'}
                                        </p>
                                      </div>
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tripStatusStyle(trip.status)}`}>
                                        {trip.status}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {formatDateShort(trip.checkIn)} – {formatDateShort(trip.checkOut)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => viewBookingDetails(trip.id)}
                                      className="text-sm font-semibold text-gray-700 hover:text-orange-600"
                                    >
                                      View
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Wishlist</h2>
                      <p className="text-gray-600 text-sm">Your saved stays, ready to book.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={refreshWishlist}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={startNewSearch}
                        className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 transition-colors flex items-center gap-2"
                      >
                        <Search size={16} />
                        Find more
                      </button>
                    </div>
                  </div>

                  {savedProperties.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-10 text-center">
                      <div className="w-14 h-14 bg-gray-50 rounded-full mx-auto mb-3 flex items-center justify-center text-gray-400">
                        <Heart size={28} />
                      </div>
                      <p className="font-bold text-gray-900">No saved places yet</p>
                      <p className="text-sm text-gray-500 mt-1">Add properties to your wishlist to compare and book later.</p>
                      <button
                        onClick={startNewSearch}
                        className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
                      >
                        Start exploring
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {savedProperties.map((property) => (
                        <div
                          key={property.id}
                          className="bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all group cursor-pointer"
                          onClick={() => viewPropertyDetails(property.id)}
                        >
                          <div className="relative h-52 rounded-3xl overflow-hidden">
                            <img
                              src={property.photos[0].url}
                              alt={property.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-rose-500 shadow-sm">
                              <Heart size={16} fill="currentColor" />
                            </button>
                            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1">
                              <Star size={10} className="text-yellow-400 fill-yellow-400" />
                              {property.ratings.overall} ({property.ratings.totalReviews})
                            </div>
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-gray-900 line-clamp-2">{property.title}</h3>
                              <p className="text-sm font-bold text-gray-900">${property.pricing.basePrice}<span className="text-xs text-gray-400 font-normal">/night</span></p>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin size={12} />
                              {property.address.city}, {property.address.country}
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <button className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                                View details
                                <ChevronRight size={14} />
                              </button>
                              <button className="text-xs font-semibold text-gray-600 hover:text-orange-600 flex items-center gap-1">
                                Share
                                <ArrowUpRight size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'explore' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Explore</h2>
                      <p className="text-gray-600 text-sm">Discover new properties tailored to you.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={fetchExplore}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={startNewSearch}
                        className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 transition-colors flex items-center gap-2"
                      >
                        <Search size={16} />
                        Open search
                      </button>
                    </div>
                  </div>

                  {exploreError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {exploreError}
                    </div>
                  )}

                  {exploreLoading ? (
                    <div className="py-14 flex flex-col items-center justify-center text-gray-500">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mb-3"></div>
                      Loading recommendations...
                    </div>
                  ) : exploreResults.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-10 text-center">
                      <div className="w-14 h-14 bg-gray-50 rounded-full mx-auto mb-3 flex items-center justify-center text-gray-400">
                        <Compass size={28} />
                      </div>
                      <p className="font-bold text-gray-900">No suggestions yet</p>
                      <p className="text-sm text-gray-500 mt-1">Adjust your search filters to see recommendations.</p>
                      <button
                        onClick={startNewSearch}
                        className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
                      >
                        Start searching
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {exploreResults.map((property) => (
                        <div
                          key={property.id}
                          className="bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all group cursor-pointer"
                          onClick={() => viewPropertyDetails(property.id)}
                        >
                          <div className="relative h-56 rounded-3xl overflow-hidden">
                            <img
                              src={property.photos[0].url}
                              alt={property.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 flex gap-2">
                              <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-rose-500 shadow-sm">
                                <Heart size={16} />
                              </button>
                              <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 shadow-sm">
                                <ArrowUpRight size={16} />
                              </button>
                            </div>
                            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1">
                              <Star size={10} className="text-yellow-400 fill-yellow-400" />
                              {property.ratings.overall} ({property.ratings.totalReviews || 0})
                            </div>
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-gray-900 line-clamp-2">{property.title}</h3>
                              <p className="text-sm font-bold text-gray-900">${property.pricing.basePrice}<span className="text-xs text-gray-400 font-normal">/night</span></p>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin size={12} />
                              {property.address.city}, {property.address.country}
                            </p>
                            <div className="flex items-center justify-between pt-1 text-xs text-gray-500">
                              <span>Free cancellation · Instant book</span>
                              <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 font-bold">Top pick</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                      <p className="text-gray-600 text-sm">Chat with hosts or Houseiana support about your stays.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={fetchConversations}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => setActiveTab('support')}
                        className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 transition-colors flex items-center gap-2"
                      >
                        <HelpCircle size={16} />
                        Contact support
                      </button>
                    </div>
                  </div>

                  {messagesError && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-500" />
                      <span>{messagesError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Inbox</p>
                          <p className="text-lg font-bold text-gray-900">Conversations</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold">
                          {conversations.length || fallbackConversations.length} active
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3">
                        <Search size={16} className="text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search hosts or topics"
                          className="bg-transparent flex-1 text-sm outline-none text-gray-900 placeholder:text-gray-500"
                          onChange={(e) => {
                            const term = e.target.value.toLowerCase()
                            if (!term) {
                              setConversations(conversations.length ? conversations : fallbackConversations)
                              return
                            }
                            const source = conversations.length ? conversations : fallbackConversations
                            setConversations(
                              source.filter((c) =>
                                (c.otherParticipant?.name || '').toLowerCase().includes(term) ||
                                (c.lastMessagePreview || '').toLowerCase().includes(term),
                              ),
                            )
                          }}
                        />
                      </div>
                      {messagesLoading ? (
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="animate-pulse bg-gray-50 rounded-2xl h-16" />
                          ))}
                        </div>
                      ) : (conversations.length ? conversations : fallbackConversations).length === 0 ? (
                        <div className="border border-dashed border-gray-200 rounded-2xl p-6 text-center text-sm text-gray-500">
                          No messages yet. Start a trip to message your host or reach support.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                          {(conversations.length ? conversations : fallbackConversations).map((conv) => (
                            <button
                              key={conv.id}
                              onClick={() => setSelectedConversationId(conv.id)}
                              className={`w-full text-left p-3 rounded-2xl border transition-all ${
                                selectedConversationId === conv.id
                                  ? 'border-orange-200 bg-orange-50 shadow-sm'
                                  : 'border-gray-100 bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-bold">
                                  {conv.otherParticipant?.name?.slice(0, 1) || 'H'}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="font-semibold text-gray-900 truncate">
                                      {conv.otherParticipant?.name || 'Conversation'}
                                    </p>
                                    {conv.lastMessageAt && (
                                      <span className="text-xs text-gray-500 whitespace-nowrap">{formatTime(conv.lastMessageAt)}</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 truncate">
                                    {conv.lastMessagePreview || 'Tap to open the conversation'}
                                  </p>
                                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                    <span className="px-2 py-1 rounded-full bg-gray-100 font-semibold">
                                      {conv.type === 'CLIENT_ADMIN' ? 'Support' : 'Host chat'}
                                    </span>
                                    {conv.unread ? (
                                      <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">
                                        {conv.unread} new
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col min-h-[520px]">
                      {selectedConversationId ? (
                        <>
                          {(() => {
                            const selectedConversation =
                              (conversations.length ? conversations : fallbackConversations).find(
                                (c) => c.id === selectedConversationId,
                              )
                            const thread = conversationMessages[selectedConversationId] || fallbackMessages[selectedConversationId] || []
                            return (
                              <>
                                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Chat</p>
                                    <h3 className="text-lg font-bold text-gray-900">
                                      {selectedConversation?.otherParticipant?.name || 'Conversation'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                      {selectedConversation?.type === 'CLIENT_ADMIN' ? 'Houseiana Support' : 'Host contact'}
                                    </p>
                                  </div>
                                  {selectedConversation?.bookingId && (
                                    <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-600 font-semibold">
                                      Booking {selectedConversation.bookingId}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-gray-50">
                                  {messagesLoading && !conversationMessages[selectedConversationId] ? (
                                    <div className="text-sm text-gray-500">Loading messages...</div>
                                  ) : thread.length === 0 ? (
                                    <div className="text-sm text-gray-500">No messages yet. Say hello!</div>
                                  ) : (
                                    thread.map((msg) => {
                                      const isSelf = msg.senderId === (user?.id || 'guest-1')
                                      return (
                                        <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                                          <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                                              isSelf ? 'bg-orange-600 text-white' : 'bg-white text-gray-900 border border-gray-100'
                                            }`}
                                          >
                                            <p className="text-sm leading-relaxed">{msg.body}</p>
                                            <div className={`text-[11px] mt-2 ${isSelf ? 'text-white/80' : 'text-gray-500'}`}>
                                              {formatTime(msg.createdAt)}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })
                                  )}
                                </div>
                                <div className="p-4 border-t border-gray-100">
                                  <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                    <input
                                      value={messageInput}
                                      onChange={(e) => setMessageInput(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault()
                                          handleSendMessage()
                                        }
                                      }}
                                      placeholder="Type a message..."
                                      className="flex-1 bg-transparent text-sm outline-none text-gray-900 placeholder:text-gray-500"
                                    />
                                    <button
                                      onClick={handleSendMessage}
                                      className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 transition-colors"
                                    >
                                      Send
                                    </button>
                                  </div>
                                </div>
                              </>
                            )
                          })()}
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm p-10">
                          Select a conversation to start chatting.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-8 animate-fade-in">
                  {!isAuthenticated && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500" />
                        <div>
                          <p className="font-semibold">Please sign in to view your payments.</p>
                          <p className="text-amber-700/90 text-xs">Your balance, methods, and history will load after signing in.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push('/sign-in')}
                          className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 transition-colors"
                        >
                          Sign in
                        </button>
                        <button
                          onClick={() => router.push('/support')}
                          className="px-4 py-2 rounded-lg border border-amber-200 text-amber-800 text-sm font-semibold hover:bg-amber-100 transition-colors"
                        >
                          Contact support
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 bg-gray-900 text-white rounded-3xl p-6 relative overflow-hidden">
                      <div className="absolute right-8 bottom-8 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
                      <div className="flex items-start justify-between gap-4 relative z-10">
                        <div>
                          <p className="text-sm text-gray-300 font-semibold">Current balance</p>
                          <h3 className="text-4xl font-bold mt-2">{formatCurrency(summary.outstanding)}</h3>
                          <p className="text-sm text-gray-400 mt-2">
                            Next payment scheduled via {defaultMethod ? `${defaultMethod.brand} •••• ${defaultMethod.last4}` : 'your saved method'}
                          </p>
                          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                              <p className="text-xs text-gray-300">Total spend</p>
                              <p className="text-lg font-bold">{formatCurrency(summary.totalSpend)}</p>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                              <p className="text-xs text-gray-300">Travel credits</p>
                              <p className="text-lg font-bold text-green-200">+{formatCurrency(summary.credits)}</p>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                              <p className="text-xs text-gray-300">Success rate</p>
                              <p className="text-lg font-bold">{summary.successRate}%</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/10 border border-white/10 rounded-2xl p-3 min-w-[160px] text-sm">
                          <div className="flex items-center gap-2 text-green-200 font-semibold">
                            <ShieldCheck size={18} /> Secure
                          </div>
                          <p className="text-gray-200 font-semibold mt-3">Autopay enabled</p>
                          <p className="text-xs text-gray-300 mt-1 leading-relaxed">Payments are verified and protected with Houseiana Shield.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Wallet className="text-orange-600" size={18} />
                            <p className="text-sm font-semibold text-gray-900">Default method</p>
                          </div>
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Auto</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {defaultMethod ? `${defaultMethod.brand} •••• ${defaultMethod.last4}` : 'Add a payment method'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {defaultMethod ? `Exp. ${defaultMethod.exp} — ${defaultMethod.name}` : 'No default method set'}
                        </p>
                      <div className="flex items-center gap-2 mt-4">
                        <button className="text-sm font-semibold text-orange-600 hover:text-orange-700" onClick={fetchPayments}>
                          Refresh
                        </button>
                        <span className="text-gray-300">•</span>
                        <button className="text-sm font-semibold text-gray-600 hover:text-gray-900">Add card</button>
                      </div>
                    </div>
                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-3xl p-5 shadow-lg">
                        <div className="flex items-center gap-3">
                          <Receipt size={20} />
                          <div>
                            <p className="text-sm font-semibold">Statements & Invoices</p>
                            <p className="text-xs text-white/80">Download receipts for your trips.</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <button className="bg-white text-orange-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors">
                            View invoices
                          </button>
                          <button className="bg-white/10 border border-white/20 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-white/15 transition-colors">
                            Download CSV
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Payment history</h3>
                          <p className="text-sm text-gray-500">Recent transactions across your stays.</p>
                        </div>
                        <button
                          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors"
                          onClick={fetchPayments}
                        >
                          <Download size={16} />
                          Refresh
                        </button>
                      </div>
                      {paymentsError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                          {paymentsError}
                        </div>
                      )}
                      {isPaymentsLoading ? (
                        <div className="py-10 flex flex-col items-center justify-center text-gray-500">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mb-3"></div>
                          Loading payments...
                        </div>
                      ) : paymentHistory.length === 0 ? (
                        <div className="py-10 text-center text-gray-500 space-y-3">
                          <p className="font-semibold text-gray-700">
                            {isAuthenticated ? 'No payment activity yet' : 'Please sign in to view your payments.'}
                          </p>
                          <p className="text-sm">
                            {isAuthenticated
                              ? 'Your transactions will show up here once you start booking.'
                              : 'Sign in to load your transactions and invoices.'}
                          </p>
                          <div className="flex items-center justify-center gap-3">
                            {!isAuthenticated && (
                              <button
                                onClick={() => router.push('/sign-in')}
                                className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors"
                              >
                                Sign in
                              </button>
                            )}
                            <button
                              onClick={() => router.push('/support')}
                              className="px-4 py-2 border border-gray-200 text-gray-800 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                              Contact support
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="py-3">Reference</th>
                                <th className="py-3">Property</th>
                                <th className="py-3">Date</th>
                                <th className="py-3 text-right">Amount</th>
                                <th className="py-3">Method</th>
                                <th className="py-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {paymentHistory.map((payment) => {
                                const statusStyle = statusStyles[payment.status] || 'bg-gray-50 text-gray-600 border-gray-100'
                                return (
                                  <tr key={payment.id} className="text-sm text-gray-700">
                                    <td className="py-3 font-semibold text-gray-900">{payment.id}</td>
                                    <td className="py-3">
                                      <div>
                                        <p className="font-semibold text-gray-900">{payment.property}</p>
                                        {payment.propertyLocation && (
                                          <p className="text-xs text-gray-500">{payment.propertyLocation}</p>
                                        )}
                                        <p className="text-xs text-gray-500 capitalize">{payment.type.replace('-', ' ')}</p>
                                      </div>
                                    </td>
                                    <td className="py-3 text-gray-600">{formatDate(payment.date)}</td>
                                    <td className="py-3 text-right font-bold text-gray-900">{formatCurrency(payment.amount)}</td>
                                    <td className="py-3 text-gray-600">{payment.method}</td>
                                    <td className="py-3">
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle}`}>
                                        {payment.status}
                                      </span>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-900">Upcoming charges</h3>
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Auto pay</span>
                        </div>
                        {upcomingCharges.length === 0 ? (
                          <p className="text-sm text-gray-500">No upcoming charges.</p>
                        ) : (
                          <div className="space-y-3">
                            {upcomingCharges.map((charge) => (
                              <div key={charge.id} className="flex items-start justify-between p-3 rounded-2xl border border-gray-100">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{charge.title}</p>
                                  <p className="text-xs text-gray-500 mt-1">Due {formatDate(charge.dueDate)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">{formatCurrency(charge.amount)}</p>
                                  <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${charge.status === 'scheduled' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {charge.status === 'scheduled' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                    {charge.status === 'scheduled' ? 'Scheduled' : 'Processing'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-900 text-white rounded-3xl p-5 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <ShieldCheck size={18} className="text-green-300" />
                          <p className="text-lg font-bold">Protection</p>
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed">
                          Every payment is encrypted and backed by Houseiana's customer protection. Refunds process back to your original method.
                        </p>
                        <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-orange-200">
                          Learn more
                          <ArrowUpRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Payment methods</h3>
                        <button className="text-sm font-semibold text-orange-600 hover:text-orange-700">Add</button>
                      </div>
                      {paymentMethods.length === 0 ? (
                        <p className="text-sm text-gray-500">No saved payment methods.</p>
                      ) : (
                        <div className="space-y-3">
                          {paymentMethods.map((method) => (
                            <div key={`${method.brand}-${method.last4}`} className="p-4 border border-gray-100 rounded-2xl flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{method.brand} •••• {method.last4}</p>
                                <p className="text-xs text-gray-500">Exp. {method.exp} — {method.name}</p>
                              </div>
                              <div className="text-right">
                                {method.primary ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                                    <CheckCircle2 size={14} />
                                    Default
                                  </span>
                                ) : (
                                  <button className="text-xs font-semibold text-gray-600 hover:text-orange-600">Make default</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle size={18} className="text-amber-500" />
                          <h3 className="text-lg font-bold text-gray-900">Resolution center</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Dispute a charge or request a refund directly with our billing team.</p>
                        <div className="space-y-2">
                          <button className="w-full px-4 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors">
                            Open a ticket
                          </button>
                          <button
                            className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                            onClick={() => router.push('/support')}
                          >
                            Message support
                          </button>
                        </div>
                      </div>

                    <div className="bg-gray-900 text-white rounded-3xl p-5 shadow-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowDownRight size={18} className="text-green-300" />
                        <p className="text-sm font-semibold text-green-100">Savings applied</p>
                      </div>
                      <h3 className="text-3xl font-bold">{formatCurrency(summary.credits)}</h3>
                      <p className="text-sm text-gray-200 mt-2">Credits automatically apply to your next payment.</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-300">
                        <span>Earn more by inviting friends</span>
                        <ArrowUpRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                      <p className="text-gray-600 text-sm">Manage your profile settings and preferences.</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 transition-colors">
                      Save changes
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account</p>
                            <h3 className="text-lg font-bold text-gray-900">Basic info</h3>
                          </div>
                          <button className="text-sm font-semibold text-gray-600 hover:text-orange-600">Edit</button>
                        </div>
                        <div className="flex items-center gap-4">
                          {userProfile.profilePhoto ? (
                            <img
                              src={userProfile.profilePhoto}
                              alt={userProfile.name}
                              className="w-14 h-14 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-lg">
                              {userProfile.initials}
                            </div>
                          )}
                          <div>
                            <p className="text-base font-bold text-gray-900">{userProfile.name}</p>
                            <p className="text-sm text-gray-500">{userProfile.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="p-4 border border-gray-100 rounded-2xl">
                            <p className="text-xs text-gray-500 font-semibold uppercase">First name</p>
                            <p className="text-gray-900 font-semibold">{user?.firstName || '—'}</p>
                          </div>
                          <div className="p-4 border border-gray-100 rounded-2xl">
                            <p className="text-xs text-gray-500 font-semibold uppercase">Last name</p>
                            <p className="text-gray-900 font-semibold">{user?.lastName || '—'}</p>
                          </div>
                          <div className="p-4 border border-gray-100 rounded-2xl">
                            <p className="text-xs text-gray-500 font-semibold uppercase">Phone</p>
                            <p className="text-gray-900 font-semibold">{user?.phone || 'Add phone'}</p>
                          </div>
                          <div className="p-4 border border-gray-100 rounded-2xl">
                            <p className="text-xs text-gray-500 font-semibold uppercase">Member since</p>
                            <p className="text-gray-900 font-semibold">{user?.memberSince || '—'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preferences</p>
                            <h3 className="text-lg font-bold text-gray-900">Travel settings</h3>
                          </div>
                          <button className="text-sm font-semibold text-gray-600 hover:text-orange-600">Edit</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="p-4 border border-gray-100 rounded-2xl">
                            <p className="text-xs text-gray-500 font-semibold uppercase">Language</p>
                            <p className="text-gray-900 font-semibold">{user?.preferredLanguage || 'English'}</p>
                          </div>
                          <div className="p-4 border border-gray-100 rounded-2xl">
                            <p className="text-xs text-gray-500 font-semibold uppercase">Currency</p>
                            <p className="text-gray-900 font-semibold">{user?.preferredCurrency || 'USD'}</p>
                          </div>
                          <div className="p-4 border border-gray-100 rounded-2xl">
                            <p className="text-xs text-gray-500 font-semibold uppercase">Notifications</p>
                            <p className="text-gray-900 font-semibold">Email + push</p>
                          </div>
                          <div className="p-4 border border-gray-100 rounded-2xl">
                            <p className="text-xs text-gray-500 font-semibold uppercase">Privacy</p>
                            <p className="text-gray-900 font-semibold">Profile visible to hosts</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Security</p>
                            <h3 className="text-lg font-bold text-gray-900">Password & sessions</h3>
                          </div>
                          <button className="text-sm font-semibold text-gray-600 hover:text-orange-600">Update</button>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
                          <div>
                            <p className="text-gray-900 font-semibold">Password last changed</p>
                            <p className="text-gray-500">Keep your account secure by updating regularly.</p>
                          </div>
                          <button className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50">
                            Change password
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Two-factor authentication coming soon
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-900 text-white rounded-3xl p-5 shadow-lg">
                        <p className="text-xs text-white/70 font-semibold uppercase tracking-wide">Verification</p>
                        <h3 className="text-xl font-bold mt-1">Identity status</h3>
                        <p className="text-sm text-white/80 mt-1">Add ID to unlock instant booking.</p>
                        <button className="mt-4 w-full bg-white text-gray-900 rounded-xl py-2.5 text-sm font-bold hover:bg-orange-50 transition-colors">
                          Complete KYC
                        </button>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-2 text-sm">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
                        <p className="text-gray-900 font-semibold">Support team</p>
                        <p className="text-gray-500">help@houseiana.com</p>
                        <button className="mt-2 text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                          Message support
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'support' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Support</h2>
                      <p className="text-gray-600 text-sm">Get help with bookings, payments, and account questions.</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 transition-colors flex items-center gap-2">
                      <MessageCircle size={16} />
                      Start chat
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <HelpCircle className="text-orange-600" size={18} />
                        <p className="text-sm font-semibold text-gray-900">Booking issues</p>
                      </div>
                      <p className="text-sm text-gray-600">Change dates, request refunds, or report host issues.</p>
                      <button className="mt-3 text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                        Open ticket
                        <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="text-orange-600" size={18} />
                        <p className="text-sm font-semibold text-gray-900">Payments</p>
                      </div>
                      <p className="text-sm text-gray-600">Receipts, failed payments, deposits, and refunds.</p>
                      <button className="mt-3 text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                        Visit billing help
                        <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="text-orange-600" size={18} />
                        <p className="text-sm font-semibold text-gray-900">Safety & account</p>
                      </div>
                      <p className="text-sm text-gray-600">Account security, profile updates, and verification.</p>
                      <button className="mt-3 text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                        View guides
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent tickets</p>
                          <h3 className="text-xl font-bold text-gray-900">Track your requests</h3>
                        </div>
                        <button className="text-sm font-semibold text-gray-600 hover:text-orange-600">See all</button>
                      </div>
                      <div className="space-y-3">
                        {[
                          { title: 'Change check-in time', status: 'Open', updated: '2h ago' },
                          { title: 'Refund request for beach house', status: 'In review', updated: '1d ago' }
                        ].map((ticket) => (
                          <div key={ticket.title} className="flex items-center justify-between border border-gray-100 rounded-2xl px-4 py-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{ticket.title}</p>
                              <p className="text-xs text-gray-500">Updated {ticket.updated}</p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                              {ticket.status}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <button className="px-4 py-3 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors">
                          Submit new request
                        </button>
                        <button className="text-sm font-semibold text-gray-700 hover:text-orange-600">
                          Message support
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-900 text-white rounded-3xl p-5 shadow-lg">
                        <p className="text-xs text-white/70 font-semibold uppercase tracking-wide">Live chat</p>
                        <h3 className="text-xl font-bold mt-2">Connect with an agent</h3>
                        <p className="text-sm text-white/80 mt-2">Average response under 5 minutes.</p>
                        <div className="mt-4 space-y-2 text-sm text-white/80">
                          <p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-300" /> 24/7 availability</p>
                          <p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-300" /> Multilingual support</p>
                        </div>
                        <button className="mt-4 w-full bg-white text-gray-900 rounded-xl py-2.5 text-sm font-bold hover:bg-orange-50 transition-colors">
                          Start live chat
                        </button>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Guides</p>
                        <h4 className="text-lg font-bold text-gray-900 mt-1">Top articles</h4>
                        <ul className="mt-3 space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <ChevronRight size={14} className="text-orange-500" />
                            How to change a booking
                          </li>
                          <li className="flex items-center gap-2">
                            <ChevronRight size={14} className="text-orange-500" />
                            Understanding deposits and holds
                          </li>
                          <li className="flex items-center gap-2">
                            <ChevronRight size={14} className="text-orange-500" />
                            ID verification checklist
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <KYCModal
        isOpen={showKYCModal}
        onComplete={() => {
          setShowKYCModal(false);
          window.location.href = '/client-dashboard';
        }}
      />
    </div>
  )
}

export default function ClientDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    }>
      <ClientDashboardContent />
    </Suspense>
  )
}
