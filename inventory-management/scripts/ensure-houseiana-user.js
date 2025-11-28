/**
 * Script to ensure Houseiana system user exists in the database
 * Run this with: DATABASE_URL="..." node scripts/ensure-houseiana-user.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const HOUSEIANA_USER_ID = 'user_houseiana_system';

async function ensureHouseianaUser() {
  try {
    console.log('Checking if Houseiana system user exists...');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: HOUSEIANA_USER_ID },
    });

    if (existingUser) {
      console.log('✅ Houseiana system user already exists');
      console.log('   ID:', existingUser.id);
      console.log('   Name:', existingUser.firstName, existingUser.lastName);
      return existingUser;
    }

    // Create Houseiana system user
    console.log('Creating Houseiana system user...');
    const houseianaUser = await prisma.user.create({
      data: {
        id: HOUSEIANA_USER_ID,
        firstName: 'Houseiana',
        lastName: 'Properties',
        email: 'properties@houseiana.com',
        phone: '+974-0000-0000',
        countryCode: '+974',
        nationality: 'Qatar',
        isGuest: false,
        isHost: true, // Houseiana can host properties
        isAdmin: true,
        isSuperAdmin: false,
        accountStatus: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
        kycStatus: 'APPROVED', // Pre-approved for Houseiana
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('✅ Houseiana system user created successfully!');
    console.log('   ID:', houseianaUser.id);
    console.log('   Name:', houseianaUser.firstName, houseianaUser.lastName);
    console.log('   Email:', houseianaUser.email);

    return houseianaUser;
  } catch (error) {
    console.error('❌ Error ensuring Houseiana user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  ensureHouseianaUser()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { ensureHouseianaUser, HOUSEIANA_USER_ID };
