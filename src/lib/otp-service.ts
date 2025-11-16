interface OTPConfig {
  provider: 'twilio' | 'firebase' | 'custom';
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioServiceSid?: string;
  firebaseConfig?: any;
}

export interface OTPRequest {
  phoneNumber: string;
  countryCode: string;
  method: 'sms' | 'whatsapp' | 'email';
  email?: string;
}

export interface OTPVerification {
  phoneNumber: string;
  countryCode: string;
  code: string;
  method: 'sms' | 'whatsapp' | 'email';
  email?: string;
}

class OTPService {
  private config: OTPConfig;

  constructor(config: OTPConfig) {
    this.config = config;
  }

  async sendOTP(request: OTPRequest): Promise<{ success: boolean; message: string; sessionId?: string }> {
    try {
      const fullPhoneNumber = `${request.countryCode}${request.phoneNumber}`;

      if (this.config.provider === 'twilio') {
        return await this.sendTwilioOTP(fullPhoneNumber, request.method);
      } else if (this.config.provider === 'firebase') {
        return await this.sendFirebaseOTP(fullPhoneNumber, request.method);
      } else {
        // Custom/demo implementation - for development
        return await this.sendDemoOTP(request);
      }
    } catch (error) {
      console.error('OTP send error:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  async verifyOTP(verification: OTPVerification): Promise<{ success: boolean; message: string }> {
    try {
      const fullPhoneNumber = `${verification.countryCode}${verification.phoneNumber}`;

      if (this.config.provider === 'twilio') {
        return await this.verifyTwilioOTP(fullPhoneNumber, verification.code, verification.method);
      } else if (this.config.provider === 'firebase') {
        return await this.verifyFirebaseOTP(fullPhoneNumber, verification.code);
      } else {
        // Custom/demo implementation - for development
        return await this.verifyDemoOTP(verification);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  }

  private async sendTwilioOTP(phoneNumber: string, method: 'sms' | 'whatsapp' | 'email'): Promise<{ success: boolean; message: string; sessionId?: string }> {
    // For email, use dedicated email API
    if (method === 'email') {
      return await this.sendEmailOTP(phoneNumber); // phoneNumber here is actually email
    }

    // Twilio implementation for SMS/WhatsApp
    const response = await fetch('/api/otp/send-twilio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, method })
    });

    const result = await response.json();
    return result;
  }

  private async sendEmailOTP(email: string): Promise<{ success: boolean; message: string; sessionId?: string }> {
    const response = await fetch('/api/otp/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const result = await response.json();
    return result;
  }

  private async verifyTwilioOTP(phoneNumber: string, code: string, method: 'sms' | 'whatsapp' = 'sms'): Promise<{ success: boolean; message: string }> {
    const response = await fetch('/api/otp/verify-twilio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, code, method })
    });

    const result = await response.json();
    return result;
  }

  private async sendFirebaseOTP(phoneNumber: string, method: 'sms' | 'whatsapp' | 'email'): Promise<{ success: boolean; message: string; sessionId?: string }> {
    // Firebase implementation
    const response = await fetch('/api/otp/send-firebase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, method })
    });

    const result = await response.json();
    return result;
  }

  private async verifyFirebaseOTP(phoneNumber: string, code: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch('/api/otp/verify-firebase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, code })
    });

    const result = await response.json();
    return result;
  }

  private async sendDemoOTP(request: OTPRequest): Promise<{ success: boolean; message: string; sessionId?: string }> {
    // Demo implementation - always generates code "123456" for development
    console.log(`Demo OTP for ${request.countryCode}${request.phoneNumber} via ${request.method}: 123456`);

    // Store in session/localStorage for demo purposes
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`otp_${request.countryCode}${request.phoneNumber}`, '123456');
      sessionStorage.setItem(`otp_timestamp_${request.countryCode}${request.phoneNumber}`, Date.now().toString());
    }

    return {
      success: true,
      message: `Demo OTP sent to ${request.countryCode}${request.phoneNumber} via ${request.method}. Use code: 123456`,
      sessionId: 'demo_session'
    };
  }

  private async verifyDemoOTP(verification: OTPVerification): Promise<{ success: boolean; message: string }> {
    // Demo implementation
    if (typeof window !== 'undefined') {
      const storedCode = sessionStorage.getItem(`otp_${verification.countryCode}${verification.phoneNumber}`);
      const timestamp = sessionStorage.getItem(`otp_timestamp_${verification.countryCode}${verification.phoneNumber}`);

      if (!storedCode || !timestamp) {
        return {
          success: false,
          message: 'No OTP found. Please request a new code.'
        };
      }

      // Check if OTP is expired (5 minutes)
      const now = Date.now();
      const otpTime = parseInt(timestamp);
      if (now - otpTime > 5 * 60 * 1000) {
        sessionStorage.removeItem(`otp_${verification.countryCode}${verification.phoneNumber}`);
        sessionStorage.removeItem(`otp_timestamp_${verification.countryCode}${verification.phoneNumber}`);
        return {
          success: false,
          message: 'OTP has expired. Please request a new code.'
        };
      }

      if (storedCode === verification.code) {
        sessionStorage.removeItem(`otp_${verification.countryCode}${verification.phoneNumber}`);
        sessionStorage.removeItem(`otp_timestamp_${verification.countryCode}${verification.phoneNumber}`);
        return {
          success: true,
          message: 'OTP verified successfully!'
        };
      } else {
        return {
          success: false,
          message: 'Invalid OTP code. Please try again.'
        };
      }
    }

    return {
      success: false,
      message: 'Unable to verify OTP.'
    };
  }
}

// Create OTP service instance
const otpConfig: OTPConfig = {
  // Use Twilio if credentials are available, otherwise fallback to demo
  provider: (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) ? 'twilio' : 'custom',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID,
};

export const otpService = new OTPService(otpConfig);