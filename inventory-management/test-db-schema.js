// Script to test database schema and relations
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseSchema() {
  console.log('🔍 Testing Database Schema and Relations...\n');

  try {
    // Test 1: Check all tables exist
    console.log('📊 Testing Tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach(t => console.log(`   - ${t.table_name}`));
    console.log('');

    // Test 2: Check User table and relations
    console.log('👤 Testing User Model...');
    const userCount = await prisma.user.count();
    console.log(`✅ Users: ${userCount} records`);

    if (userCount > 0) {
      const sampleUser = await prisma.user.findFirst({
        include: {
          guestProfile: true,
          hostProfile: true,
          bookingsAsGuest: { take: 1 },
          propertiesAsHost: { take: 1 }
        }
      });
      console.log(`   Sample user: ${sampleUser.firstName} ${sampleUser.lastName}`);
      console.log(`   - Guest Profile: ${sampleUser.guestProfile ? '✅' : '❌'}`);
      console.log(`   - Host Profile: ${sampleUser.hostProfile ? '✅' : '❌'}`);
      console.log(`   - Is Guest: ${sampleUser.isGuest}`);
      console.log(`   - Is Host: ${sampleUser.isHost}`);
    }
    console.log('');

    // Test 3: Check Property table and relations
    console.log('🏠 Testing Property Model...');
    const propertyCount = await prisma.property.count();
    console.log(`✅ Properties: ${propertyCount} records`);

    if (propertyCount > 0) {
      const sampleProperty = await prisma.property.findFirst({
        include: {
          owner: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          bookings: { take: 1 },
          kyc: true
        }
      });
      console.log(`   Sample property: ${sampleProperty.title}`);
      console.log(`   - Owner: ${sampleProperty.owner ? sampleProperty.owner.firstName + ' ' + sampleProperty.owner.lastName : 'N/A'}`);
      console.log(`   - Approval Status: ${sampleProperty.approval_status || sampleProperty.status}`);
      console.log(`   - KYC: ${sampleProperty.kyc ? '✅' : '❌'}`);
    }
    console.log('');

    // Test 4: Check Booking table and relations
    console.log('📅 Testing Booking Model...');
    const bookingCount = await prisma.booking.count();
    console.log(`✅ Bookings: ${bookingCount} records`);

    if (bookingCount > 0) {
      const sampleBooking = await prisma.booking.findFirst({
        include: {
          guest: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          property: {
            select: {
              title: true
            }
          },
          host: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });
      console.log(`   Sample booking ID: ${sampleBooking.id}`);
      console.log(`   - Guest: ${sampleBooking.guest ? sampleBooking.guest.firstName + ' ' + sampleBooking.guest.lastName : 'N/A'}`);
      console.log(`   - Property: ${sampleBooking.property ? sampleBooking.property.title : 'N/A'}`);
      console.log(`   - Host: ${sampleBooking.host ? sampleBooking.host.firstName + ' ' + sampleBooking.host.lastName : 'N/A'}`);
      console.log(`   - Status: ${sampleBooking.status}`);
      console.log(`   - Payment Status: ${sampleBooking.paymentStatus}`);
    }
    console.log('');

    // Test 5: Check Payment/Transaction relations
    console.log('💳 Testing Payment/Transaction Models...');

    try {
      const paymentMethodCount = await prisma.paymentMethod.count();
      console.log(`✅ Payment Methods: ${paymentMethodCount} records`);
    } catch (e) {
      console.log(`⚠️  PaymentMethod model: ${e.message}`);
    }

    try {
      const transactionCount = await prisma.transaction.count();
      console.log(`✅ Transactions: ${transactionCount} records`);
    } catch (e) {
      console.log(`⚠️  Transaction model: ${e.message}`);
    }

    try {
      const payoutCount = await prisma.payout.count();
      console.log(`✅ Payouts: ${payoutCount} records`);
    } catch (e) {
      console.log(`⚠️  Payout model: ${e.message}`);
    }
    console.log('');

    // Test 6: Check Review relations
    console.log('⭐ Testing Review Model...');
    try {
      const reviewCount = await prisma.review.count();
      console.log(`✅ Reviews: ${reviewCount} records`);

      if (reviewCount > 0) {
        const sampleReview = await prisma.review.findFirst({
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            property: {
              select: {
                title: true
              }
            }
          }
        });
        console.log(`   Sample review: ${sampleReview.overallRating}⭐ by ${sampleReview.user.firstName}`);
      }
    } catch (e) {
      console.log(`⚠️  Review model: ${e.message}`);
    }
    console.log('');

    // Test 7: Check KYC relations
    console.log('🔐 Testing PropertyKYC Model...');
    try {
      const kycCount = await prisma.propertyKYC.count();
      console.log(`✅ Property KYC Records: ${kycCount} records`);
    } catch (e) {
      console.log(`⚠️  PropertyKYC model: ${e.message}`);
    }
    console.log('');

    // Test 8: Check Organization relations (B2B)
    console.log('🏢 Testing Organization Model...');
    try {
      const orgCount = await prisma.organization.count();
      console.log(`✅ Organizations: ${orgCount} records`);
    } catch (e) {
      console.log(`⚠️  Organization model: ${e.message}`);
    }
    console.log('');

    // Test 9: Check Admin Activity Log
    console.log('📝 Testing AdminActivityLog Model...');
    try {
      const adminActivityLogCount = await prisma.adminActivityLog.count();
      console.log(`✅ Admin Activity Logs: ${adminActivityLogCount} records`);
    } catch (e) {
      console.log(`⚠️  AdminActivityLog model: ${e.message}`);
    }
    console.log('');

    // Test 10: Check Additional Models
    console.log('🔧 Testing Additional Models...');
    try {
      const complaintsCount = await prisma.complaint.count();
      console.log(`✅ Complaints: ${complaintsCount} records`);
    } catch (e) {
      console.log(`⚠️  Complaint model: ${e.message}`);
    }

    try {
      const supportTicketsCount = await prisma.supportTicket.count();
      console.log(`✅ Support Tickets: ${supportTicketsCount} records`);
    } catch (e) {
      console.log(`⚠️  SupportTicket model: ${e.message}`);
    }

    try {
      const contractsCount = await prisma.contract.count();
      console.log(`✅ Contracts: ${contractsCount} records`);
    } catch (e) {
      console.log(`⚠️  Contract model: ${e.message}`);
    }

    try {
      const invoicesCount = await prisma.invoice.count();
      console.log(`✅ Invoices: ${invoicesCount} records`);
    } catch (e) {
      console.log(`⚠️  Invoice model: ${e.message}`);
    }
    console.log('');

    console.log('✅ Database schema test completed!\n');

  } catch (error) {
    console.error('❌ Error testing database schema:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseSchema();
