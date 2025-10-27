import twilio from 'twilio';
import nodemailer from 'nodemailer';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export type VerificationChannel = 'sms' | 'whatsapp' | 'email';

interface SendOTPResult {
  success: boolean;
  message: string;
  sid?: string;
  error?: string;
}

/**
 * Send OTP via Twilio Verify Service (SMS or WhatsApp)
 */
export async function sendOTP(
  to: string,
  channel: VerificationChannel = 'sms'
): Promise<SendOTPResult> {
  try {
    // Validate phone number format for SMS and WhatsApp
    if (channel === 'sms' || channel === 'whatsapp') {
      if (!to.startsWith('+')) {
        return {
          success: false,
          message: 'Phone number must be in E.164 format (e.g., +974XXXXXXXX)',
          error: 'INVALID_PHONE_FORMAT',
        };
      }
    }

    // Handle email separately
    if (channel === 'email') {
      return await sendEmailOTP(to);
    }

    // For SMS and WhatsApp, use Twilio Verify
    const verification = await client.verify.v2
      .services(verifyServiceSid!)
      .verifications.create({
        to: channel === 'whatsapp' ? `whatsapp:${to}` : to,
        channel: channel === 'whatsapp' ? 'whatsapp' : 'sms',
      });

    return {
      success: true,
      message: `Verification code sent via ${channel}`,
      sid: verification.sid,
    };
  } catch (error: any) {
    console.error(`Error sending OTP via ${channel}:`, error);
    return {
      success: false,
      message: `Failed to send verification code via ${channel}`,
      error: error.message || 'UNKNOWN_ERROR',
    };
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  to: string,
  code: string,
  channel: VerificationChannel = 'sms'
): Promise<SendOTPResult> {
  try {
    // Handle email verification separately (using in-memory or database)
    if (channel === 'email') {
      return await verifyEmailOTP(to, code);
    }

    // For SMS and WhatsApp, use Twilio Verify
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid!)
      .verificationChecks.create({
        to: channel === 'whatsapp' ? `whatsapp:${to}` : to,
        code: code,
      });

    if (verificationCheck.status === 'approved') {
      return {
        success: true,
        message: 'Verification successful',
        sid: verificationCheck.sid,
      };
    } else {
      return {
        success: false,
        message: 'Invalid verification code',
        error: 'INVALID_CODE',
      };
    }
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'Verification failed',
      error: error.message || 'VERIFICATION_FAILED',
    };
  }
}

// In-memory storage for email OTPs (in production, use Redis or database)
const emailOTPs = new Map<string, { code: string; expiresAt: number }>();

/**
 * Send OTP via Email
 */
async function sendEmailOTP(email: string): Promise<SendOTPResult> {
  try {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store with 10-minute expiration
    emailOTPs.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Send email
    await emailTransporter.sendMail({
      from: `"Houseiana" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Houseiana Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Houseiana</h1>
              <p>Verification Code</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your verification code for Houseiana is:</p>
              <div class="code">${code}</div>
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p>If you didn't request this code, please ignore this email.</p>
              <p>Best regards,<br>The Houseiana Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return {
      success: true,
      message: 'Verification code sent to your email',
    };
  } catch (error: any) {
    console.error('Error sending email OTP:', error);
    return {
      success: false,
      message: 'Failed to send email',
      error: error.message,
    };
  }
}

/**
 * Verify Email OTP
 */
async function verifyEmailOTP(email: string, code: string): Promise<SendOTPResult> {
  const storedData = emailOTPs.get(email);

  if (!storedData) {
    return {
      success: false,
      message: 'No verification code found',
      error: 'CODE_NOT_FOUND',
    };
  }

  if (Date.now() > storedData.expiresAt) {
    emailOTPs.delete(email);
    return {
      success: false,
      message: 'Verification code has expired',
      error: 'CODE_EXPIRED',
    };
  }

  if (storedData.code !== code) {
    return {
      success: false,
      message: 'Invalid verification code',
      error: 'INVALID_CODE',
    };
  }

  // Code is valid - remove it
  emailOTPs.delete(email);

  return {
    success: true,
    message: 'Email verified successfully',
  };
}

/**
 * Check if Twilio is properly configured
 */
export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && verifyServiceSid);
}

/**
 * Check if Email is properly configured
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}
