import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { SupportAPI } from '@/lib/backend-api'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log(`🎫 Fetching support tickets via backend API for user: ${user.userId}`)

    // Backend handles all support ticket logic:
    // - Fetching user's tickets with message counts
    // - Calculating summary statistics
    // - Category distribution
    const response = await SupportAPI.getUserTickets(user.userId)

    if (!response.success) {
      console.error('❌ Backend API error:', response.error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    console.log(`✅ Support tickets fetched via backend API`)

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
