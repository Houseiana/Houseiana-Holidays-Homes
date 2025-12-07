import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-server';

/**
 * POST /api/sadad/callback
 *
 * Callback endpoint for Sadad payment gateway
 * Sadad will POST payment result to this endpoint after payment completion
 *
 * Expected parameters from Sadad:
 * - ORDER_ID: The booking ID / order ID
 * - TXNID: Transaction ID from Sadad
 * - STATUS: Payment status (TXN_SUCCESS, TXN_FAILURE, PENDING)
 * - BANKTXNID: Bank transaction ID
 * - TXNAMOUNT: Transaction amount
 * - CHECKSUMHASH: Checksum for verification
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data from Sadad
    const formData = await request.formData();

    const orderId = formData.get('ORDER_ID') as string;
    const txnId = formData.get('TXNID') as string;
    const status = formData.get('STATUS') as string;
    const bankTxnId = formData.get('BANKTXNID') as string;
    const txnAmount = formData.get('TXNAMOUNT') as string;
    const checksumHash = formData.get('CHECKSUMHASH') as string;
    const respMsg = formData.get('RESPMSG') as string;

    console.log('Sadad callback received:', {
      orderId,
      txnId,
      status,
      bankTxnId,
      txnAmount,
      respMsg,
    });

    if (!orderId) {
      console.error('Missing ORDER_ID in Sadad callback');
      return NextResponse.redirect(new URL('/payment/failed?error=missing_order', request.url));
    }

    // Find the booking
    const booking = await (prisma as any).booking.findUnique({
      where: { id: orderId },
      include: {
        property: true,
        guest: true,
      },
    });

    if (!booking) {
      console.error('Booking not found:', orderId);
      return NextResponse.redirect(new URL('/payment/failed?error=booking_not_found', request.url));
    }

    // Process based on status
    if (status === 'TXN_SUCCESS') {
      // Payment successful - update booking
      await (prisma as any).booking.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paymentMethod: 'SADAD',
          transactionId: txnId,
          paymentIntentId: bankTxnId,
          amountPaid: parseFloat(txnAmount) || booking.totalPrice,
          confirmedAt: new Date(),
          paymentCapturedAt: new Date(),
        },
      });

      console.log('Payment successful for booking:', orderId);

      // Redirect to success page
      return NextResponse.redirect(
        new URL(`/payment/success?bookingId=${orderId}&txnId=${txnId}`, request.url)
      );
    } else if (status === 'TXN_FAILURE') {
      // Payment failed
      await (prisma as any).booking.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          paymentMethod: 'SADAD',
        },
      });

      console.log('Payment failed for booking:', orderId, respMsg);

      // Redirect to failed page
      return NextResponse.redirect(
        new URL(`/payment/failed?bookingId=${orderId}&error=${encodeURIComponent(respMsg || 'Payment failed')}`, request.url)
      );
    } else if (status === 'PENDING') {
      // Payment pending
      await (prisma as any).booking.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PENDING',
          paymentMethod: 'SADAD',
          transactionId: txnId,
        },
      });

      console.log('Payment pending for booking:', orderId);

      // Redirect to pending page
      return NextResponse.redirect(
        new URL(`/payment/pending?bookingId=${orderId}`, request.url)
      );
    } else {
      // Unknown status
      console.error('Unknown payment status:', status);
      return NextResponse.redirect(
        new URL(`/payment/failed?bookingId=${orderId}&error=unknown_status`, request.url)
      );
    }
  } catch (error) {
    console.error('Error processing Sadad callback:', error);
    return NextResponse.redirect(
      new URL('/payment/failed?error=processing_error', request.url)
    );
  }
}

// Also handle GET requests (in case Sadad redirects via GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const orderId = searchParams.get('ORDER_ID');
  const status = searchParams.get('STATUS');
  const txnId = searchParams.get('TXNID');

  console.log('Sadad callback GET received:', { orderId, status, txnId });

  if (!orderId) {
    return NextResponse.redirect(new URL('/payment/failed?error=missing_order', request.url));
  }

  if (status === 'TXN_SUCCESS') {
    // Update booking and redirect to success
    try {
      await (prisma as any).booking.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paymentMethod: 'SADAD',
          transactionId: txnId,
          confirmedAt: new Date(),
          paymentCapturedAt: new Date(),
        },
      });

      return NextResponse.redirect(
        new URL(`/payment/success?bookingId=${orderId}&txnId=${txnId}`, request.url)
      );
    } catch (error) {
      console.error('Error updating booking:', error);
      return NextResponse.redirect(
        new URL(`/payment/success?bookingId=${orderId}&txnId=${txnId}`, request.url)
      );
    }
  } else {
    return NextResponse.redirect(
      new URL(`/payment/failed?bookingId=${orderId}&status=${status}`, request.url)
    );
  }
}
