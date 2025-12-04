/**
 * Sadad Payment Form Creation API
 *
 * Proxies to the .NET backend for Sadad payment processing
 * Backend: https://houseiana-user-backend-production.up.railway.app
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma-server'

// .NET Backend API URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://houseiana-user-backend-production.up.railway.app'

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { bookingId, customerEmail, customerPhone } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Fetch booking details from local database
    const booking = await (prisma as any).booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
        guest: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify the booking belongs to the authenticated user
    if (booking.guestId !== userId) {
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

    // Use provided email/phone or fall back to guest record
    const email = customerEmail || booking.guest?.email || 'guest@houseiana.net'
    const phone = customerPhone || booking.guest?.phone || '12345678'

    // Call .NET backend Sadad API
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/sadadpayment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: booking.id,
        bookingId: booking.id,
        amount: parseFloat(booking.totalPrice.toString()),
        customerEmail: email,
        customerMobile: phone,
        itemName: `${booking.property?.title || 'Property'} - Booking`,
        language: 'ENG',
      }),
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.error('Backend Sadad API error:', errorData)
      throw new Error(errorData.message || 'Failed to initiate payment with backend')
    }

    const backendData = await backendResponse.json()

    if (!backendData.success) {
      throw new Error('Backend returned unsuccessful response')
    }

    // Update local booking status
    await (prisma as any).booking.update({
      where: { id: bookingId },
      data: {
        status: 'AWAITING_PAYMENT',
        updatedAt: new Date(),
      },
    })

    // Map backend response to form fields matching EXACT PHP reference
    // IMPORTANT: Only include fields that are in the checksum calculation
    // Based on: direct_payment/sadad.php and checksum_form.html
    // DO NOT include: SADAD_WEBCHECKOUT_PAGE_LANGUAGE, VERSION, productdetail[0][type]
    const formFields: Record<string, string> = {
      merchant_id: backendData.data.merchantId,
      ORDER_ID: backendData.data.orderId,
      WEBSITE: backendData.data.website,
      TXN_AMOUNT: backendData.data.txnAmount,
      CUST_ID: backendData.data.customerId,
      EMAIL: backendData.data.email,
      MOBILE_NO: backendData.data.mobileNo,
      CALLBACK_URL: backendData.data.callbackUrl,
      txnDate: backendData.data.txnDate,
      // productdetail fields - order matters: order_id, quantity, amount, itemname
      'productdetail[0][order_id]': backendData.data.productDetail?.order_id || backendData.data.orderId,
      'productdetail[0][quantity]': backendData.data.productDetail?.quantity || '1',
      'productdetail[0][amount]': backendData.data.productDetail?.amount || backendData.data.txnAmount,
      'productdetail[0][itemname]': backendData.data.productDetail?.itemname || `${booking.property?.title || 'Property'} - Booking`,
      // checksumhash must be last
      checksumhash: backendData.data.checksumHash,
    }

    console.log('Sadad payment form generated via backend:', {
      bookingId: booking.id,
      amount: booking.totalPrice,
      actionUrl: backendData.data.actionUrl,
    })

    // Return form data for direct form submission
    return NextResponse.json({
      success: true,
      action: backendData.data.actionUrl,
      formFields: formFields,
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
  }
}
