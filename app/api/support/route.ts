import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-server'
import { getUserFromRequest } from '@/lib/auth'

type TicketItem = {
  id: string
  category: string
  subject: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED'
  bookingId?: string
  createdAt: string
  updatedAt: string
  closedAt?: string
  messageCount: number
  lastMessageAt?: string
  lastMessagePreview?: string
}

type SupportSummary = {
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  totalTickets: number
  avgResponseTime: string
}

type SupportResponse = {
  summary: SupportSummary
  tickets: TicketItem[]
  categories: Array<{
    name: string
    count: number
  }>
}

const formatCategory = (category: string): string => {
  return category
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Fetch all user support tickets with message counts
    const tickets = await (prisma as any).supportTicket.findMany({
      where: {
        userId: user.userId
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Format tickets for response
    const formattedTickets: TicketItem[] = tickets.map((ticket: any) => ({
      id: ticket.id,
      category: formatCategory(ticket.category),
      subject: ticket.subject,
      priority: ticket.priority,
      status: ticket.status,
      bookingId: ticket.bookingId || undefined,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      closedAt: ticket.closedAt?.toISOString(),
      messageCount: ticket._count.messages,
      lastMessageAt: ticket.messages[0]?.createdAt?.toISOString(),
      lastMessagePreview: ticket.messages[0]?.content?.substring(0, 100)
    }))

    // Calculate summary statistics
    const openTickets = formattedTickets.filter((t) => t.status === 'OPEN').length
    const inProgressTickets = formattedTickets.filter((t) => t.status === 'IN_PROGRESS').length
    const resolvedTickets = formattedTickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length

    const summary: SupportSummary = {
      openTickets,
      inProgressTickets,
      resolvedTickets,
      totalTickets: formattedTickets.length,
      avgResponseTime: '< 5 min' // Placeholder - could be calculated from actual message timestamps
    }

    // Calculate category distribution
    const categoryMap = new Map<string, number>()
    formattedTickets.forEach((ticket) => {
      const count = categoryMap.get(ticket.category) || 0
      categoryMap.set(ticket.category, count + 1)
    })

    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count
    }))

    const response: SupportResponse = {
      summary,
      tickets: formattedTickets,
      categories
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
