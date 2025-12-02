/**
 * Sadad Payment Callback Handler
 *
 * Receives payment response from Sadad gateway after transaction completion
 * Verifies checksumhash and updates booking and payment status
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifySadadCallback, type SadadCallbackResponse } from '@/lib/sadad-config'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    console.log('Sadad callback received')

    // Parse form data from Sadad
    const formData = await req.formData()

    // Extract all parameters
    const response: SadadCallbackResponse = {
      ORDERID: formData.get('ORDERID') as string,
      RESPCODE: formData.get('RESPCODE') as string,
      RESPMSG: formData.get('RESPMSG') as string,
      TXNAMOUNT: formData.get('TXNAMOUNT') as string,
      transaction_number: formData.get('transaction_number') as string,
      checksumhash: formData.get('checksumhash') as string,
    }

    console.log('Sadad callback data:', {
      orderId: response.ORDERID,
      responseCode: response.RESPCODE,
      transactionNumber: response.transaction_number,
      amount: response.TXNAMOUNT,
    })

    // Verify checksumhash
    const verification = verifySadadCallback(response)

    if (!verification.valid) {
      console.error('Sadad checksumhash verification failed')
      return NextResponse.json(
        { error: 'Invalid checksumhash - security verification failed' },
        { status: 400 }
      )
    }

    console.log('Sadad checksumhash verified successfully')

    // Find booking
    const booking = await prisma.booking.findUnique({
      where: { id: verification.orderId },
    })

    if (!booking) {
      console.error('Booking not found:', verification.orderId)
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Update payment record
    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        status: verification.success ? 'COMPLETED' : 'FAILED',
        transactionId: verification.transactionId,
        amount: verification.amount,
        currency: 'QAR',
        metadata: JSON.stringify({
          respCode: response.RESPCODE,
          respMsg: response.RESPMSG,
          verifiedAt: new Date().toISOString(),
        }),
        updatedAt: new Date(),
      },
      create: {
        bookingId: booking.id,
        userId: booking.userId,
        provider: 'SADAD',
        status: verification.success ? 'COMPLETED' : 'FAILED',
        transactionId: verification.transactionId,
        amount: verification.amount,
        currency: 'QAR',
        metadata: JSON.stringify({
          respCode: response.RESPCODE,
          respMsg: response.RESPMSG,
          verifiedAt: new Date().toISOString(),
        }),
      },
    })

    console.log('Payment record updated:', payment.id)

    // Update booking status if payment successful
    if (verification.success) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          updatedAt: new Date(),
        },
      })

      console.log('Booking confirmed:', booking.id)

      // TODO: Send confirmation email to customer
      // TODO: Send notification to host
    } else {
      // Payment failed - update booking status
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'FAILED',
          updatedAt: new Date(),
        },
      })

      console.log('Booking payment failed:', booking.id)
    }

    // Return HTML response for iframe redirect
    const successHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment ${verification.success ? 'Successful' : 'Failed'}</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: ${verification.success ? '#f0fdf4' : '#fef2f2'};
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 1rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 400px;
          }
          .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          h1 {
            color: ${verification.success ? '#16a34a' : '#dc2626'};
            margin-bottom: 0.5rem;
          }
          p {
            color: #6b7280;
            margin-bottom: 1.5rem;
          }
          .button {
            display: inline-block;
            padding: 0.75rem 2rem;
            background: ${verification.success ? '#16a34a' : '#dc2626'};
            color: white;
            text-decoration: none;
            border-radius: 0.5rem;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">${verification.success ? '✓' : '✗'}</div>
          <h1>Payment ${verification.success ? 'Successful' : 'Failed'}</h1>
          <p>${verification.message}</p>
          <p><strong>Order ID:</strong> ${verification.orderId}</p>
          ${verification.transactionId ? `<p><strong>Transaction ID:</strong> ${verification.transactionId}</p>` : ''}
          <a href="/payment/${verification.success ? 'success' : 'failed'}?bookingId=${verification.orderId}" class="button">
            Continue
          </a>
        </div>
        <script>
          // Send message to parent window
          window.parent.postMessage({
            status: '${verification.success ? 'success' : 'failed'}',
            RESPCODE: '${response.RESPCODE}',
            ORDERID: '${verification.orderId}',
            transaction_number: '${verification.transactionId}',
            RESPMSG: '${verification.message}',
            TXNAMOUNT: '${verification.amount}'
          }, '*');
        </script>
      </body>
      </html>
    `

    return new NextResponse(successHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    })

  } catch (error) {
    console.error('Error processing Sadad callback:', error)

    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Error</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: #fef2f2;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 1rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Payment Processing Error</h1>
          <p>An error occurred while processing your payment. Please contact support.</p>
          <a href="/">Return Home</a>
        </div>
      </body>
      </html>
    `

    return new NextResponse(errorHtml, {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } finally {
    await prisma.$disconnect()
  }
}

// Handle GET requests (when users navigate directly to callback URL)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const orderId = searchParams.get('ORDERID')

  if (!orderId) {
    return NextResponse.redirect('/payment/failed')
  }

  // Redirect to payment verification page
  return NextResponse.redirect(`/payment/success?bookingId=${orderId}`)
}
