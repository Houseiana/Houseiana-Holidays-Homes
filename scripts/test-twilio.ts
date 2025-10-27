/**
 * Test script to check Twilio OTP configuration
 * Run with: npx tsx scripts/test-twilio.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

console.log('🔍 Checking Twilio Configuration...\n');

// Check Twilio credentials
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

console.log('Twilio Account SID:', twilioAccountSid ? `✅ ${twilioAccountSid.substring(0, 10)}...` : '❌ Not set');
console.log('Twilio Auth Token:', twilioAuthToken ? `✅ ${twilioAuthToken.substring(0, 10)}...` : '❌ Not set');
console.log('Twilio Verify Service SID:', twilioVerifyServiceSid ? `✅ ${twilioVerifyServiceSid.substring(0, 10)}...` : '❌ Not set');

console.log('\n📧 Checking Email Configuration...\n');

// Check Email credentials
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

console.log('SMTP Host:', smtpHost ? `✅ ${smtpHost}` : '❌ Not set');
console.log('SMTP Port:', smtpPort ? `✅ ${smtpPort}` : '❌ Not set');
console.log('SMTP User:', smtpUser ? `✅ ${smtpUser}` : '❌ Not set');
console.log('SMTP Password:', smtpPass ? `✅ Set (hidden)` : '❌ Not set');

console.log('\n📱 Testing Twilio Connection...\n');

// Test Twilio connection
if (twilioAccountSid && twilioAuthToken) {
  const twilio = require('twilio');
  const client = twilio(twilioAccountSid, twilioAuthToken);

  client.api.v2010.accounts(twilioAccountSid)
    .fetch()
    .then((account: any) => {
      console.log('✅ Twilio connection successful!');
      console.log('   Account Status:', account.status);
      console.log('   Account Name:', account.friendlyName);

      if (twilioVerifyServiceSid) {
        console.log('\n🔐 Testing Verify Service...\n');
        return client.verify.v2.services(twilioVerifyServiceSid).fetch();
      }
    })
    .then((service: any) => {
      if (service) {
        console.log('✅ Verify Service found!');
        console.log('   Service Name:', service.friendlyName);
        console.log('   Service Status:', service.status);
      }
    })
    .catch((error: any) => {
      console.error('❌ Twilio connection failed:', error.message);
    });
} else {
  console.log('❌ Twilio credentials not configured. Please add them to .env.local');
}

console.log('\n' + '='.repeat(50));
console.log('\n📝 Setup Instructions:\n');
console.log('1. Sign up for Twilio at https://www.twilio.com/try-twilio');
console.log('2. Get your Account SID and Auth Token from the Twilio Console');
console.log('3. Create a Verify Service at https://console.twilio.com/us1/develop/verify/services');
console.log('4. Add the credentials to your .env.local file:');
console.log('   TWILIO_ACCOUNT_SID=ACxxxxx');
console.log('   TWILIO_AUTH_TOKEN=xxxxx');
console.log('   TWILIO_VERIFY_SERVICE_SID=VAxxxxx');
console.log('\n5. For email OTP, configure SMTP settings in .env.local');
console.log('\n' + '='.repeat(50) + '\n');
