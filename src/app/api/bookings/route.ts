import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BookingAPI } from '@/lib/backend-api'

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = (searchParams.get('role') || 'guest') as 'guest' | 'host'

    console.log('📋 Fetching bookings from backend API for user:', userId, 'role:', role)

    // Use Backend API instead of direct Prisma call
    const response = await BookingAPI.getUserBookings(userId, role)

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)
      return NextResponse.json(
        { error: response.error || 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    // Transform response data to match frontend expectations
    const bookings = response.data || []
    const items = bookings.map((booking: any) => ({
      id: booking.id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      numberOfNights: booking.numberOfNights || 0,
      amount: booking.totalPrice || 0,
      totalPrice: booking.totalPrice || 0,
      guests: booking.guests || 1,
      hostId: booking.hostId,
      property: booking.property || {
        title: 'Property',
        address: '',
        coverPhoto: null,
        photos: []
      }
    }))

    console.log(`✅ Found ${items.length} bookings from backend API`)

    return NextResponse.json({
      items,
      bookings: items, // Keep both for backwards compatibility
      pagination: {
        page: 1,
        limit: items.length,
        totalCount: items.length,
        totalPages: 1
      }
    })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Create new booking via Backend API
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const bookingData = await request.json()

    // Validate required fields
    const requiredFields = ['propertyId', 'checkIn', 'checkOut', 'guests']
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    const {
      propertyId,
      checkIn,
      checkOut,
      guests,
      totalPrice = 0,
      paymentMethod
    } = bookingData

    console.log('📋 Creating booking via backend API for user:', userId)

    // Use Backend API to create booking - backend handles user sync
    const response = await BookingAPI.create({
      propertyId,
      guestId: userId,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      paymentMethod
    })

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)

      // Handle conflict errors (dates not available)
      if (response.error?.includes('not available') || response.error?.includes('conflict')) {
        return NextResponse.json(
          { error: response.error },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: response.error || 'Failed to create booking' },
        { status: 400 }
      )
    }

    console.log('✅ Booking created via backend API:', response.data?.id)

    return NextResponse.json(response.data, { status: 201 })

  } catch (error) {
    console.error('Error creating booking:', error)

    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
