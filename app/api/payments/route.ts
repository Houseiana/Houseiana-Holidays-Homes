import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-server'
import { getUserFromRequest } from '@/lib/auth'

type Summary = {
  outstanding: number
  credits: number
  totalSpend: number
  successRate: number
}

type UpcomingCharge = {
  id: string
  title: string
  amount: number
  dueDate: string
  status: 'scheduled' | 'processing'
}

type PaymentMethod = {
  id: string
  brand: string
  last4: string
  exp: string
  name: string
  primary?: boolean
}

type PaymentHistoryItem = {
  id: string
  property: string
  propertyLocation?: string
  date: string
  amount: number
  status: 'Paid' | 'Pending' | 'Refunded' | 'Failed'
  method: string
  type: 'reservation' | 'security-deposit' | 'add-on' | 'refund' | 'payment'
}

type PaymentsResponse = {
  summary: Summary
  upcomingCharges: UpcomingCharge[]
  methods: PaymentMethod[]
  history: PaymentHistoryItem[]
}

const mapStatus = (status: string): PaymentHistoryItem['status'] => {
  switch (status) {
    case 'PAID':
      return 'Paid'
    case 'REFUNDED':
      return 'Refunded'
    case 'FAILED':
      return 'Failed'
    default:
      return 'Pending'
  }
}

const buildSummary = (history: PaymentHistoryItem[], upcoming: UpcomingCharge[]): Summary => {
  const paid = history.filter((p) => p.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0)
  const refunded = history.filter((p) => p.status === 'Refunded').reduce((acc, curr) => acc + curr.amount, 0)
  const totalAttempts = history.length || 1 // Avoid divide by zero
  const successful = history.filter((p) => ['Paid', 'Refunded'].includes(p.status)).length
  const outstanding = upcoming.reduce((acc, curr) => acc + curr.amount, 0)

  return {
    outstanding,
    credits: refunded,
    totalSpend: paid,
    successRate: Math.round((successful / totalAttempts) * 100)
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Fetch transactions, payment methods, and upcoming charges in parallel
    const [transactions, methods, upcomingBookings] = await Promise.all([
      (prisma as any).transaction.findMany({
        where: { userId: user.userId },
        orderBy: { date: 'desc' },
        take: 50
      }),
      (prisma as any).paymentMethod.findMany({
        where: { userId: user.userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
      }),
      (prisma as any).booking.findMany({
        where: {
          guestId: user.userId,
          paymentStatus: 'PENDING',
          status: { in: ['PENDING', 'CONFIRMED'] },
          checkIn: { gte: new Date() }
        },
        include: {
          property: {
            select: {
              title: true,
              city: true,
              country: true
            }
          }
        },
        orderBy: { checkIn: 'asc' },
        take: 10
      })
    ])

    const bookingIds = transactions
      .map((t: any) => t.bookingId)
      .filter(Boolean) as string[]

    const bookingMap = new Map<string, any>()

    if (bookingIds.length > 0) {
      const relatedBookings = await (prisma as any).booking.findMany({
        where: { id: { in: bookingIds } },
        include: {
          property: {
            select: {
              title: true,
              city: true,
              country: true
            }
          }
        }
      })

      relatedBookings.forEach((booking: any) => bookingMap.set(booking.id, booking))
    }

    const history: PaymentHistoryItem[] = transactions.map((transaction: any) => {
      const booking = transaction.bookingId ? bookingMap.get(transaction.bookingId) : null
      const propertyTitle = booking?.property?.title || 'Booking payment'
      const propertyLocation = booking?.property
        ? `${booking.property.city}, ${booking.property.country}`
        : undefined

      const type: PaymentHistoryItem['type'] =
        transaction.type === 'REFUND'
          ? 'refund'
          : booking?.status === 'PENDING'
            ? 'security-deposit'
            : 'reservation'

      return {
        id: transaction.id,
        property: propertyTitle,
        propertyLocation,
        date: transaction.date?.toISOString?.() || new Date().toISOString(),
        amount: transaction.amount,
        status: mapStatus(transaction.status),
        method: transaction.paymentMethod || 'N/A',
        type
      }
    })

    const upcomingCharges: UpcomingCharge[] = upcomingBookings.map((booking: any) => ({
      id: booking.id,
      title: booking.property?.title || 'Upcoming booking payment',
      amount: booking.totalPrice ?? booking.subtotal ?? 0,
      dueDate: booking.checkIn.toISOString(),
      status: 'scheduled'
    }))

    const defaultName = `${user.firstName} ${user.lastName}`.trim() || 'Guest'
    const mappedMethods: PaymentMethod[] = methods.map((method: any) => ({
      id: method.id,
      brand: method.brand,
      last4: method.last4,
      exp: method.expiry,
      name: defaultName,
      primary: method.isDefault
    }))

    const summary = buildSummary(history, upcomingCharges)

    const payload: PaymentsResponse = {
      summary,
      upcomingCharges,
      methods: mappedMethods,
      history
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
