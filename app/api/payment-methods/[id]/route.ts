import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { detachPaymentMethod, setDefaultPaymentMethod } from '@/lib/stripe'
import { prisma } from '@/lib/prisma-server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const methodId = params.id

    // Get payment method from database
    const method = await (prisma as any).paymentMethod.findUnique({
      where: { id: methodId }
    })

    if (!method) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (method.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Detach from Stripe
    if (method.stripePaymentMethodId) {
      await detachPaymentMethod(method.stripePaymentMethodId)
    }

    // Delete from database
    await (prisma as any).paymentMethod.delete({
      where: { id: methodId }
    })

    return NextResponse.json({
      message: 'Payment method deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting payment method:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const methodId = params.id
    const { action } = await request.json()

    if (action !== 'set-default') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Get payment method from database
    const method = await (prisma as any).paymentMethod.findUnique({
      where: { id: methodId }
    })

    if (!method) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (method.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get user's Stripe customer ID
    const dbUser = await (prisma as any).user.findUnique({
      where: { id: user.userId },
      select: { stripeCustomerId: true }
    })

    if (!dbUser?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Stripe customer not found' },
        { status: 404 }
      )
    }

    // Set as default in Stripe
    if (method.stripePaymentMethodId) {
      await setDefaultPaymentMethod(
        dbUser.stripeCustomerId,
        method.stripePaymentMethodId
      )
    }

    // Unset all other defaults
    await (prisma as any).paymentMethod.updateMany({
      where: { userId: user.userId },
      data: { isDefault: false }
    })

    // Set this as default
    await (prisma as any).paymentMethod.update({
      where: { id: methodId },
      data: { isDefault: true }
    })

    return NextResponse.json({
      message: 'Default payment method updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating payment method:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
