// Complete signup flow test
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testCompleteSignup() {
  console.log('🧪 Testing Complete Signup Flow with Real Database\n');

  try {
    // Test creating a new user
    console.log('Step 1: Creating new user account...');
    const signupResponse = await fetch(`${BASE_URL}/api/auth/otp-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'phone',
        phoneNumber: '+97430424555',
        password: 'SecurePass123!',
        isVerified: true,
        firstName: 'Fatima',
        lastName: 'Al-Thani',
        idNumber: 'QID555666777',
        idCopy: '/uploads/fatima-id.jpg',
        kycCompleted: true
      })
    });

    const signupData = await signupResponse.json();
    console.log('\n✅ Signup Response:');
    console.log(JSON.stringify(signupData, null, 2));

    if (signupData.success) {
      console.log('\n✅ User created successfully!');
      console.log(`User ID: ${signupData.user.id}`);
      console.log(`Name: ${signupData.user.firstName} ${signupData.user.lastName}`);
      console.log(`Phone: ${signupData.user.phone}`);
      console.log(`Is Host: ${signupData.user.isHost}`);
      console.log(`KYC Completed: ${signupData.user.hasCompletedKYC}`);
      console.log(`Token: ${signupData.token.substring(0, 20)}...`);
    } else {
      console.log('\n❌ Signup failed:', signupData.message);
    }

    // Test logging in with existing user
    console.log('\n\nStep 2: Testing login with existing user...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/otp-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'phone',
        phoneNumber: '+97430424555',
        password: 'SecurePass123!',
        isVerified: true
      })
    });

    const loginData = await loginResponse.json();
    console.log('\n✅ Login Response:');
    console.log(JSON.stringify(loginData, null, 2));

    if (loginData.success && !loginData.isNewUser) {
      console.log('\n✅ Existing user login successful!');
      console.log(`User ID: ${loginData.user.id}`);
      console.log(`Name: ${loginData.user.firstName} ${loginData.user.lastName}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

testCompleteSignup();
