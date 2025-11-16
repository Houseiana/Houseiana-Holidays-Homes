const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkUser() {
  try {
    console.log('🔍 Checking for user with phone: +97431433333\n');

    // Check for user with exact phone match
    const userByPhone = await prisma.user.findFirst({
      where: {
        phone: '+97431433333'
      },
      select: {
        id: true,
        phone: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
        isPhoneVerified: true,
        phoneVerified: true,
        emailVerified: true,
        createdAt: true
      }
    });

    if (userByPhone) {
      console.log('✅ USER FOUND:');
      console.log('   ID:', userByPhone.id);
      console.log('   Phone:', userByPhone.phone);
      console.log('   Email:', userByPhone.email || 'null');
      console.log('   Name:', userByPhone.firstName, userByPhone.lastName);
      console.log('   Password Hash:', userByPhone.password ? userByPhone.password.substring(0, 20) + '...' : 'NO PASSWORD');
      console.log('   Phone Verified (isPhoneVerified):', userByPhone.isPhoneVerified);
      console.log('   Phone Verified (phoneVerified):', userByPhone.phoneVerified);
      console.log('   Email Verified:', userByPhone.emailVerified);
      console.log('   Created At:', userByPhone.createdAt);
    } else {
      console.log('❌ USER NOT FOUND with phone: +97431433333');
      console.log('\n🔍 Checking all users in database...\n');

      // List all users
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          phone: true,
          email: true,
          firstName: true,
          lastName: true
        },
        take: 10
      });

      if (allUsers.length > 0) {
        console.log(`📋 Found ${allUsers.length} total users:`);
        allUsers.forEach((user, index) => {
          console.log(`\n   User ${index + 1}:`);
          console.log('   - ID:', user.id);
          console.log('   - Phone:', user.phone || 'null');
          console.log('   - Email:', user.email || 'null');
          console.log('   - Name:', user.firstName, user.lastName);
        });
      } else {
        console.log('❌ No users found in database!');
      }
    }

  } catch (error) {
    console.error('❌ Error checking user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
