/**
 * Sadad Payment Form Creation API
 *
 * Generates Sadad payment form data with checksumhash for inline payment processing
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { PrismaClient } from '@prisma/client'
import { createSadadPaymentForm, type SadadPaymentData } from '@/lib/sadad-config'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Fetch booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
        user: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify the booking belongs to the authenticated user
    if (booking.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized - This booking does not belong to you' },
        { status: 403 }
      )
    }

    // Check if booking is already paid
    if (booking.status === 'CONFIRMED' || booking.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'This booking is already paid' },
        { status: 400 }
      )
    }

    // Prepare Sadad payment data
    const callbackUrl = `${process.env.NEXTAUTH_URL || 'https://www.houseiana.net'}/api/sadad/callback`

    const paymentData: SadadPaymentData = {
      orderId: booking.id,
      amount: parseFloat(booking.totalPrice.toString()),
      currency: 'QAR',
      customerEmail: booking.user.email || booking.guestEmail || '',
      customerMobile: booking.user.phone || booking.guestPhone || '',
      customerId: booking.userId,
      productDetails: [
        {
          order_id: booking.id,
          itemname: `${booking.property.title} - Booking`,
          amount: parseFloat(booking.totalPrice.toString()),
          quantity: 1,
          type: 'accommodation',
        },
      ],
      callbackUrl,
    }

    // Generate Sadad payment form
    const sadadForm = createSadadPaymentForm(paymentData)

    // Create or update payment record in database
    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        provider: 'SADAD',
        status: 'PENDING',
        amount: booking.totalPrice,
        currency: 'QAR',
        updatedAt: new Date(),
      },
      create: {
        bookingId: booking.id,
        userId: booking.userId,
        provider: 'SADAD',
        status: 'PENDING',
        amount: booking.totalPrice,
        currency: 'QAR',
      },
    })

    console.log('Sadad payment form generated:', {
      bookingId: booking.id,
      amount: booking.totalPrice,
      paymentId: payment.id,
    })

    // Return form data for iframe submission
    return NextResponse.json({
      success: true,
      action: sadadForm.action,
      formFields: sadadForm.formFields,
      paymentId: payment.id,
      bookingId: booking.id,
      amount: booking.totalPrice,
    })

  } catch (error) {
    console.error('Error creating Sadad payment form:', error)

    return NextResponse.json(
      {
        error: 'Failed to create payment form',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
