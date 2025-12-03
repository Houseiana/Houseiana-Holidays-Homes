/**
 * Sadad Payment Form Creation API
 *
 * Proxies to the .NET backend for Sadad payment processing
 * Backend: https://houseiana-user-backend-production.up.railway.app
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// .NET Backend API URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://houseiana-user-backend-production.up.railway.app'

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

    // Fetch booking details from local database
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
        customerEmail: booking.user?.email || booking.guestEmail || '',
        customerMobile: booking.user?.phone || booking.guestPhone || '',
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
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'AWAITING_PAYMENT',
        updatedAt: new Date(),
      },
    })

    // Map backend response to frontend expected format
    const formFields: Record<string, string> = {
      merchant_id: backendData.data.merchantId,
      ORDER_ID: backendData.data.orderId,
      WEBSITE: backendData.data.website,
      TXN_AMOUNT: backendData.data.txnAmount,
      CUST_ID: backendData.data.customerId,
      EMAIL: backendData.data.email,
      MOBILE_NO: backendData.data.mobileNo,
      SADAD_WEBCHECKOUT_PAGE_LANGUAGE: backendData.data.language,
      CALLBACK_URL: backendData.data.callbackUrl,
      txnDate: backendData.data.txnDate,
      VERSION: backendData.data.version || '1.1',
      checksumhash: backendData.data.checksumHash,
      [`productdetail[0][order_id]`]: backendData.data.productDetail.order_id,
      [`productdetail[0][itemname]`]: backendData.data.productDetail.itemname,
      [`productdetail[0][amount]`]: backendData.data.productDetail.amount,
      [`productdetail[0][quantity]`]: backendData.data.productDetail.quantity,
      [`productdetail[0][type]`]: backendData.data.productDetail.type,
    }

    console.log('Sadad payment form generated via backend:', {
      bookingId: booking.id,
      amount: booking.totalPrice,
      actionUrl: backendData.data.actionUrl,
    })

    // Return form data for iframe submission
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
  } finally {
    await prisma.$disconnect()
  }
}
