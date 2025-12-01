import { Resend } from 'resend'

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Houseiana <noreply@houseiana.net>'

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  // If Resend is not configured, log warning and return
  if (!resend) {
    console.warn('⚠️  RESEND_API_KEY not configured. Email not sent:', { to, subject })
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    })

    console.log('✅ Email sent successfully:', { to, subject, id: result.data?.id })
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error('❌ Failed to send email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Email template for booking confirmation
 */
export function getBookingConfirmationEmail({
  guestName,
  propertyTitle,
  checkIn,
  checkOut,
  totalPrice,
  confirmationCode,
  bookingId,
}: {
  guestName: string
  propertyTitle: string
  checkIn: string
  checkOut: string
  totalPrice: number
  confirmationCode: string
  bookingId: string
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #4F46E5; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
        </div>

        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${guestName},</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Great news! Your booking has been confirmed and payment has been received.
          </p>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
            <h2 style="margin-top: 0; color: #4F46E5;">Booking Details</h2>
            <p style="margin: 10px 0;"><strong>Property:</strong> ${propertyTitle}</p>
            <p style="margin: 10px 0;"><strong>Check-in:</strong> ${formatDate(checkIn)}</p>
            <p style="margin: 10px 0;"><strong>Check-out:</strong> ${formatDate(checkOut)}</p>
            <p style="margin: 10px 0;"><strong>Total Paid:</strong> $${totalPrice.toFixed(2)}</p>
            <p style="margin: 10px 0;"><strong>Confirmation Code:</strong> <span style="font-family: monospace; background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${confirmationCode}</span></p>
          </div>

          <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400E;">
              <strong>Important:</strong> Please save this email for your records. You may be asked to show your confirmation code at check-in.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://houseiana.net/client-dashboard?tab=trips" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              View My Bookings
            </a>
          </div>

          <p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
            If you have any questions about your booking, please contact us or reply to this email.
          </p>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

          <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
            Houseiana Holidays Homes<br>
            © ${new Date().getFullYear()} All rights reserved<br>
            <a href="https://houseiana.net" style="color: #4F46E5; text-decoration: none;">houseiana.net</a>
          </p>
        </div>
      </body>
    </html>
  `

  const text = `
Booking Confirmed!

Hi ${guestName},

Great news! Your booking has been confirmed and payment has been received.

Booking Details:
- Property: ${propertyTitle}
- Check-in: ${formatDate(checkIn)}
- Check-out: ${formatDate(checkOut)}
- Total Paid: $${totalPrice.toFixed(2)}
- Confirmation Code: ${confirmationCode}

Important: Please save this email for your records. You may be asked to show your confirmation code at check-in.

View your bookings: https://houseiana.net/client-dashboard?tab=trips

If you have any questions about your booking, please contact us or reply to this email.

Houseiana Holidays Homes
© ${new Date().getFullYear()} All rights reserved
houseiana.net
  `.trim()

  return { html, text }
}

/**
 * Email template for payment failed
 */
export function getPaymentFailedEmail({
  guestName,
  propertyTitle,
  bookingId,
  amount,
}: {
  guestName: string
  propertyTitle: string
  bookingId: string
  amount: number
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Failed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #DC2626; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Payment Failed</h1>
        </div>

        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${guestName},</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            We were unable to process your payment for your booking at <strong>${propertyTitle}</strong>.
          </p>

          <div style="background-color: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
            <p style="margin: 10px 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
            <p style="margin: 10px 0;"><strong>Status:</strong> Payment Failed</p>
          </div>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Your booking is still on hold, but you'll need to complete payment soon to confirm it.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://houseiana.net/client-dashboard?tab=trips" style="background-color: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Retry Payment
            </a>
          </div>

          <p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
            If you continue to experience issues, please contact our support team.
          </p>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

          <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
            Houseiana Holidays Homes<br>
            © ${new Date().getFullYear()} All rights reserved<br>
            <a href="https://houseiana.net" style="color: #4F46E5; text-decoration: none;">houseiana.net</a>
          </p>
        </div>
      </body>
    </html>
  `

  const text = `
Payment Failed

Hi ${guestName},

We were unable to process your payment for your booking at ${propertyTitle}.

Amount: $${amount.toFixed(2)}
Status: Payment Failed

Your booking is still on hold, but you'll need to complete payment soon to confirm it.

Retry payment: https://houseiana.net/client-dashboard?tab=trips

If you continue to experience issues, please contact our support team.

Houseiana Holidays Homes
© ${new Date().getFullYear()} All rights reserved
houseiana.net
  `.trim()

  return { html, text }
}

/**
 * Email template for hold expiring soon
 */
export function getHoldExpiringEmail({
  guestName,
  propertyTitle,
  expiresAt,
  bookingId,
}: {
  guestName: string
  propertyTitle: string
  expiresAt: Date
  bookingId: string
}) {
  const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60)))

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Hold Expiring Soon</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #F59E0B; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Your Hold is Expiring Soon</h1>
        </div>

        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${guestName},</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Your booking hold for <strong>${propertyTitle}</strong> is expiring soon!
          </p>

          <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
            <p style="margin: 10px 0; font-size: 18px;"><strong>Time Remaining:</strong> ${timeRemaining} minutes</p>
            <p style="margin: 10px 0; color: #92400E;">
              Complete your payment now to secure this booking, or it will be automatically cancelled.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://houseiana.net/client-dashboard?tab=trips" style="background-color: #F59E0B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Complete Payment Now
            </a>
          </div>

          <p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
            Don't lose this opportunity! Complete your payment before the hold expires.
          </p>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

          <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
            Houseiana Holidays Homes<br>
            © ${new Date().getFullYear()} All rights reserved<br>
            <a href="https://houseiana.net" style="color: #4F46E5; text-decoration: none;">houseiana.net</a>
          </p>
        </div>
      </body>
    </html>
  `

  const text = `
⏰ Your Hold is Expiring Soon

Hi ${guestName},

Your booking hold for ${propertyTitle} is expiring soon!

Time Remaining: ${timeRemaining} minutes

Complete your payment now to secure this booking, or it will be automatically cancelled.

Complete payment: https://houseiana.net/client-dashboard?tab=trips

Don't lose this opportunity! Complete your payment before the hold expires.

Houseiana Holidays Homes
© ${new Date().getFullYear()} All rights reserved
houseiana.net
  `.trim()

  return { html, text }
}
