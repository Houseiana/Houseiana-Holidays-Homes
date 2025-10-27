import { NextRequest, NextResponse } from 'next/server';
import { OTPStorage } from '@/lib/otp-storage';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email address is required' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = await OTPStorage.generateOTP();

    // Store OTP for verification
    await OTPStorage.storeOTP(email, otpCode, 'email', 5);

    // Check if SendGrid is configured
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@houseiana.com';

    if (sendgridApiKey && sendgridApiKey !== 'your-sendgrid-api-key-here') {
      // Send email using SendGrid
      const sgMail = (await import('@sendgrid/mail')).default;
      sgMail.setApiKey(sendgridApiKey);

      const msg = {
        to: email,
        from: sendgridFromEmail,
        subject: 'Your Houseiana Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF385C 0%, #E31C5F 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">🏠 Houseiana</h1>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Verify Your Account</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                Your verification code is:
              </p>
              <div style="background: white; border: 2px solid #FF385C; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #FF385C; letter-spacing: 5px;">${otpCode}</span>
              </div>
              <p style="color: #666; font-size: 14px;">
                This code will expire in <strong>5 minutes</strong>. Please do not share this code with anyone.
              </p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="color: #999; font-size: 12px;">
                  If you didn't request this code, please ignore this email.
                </p>
              </div>
            </div>
          </div>
        `,
      };

      try {
        await sgMail.send(msg);
        console.log(`✅ Email OTP sent successfully to ${email}`);

        return NextResponse.json({
          success: true,
          message: `OTP sent to ${email}`,
          sessionId: `email_${Date.now()}`
        });
      } catch (sendGridError: any) {
        console.error('❌ SendGrid error:', {
          message: sendGridError.message,
          code: sendGridError.code,
          response: sendGridError.response?.body
        });

        // Fall back to demo mode if SendGrid fails
        return NextResponse.json({
          success: true,
          message: `📧 Demo Mode (SendGrid failed): Check console for OTP`,
          demoCode: otpCode,
          sessionId: `fallback_email_${Date.now()}`,
          error: sendGridError.message
        });
      }
    } else {
      // Demo mode - SendGrid not configured
      console.log(`Demo mode: Email OTP for ${email}: ${otpCode}`);

      return NextResponse.json({
        success: true,
        message: `📧 Demo Mode: OTP would be sent to ${email}`,
        demoCode: otpCode,
        sessionId: `demo_email_${Date.now()}`,
        note: 'Add SENDGRID_API_KEY to .env.local for real emails'
      });
    }

  } catch (error) {
    console.error('Email OTP send error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email OTP' },
      { status: 500 }
    );
  }
}