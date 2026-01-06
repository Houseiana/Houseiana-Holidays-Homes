import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { TripsAPI } from '@/lib/backend-api'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log(`🧳 Fetching trips via backend API for user: ${user.userId}`)

    // Backend handles all trip logic:
    // - Fetching upcoming and past bookings
    // - Including property details
    // - Calculating summary statistics
    const response = await TripsAPI.getUserTrips(user.userId)

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    console.log(`✅ Trips fetched via backend API`)

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
