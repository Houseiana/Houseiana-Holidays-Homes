/**
 * Database Cleanup Script
 *
 * This script removes ALL user data, properties, bookings, and related records
 * from the database to prepare for production deployment.
 *
 * ⚠️ WARNING: This is a DESTRUCTIVE operation and cannot be undone!
 *
 * Usage:
 *   DATABASE_URL="your-connection-string" npx ts-node scripts/clean-database.ts
 *
 * Or with environment variable:
 *   DATABASE_URL="postgresql://..." DIRECT_URL="postgresql://..." npx ts-node scripts/clean-database.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('\n🚨 DATABASE CLEANUP SCRIPT 🚨\n');
  console.log('This will DELETE ALL data from the database!');
  console.log('The following tables will be cleared:');
  console.log('  - Users & Profiles');
  console.log('  - Properties');
  console.log('  - Bookings');
  console.log('  - Reviews');
  console.log('  - Favorites');
  console.log('  - Transactions & Payouts');
  console.log('  - Organizations & Members');
  console.log('  - Support Tickets & Complaints');
  console.log('  - Chat Conversations');
  console.log('  - All related data\n');

  // Safety check - require explicit confirmation via environment variable
  if (process.env.CONFIRM_DELETE !== 'YES') {
    console.error('❌ Safety check failed!');
    console.error('To run this script, you must set: CONFIRM_DELETE=YES');
    console.error('\nExample:');
    console.error('  CONFIRM_DELETE=YES DATABASE_URL="..." npx ts-node scripts/clean-database.ts\n');
    process.exit(1);
  }

  try {
    console.log('Starting database cleanup...\n');

    // Delete in order of dependencies (child tables first)

    // 1. Support & Communication
    console.log('🗑️  Deleting support messages...');
    await prisma.supportMessage.deleteMany();

    console.log('🗑️  Deleting support tickets...');
    await prisma.supportTicket.deleteMany();

    console.log('🗑️  Deleting complaint messages...');
    await prisma.complaintMessage.deleteMany();

    console.log('🗑️  Deleting complaints...');
    await prisma.complaint.deleteMany();

    console.log('🗑️  Deleting chat messages...');
    await prisma.chatMessage.deleteMany();

    console.log('🗑️  Deleting chat conversations...');
    await prisma.chatConversation.deleteMany();

    // 2. Financial Records
    console.log('🗑️  Deleting transactions...');
    await prisma.transaction.deleteMany();

    console.log('🗑️  Deleting payouts...');
    await prisma.payout.deleteMany();

    console.log('🗑️  Deleting payment methods...');
    await prisma.paymentMethod.deleteMany();

    console.log('🗑️  Deleting payout methods...');
    await prisma.payoutMethod.deleteMany();

    // 3. Property Related
    console.log('🗑️  Deleting favorites...');
    await prisma.favorite.deleteMany();

    console.log('🗑️  Deleting reviews...');
    await prisma.review.deleteMany();

    console.log('🗑️  Deleting property KYC records...');
    await prisma.propertyKYC.deleteMany();

    console.log('🗑️  Deleting property approvals...');
    await prisma.propertyApproval.deleteMany();

    // 4. Bookings (must be before properties)
    console.log('🗑️  Deleting bookings...');
    await prisma.booking.deleteMany();

    // 5. Properties
    console.log('🗑️  Deleting properties...');
    await prisma.property.deleteMany();

    // 6. Organizations
    console.log('🗑️  Deleting invoices...');
    await prisma.invoice.deleteMany();

    console.log('🗑️  Deleting contracts...');
    await prisma.contract.deleteMany();

    console.log('🗑️  Deleting organization members...');
    await prisma.organizationMember.deleteMany();

    console.log('🗑️  Deleting organizations...');
    await prisma.organization.deleteMany();

    // 7. User Authentication & Admin
    console.log('🗑️  Deleting sessions...');
    await prisma.session.deleteMany();

    console.log('🗑️  Deleting OTP codes...');
    await prisma.otpCode.deleteMany();

    console.log('🗑️  Deleting accounts...');
    await prisma.account.deleteMany();

    console.log('🗑️  Deleting referrals...');
    await prisma.referral.deleteMany();

    console.log('🗑️  Deleting account actions...');
    await prisma.accountAction.deleteMany();

    console.log('🗑️  Deleting admin activity logs...');
    await prisma.adminActivityLog.deleteMany();

    console.log('🗑️  Deleting admin accounts...');
    await prisma.admin.deleteMany();

    // 8. User Profiles (must be before users due to CASCADE)
    console.log('🗑️  Deleting host settings...');
    await prisma.hostSettings.deleteMany();

    console.log('🗑️  Deleting host profiles...');
    await prisma.hostProfile.deleteMany();

    console.log('🗑️  Deleting guest profiles...');
    await prisma.guestProfile.deleteMany();

    // 9. Users (last, as many tables reference this)
    console.log('🗑️  Deleting users...');
    await prisma.user.deleteMany();

    // 10. System Metrics (optional cleanup)
    console.log('🗑️  Deleting system metrics...');
    await prisma.systemMetric.deleteMany();

    console.log('\n✅ Database cleanup completed successfully!');
    console.log('\n📊 All user data has been removed from the database.');
    console.log('   The database schema remains intact and ready for production.\n');

    // Note: LookupTable data is preserved as it contains application configuration
    console.log('ℹ️  Note: Lookup table data has been preserved for application configuration.\n');

  } catch (error) {
    console.error('\n❌ Error during database cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanDatabase()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
