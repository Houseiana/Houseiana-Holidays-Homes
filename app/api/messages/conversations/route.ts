import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/messages/conversations - Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const conversations = await (prisma as any).conversation.findMany({
      where: {
        participants: {
          some: {
            userId: user.userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        booking: {
          select: {
            id: true,
            confirmationCode: true,
            checkIn: true,
            checkOut: true,
            status: true
          }
        },
        property: {
          select: {
            id: true,
            title: true,
            photos: {
              where: { isMain: true },
              take: 1
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                recipientId: user.userId
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Format conversations with unread count and last message
    const formattedConversations = conversations.map((conversation: any) => {
      const otherParticipant = conversation.participants.find(
        (p: any) => p.userId !== user.userId
      )

      return {
        id: conversation.id,
        title: conversation.title,
        isArchived: conversation.isArchived,
        booking: conversation.booking,
        property: conversation.property,
        otherParticipant: otherParticipant?.user,
        lastMessage: conversation.messages[0] || null,
        unreadCount: conversation._count.messages,
        updatedAt: conversation.updatedAt
      }
    })

    return NextResponse.json({ conversations: formattedConversations })

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/messages/conversations - Create new conversation
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { participantId, bookingId, propertyId, initialMessage } = await request.json()

    if (!participantId || !initialMessage) {
      return NextResponse.json(
        { error: 'Participant ID and initial message are required' },
        { status: 400 }
      )
    }

    // Check if conversation already exists
    const existingConversation = await (prisma as any).conversation.findFirst({
      where: {
        AND: [
          { bookingId },
          {
            participants: {
              some: { userId: user.userId }
            }
          },
          {
            participants: {
              some: { userId: participantId }
            }
          }
        ]
      }
    })

    if (existingConversation) {
      return NextResponse.json(
        { error: 'Conversation already exists', conversationId: existingConversation.id },
        { status: 409 }
      )
    }

    // Determine participant roles
    let hostId, guestId
    if (bookingId) {
      const booking = await (prisma as any).booking.findUnique({
        where: { id: bookingId },
        select: { hostId: true, guestId: true }
      })

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }

      hostId = booking.hostId
      guestId = booking.guestId
    }

    // Create conversation with participants and initial message
    const conversation = await (prisma as any).conversation.create({
      data: {
        bookingId,
        propertyId,
        participants: {
          create: [
            {
              userId: user.userId,
              role: user.userId === hostId ? 'HOST' : 'GUEST'
            },
            {
              userId: participantId,
              role: participantId === hostId ? 'HOST' : 'GUEST'
            }
          ]
        },
        messages: {
          create: {
            content: initialMessage,
            senderId: user.userId,
            recipientId: participantId,
            type: 'TEXT'
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(conversation, { status: 201 })

  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}