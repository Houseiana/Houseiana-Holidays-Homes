import { NextRequest, NextResponse } from 'next/server';
import { createSadadPayment } from '@/lib/sadad';
import { prisma } from '@/lib/prisma-server';
import { getUserFromRequest } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user || !user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await (prisma as any).booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          include: {
            owner: true,
          },
        },
        guest: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify user owns this booking
    if (booking.guestId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to pay for this booking' },
        { status: 403 }
      );
    }

    // Check if booking can be paid
    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Booking already paid' },
        { status: 400 }
      );
    }

    // Check if booking is in correct status (AWAITING_PAYMENT for instant book, or PENDING/REQUESTED/APPROVED for request-to-book)
    if (!['AWAITING_PAYMENT', 'PENDING', 'REQUESTED', 'APPROVED'].includes(booking.status)) {
      return NextResponse.json(
        { error: `Booking cannot be paid. Current status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Create Sadad payment
    const merchantReference = `BK${booking.id.substring(0, 8).toUpperCase()}`;

    const payment = await createSadadPayment({
      amount: booking.totalPrice,
      currency: booking.currency || 'QAR',
      merchantReference,
      customerEmail: booking.guest.email,
      customerName: `${booking.guest.firstName} ${booking.guest.lastName}`,
      description: `Booking for ${booking.property.title}`,
      metadata: {
        bookingId: booking.id,
        propertyId: booking.propertyId,
        guestId: booking.guestId,
        hostId: booking.hostId,
      },
    });

    // Create payment record in database
    await (prisma as any).payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: booking.currency || 'QAR',
        status: 'PENDING',
        method: 'sadad',
        stripePaymentId: payment.transactionId, // Using this field for Sadad transaction ID
      },
    });

    console.log('✅ Sadad payment created:', {
      bookingId: booking.id,
      transactionId: payment.transactionId,
      amount: booking.totalPrice,
    });

    return NextResponse.json({
      transactionId: payment.transactionId,
      paymentUrl: payment.paymentUrl,
      amount: booking.totalPrice,
      currency: booking.currency || 'QAR',
      status: payment.status,
    });
  } catch (error: any) {
    console.error('❌ Error creating Sadad payment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
