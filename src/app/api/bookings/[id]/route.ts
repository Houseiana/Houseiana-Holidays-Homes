import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { BookingAPI } from '@/lib/backend-api'

// PATCH /api/bookings/[id] - Update booking status via Backend API
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { action, reason } = await request.json()
    const bookingId = params.id

    console.log(`📋 Processing booking action '${action}' for booking:`, bookingId)

    let response;

    // Handle different actions via Backend API
    switch (action) {
      case 'approve':
        response = await BookingAPI.approve(bookingId, user.userId)
        break

      case 'decline':
      case 'reject':
        response = await BookingAPI.reject(bookingId, user.userId, reason)
        break

      case 'cancel':
        response = await BookingAPI.cancel(bookingId, user.userId, reason)
        break

      case 'mark-paid':
      case 'confirm':
        response = await BookingAPI.confirm(bookingId)
        break

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)

      // Map backend errors to appropriate HTTP status codes
      if (response.error?.includes('not found')) {
        return NextResponse.json(
          { error: response.error },
          { status: 404 }
        )
      }
      if (response.error?.includes('permission') || response.error?.includes('authorized')) {
        return NextResponse.json(
          { error: response.error },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: response.error || `Failed to ${action} booking` },
        { status: 400 }
      )
    }

    console.log(`✅ Booking ${action} completed via backend API`)

    return NextResponse.json({
      success: true,
      booking: response.data,
      message: `Booking ${action} successful`
    })

  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/bookings/[id] - Soft delete a booking via Backend API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const bookingId = params.id

    console.log('📋 Deleting booking via backend API:', bookingId)

    // Cancel the booking via backend (soft delete equivalent)
    const response = await BookingAPI.cancel(bookingId, user.userId, 'User requested deletion')

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)
      return NextResponse.json(
        { error: response.error || 'Failed to delete booking' },
        { status: 400 }
      )
    }

    console.log('✅ Booking deleted via backend API')

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
