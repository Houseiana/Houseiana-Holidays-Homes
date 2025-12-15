/**
 * Audit Logging Service
 * Tracks all booking-related actions for compliance and debugging
 *
 * All audit logs are sent to the Backend API for storage
 */

import { AuditAPI } from '@/lib/backend-api'

interface AuditLogEntry {
  entityType: 'booking' | 'payment' | 'refund' | 'property'
  entityId: string
  action: string
  actorId: string
  actorType: 'user' | 'host' | 'guest' | 'admin' | 'system'
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

/**
 * Create an audit log entry via Backend API
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  const { entityType, entityId, action, actorId, actorType, metadata } = entry

  console.log(`[Audit] ${actorType} ${actorId} performed ${action} on ${entityType} ${entityId}`, metadata)

  try {
    // Send audit log to backend for storage
    await AuditAPI.createLog({
      entityType,
      entityId,
      action,
      actorId,
      actorType,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error creating audit log:', error)
    // Don't throw - audit logging should not break the main flow
  }
}

/**
 * Log booking creation
 */
export async function logBookingCreated(bookingId: string, guestId: string, metadata: any): Promise<void> {
  await createAuditLog({
    entityType: 'booking',
    entityId: bookingId,
    action: 'booking_created',
    actorId: guestId,
    actorType: 'guest',
    metadata
  })
}

/**
 * Log booking approval
 */
export async function logBookingApproved(bookingId: string, hostId: string, metadata: any): Promise<void> {
  await createAuditLog({
    entityType: 'booking',
    entityId: bookingId,
    action: 'booking_approved',
    actorId: hostId,
    actorType: 'host',
    metadata
  })
}

/**
 * Log booking declined
 */
export async function logBookingDeclined(bookingId: string, hostId: string, reason: string): Promise<void> {
  await createAuditLog({
    entityType: 'booking',
    entityId: bookingId,
    action: 'booking_declined',
    actorId: hostId,
    actorType: 'host',
    metadata: { reason }
  })
}

/**
 * Log payment success
 */
export async function logPaymentSuccess(bookingId: string, paymentIntentId: string, amount: number): Promise<void> {
  await createAuditLog({
    entityType: 'booking',
    entityId: bookingId,
    action: 'payment_success',
    actorId: 'stripe',
    actorType: 'system',
    metadata: { paymentIntentId, amount }
  })
}

/**
 * Log payment failure
 */
export async function logPaymentFailure(bookingId: string, paymentIntentId: string, error: string): Promise<void> {
  await createAuditLog({
    entityType: 'booking',
    entityId: bookingId,
    action: 'payment_failed',
    actorId: 'stripe',
    actorType: 'system',
    metadata: { paymentIntentId, error }
  })
}

/**
 * Log booking cancellation
 */
export async function logBookingCancelled(
  bookingId: string,
  actorId: string,
  actorType: 'guest' | 'host' | 'admin',
  reason: string,
  refundAmount?: number
): Promise<void> {
  await createAuditLog({
    entityType: 'booking',
    entityId: bookingId,
    action: 'booking_cancelled',
    actorId,
    actorType,
    metadata: { reason, refundAmount }
  })
}

/**
 * Log refund processed
 */
export async function logRefundProcessed(
  bookingId: string,
  actorId: string,
  refundId: string,
  amount: number
): Promise<void> {
  await createAuditLog({
    entityType: 'refund',
    entityId: refundId,
    action: 'refund_processed',
    actorId,
    actorType: 'host',
    metadata: { bookingId, amount }
  })
}

/**
 * Log booking expired
 */
export async function logBookingExpired(bookingId: string): Promise<void> {
  await createAuditLog({
    entityType: 'booking',
    entityId: bookingId,
    action: 'booking_expired',
    actorId: 'system',
    actorType: 'system',
    metadata: { reason: 'Payment hold expired' }
  })
}
