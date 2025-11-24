import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import {
  stripe,
  getOrCreateStripeCustomer,
  attachPaymentMethod,
  listPaymentMethods
} from '@/lib/stripe'
import { prisma } from '@/lib/prisma-server'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get payment methods from database
    const methods = await (prisma as any).paymentMethod.findMany({
      where: { userId: user.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    })

    return NextResponse.json({ methods })
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { paymentMethodId } = await request.json()

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      )
    }

    // Get user details
    const dbUser = await (prisma as any).user.findUnique({
      where: { id: user.userId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        stripeCustomerId: true
      }
    })

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      user.userId,
      dbUser.email,
      `${dbUser.firstName} ${dbUser.lastName}`
    )

    // Attach payment method to customer
    const paymentMethod = await attachPaymentMethod(paymentMethodId, customerId)

    // Check if this is the user's first payment method
    const existingMethods = await (prisma as any).paymentMethod.count({
      where: { userId: user.userId }
    })

    const isDefault = existingMethods === 0

    // If this is the first method or should be default, set as default
    if (isDefault) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      })

      // Unset other defaults
      await (prisma as any).paymentMethod.updateMany({
        where: { userId: user.userId },
        data: { isDefault: false }
      })
    }

    // Save to database
    const savedMethod = await (prisma as any).paymentMethod.create({
      data: {
        userId: user.userId,
        brand: paymentMethod.card?.brand || 'unknown',
        last4: paymentMethod.card?.last4 || '0000',
        expiry: paymentMethod.card
          ? `${String(paymentMethod.card.exp_month).padStart(2, '0')}/${paymentMethod.card.exp_year}`
          : '00/0000',
        isDefault,
        stripePaymentMethodId: paymentMethodId
      }
    })

    return NextResponse.json({
      method: savedMethod,
      message: 'Payment method added successfully'
    })
  } catch (error: any) {
    console.error('Error adding payment method:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
