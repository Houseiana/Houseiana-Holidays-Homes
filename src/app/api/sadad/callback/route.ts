import { NextRequest, NextResponse } from 'next/server';
import { PaymentAPI } from '@/lib/backend-api';

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
    const respMsg = formData.get('RESPMSG') as string;

    console.log('💳 Sadad callback received:', {
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

    // Backend handles all payment processing:
    // - Booking lookup and validation
    // - Payment status update based on Sadad response
    // - Transaction record creation
    const response = await PaymentAPI.handleSadadCallback({
      orderId,
      txnId,
      status,
      bankTxnId,
      txnAmount,
      respMsg,
    });

    if (!response.success) {
      console.error('❌ Backend API error processing Sadad callback:', response.error);
      return NextResponse.redirect(
        new URL(`/payment/failed?bookingId=${orderId}&error=${encodeURIComponent(response.error || 'Processing error')}`, request.url)
      );
    }

    // Redirect based on status
    if (status === 'TXN_SUCCESS') {
      console.log('✅ Payment successful for booking:', orderId);
      return NextResponse.redirect(
        new URL(`/payment/success?bookingId=${orderId}&txnId=${txnId}`, request.url)
      );
    } else if (status === 'PENDING') {
      console.log('⏳ Payment pending for booking:', orderId);
      return NextResponse.redirect(
        new URL(`/payment/pending?bookingId=${orderId}`, request.url)
      );
    } else {
      console.log('❌ Payment failed for booking:', orderId, respMsg);
      return NextResponse.redirect(
        new URL(`/payment/failed?bookingId=${orderId}&error=${encodeURIComponent(respMsg || 'Payment failed')}`, request.url)
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
  const bankTxnId = searchParams.get('BANKTXNID');
  const txnAmount = searchParams.get('TXNAMOUNT');
  const respMsg = searchParams.get('RESPMSG');

  console.log('💳 Sadad callback GET received:', { orderId, status, txnId });

  if (!orderId) {
    return NextResponse.redirect(new URL('/payment/failed?error=missing_order', request.url));
  }

  // Backend handles all payment processing
  const response = await PaymentAPI.handleSadadCallback({
    orderId,
    txnId: txnId || undefined,
    status: status || 'UNKNOWN',
    bankTxnId: bankTxnId || undefined,
    txnAmount: txnAmount || undefined,
    respMsg: respMsg || undefined,
  });

  if (!response.success) {
    console.error('❌ Backend API error processing Sadad GET callback:', response.error);
  }

  if (status === 'TXN_SUCCESS') {
    return NextResponse.redirect(
      new URL(`/payment/success?bookingId=${orderId}&txnId=${txnId}`, request.url)
    );
  } else {
    return NextResponse.redirect(
      new URL(`/payment/failed?bookingId=${orderId}&status=${status}`, request.url)
    );
  }
}
