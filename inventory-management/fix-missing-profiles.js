// Script to create missing GuestProfile and HostProfile records
// This fixes the critical data integrity issue where users have role flags
// but no corresponding profile records
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixMissingProfiles() {
  console.log('🔧 Starting Profile Fix Script...\n');

  try {
    // Step 1: Find all users who should be guests (have bookings or isGuest=true)
    console.log('👤 Step 1: Creating Missing Guest Profiles...');

    const usersNeedingGuestProfile = await prisma.user.findMany({
      where: {
        OR: [
          { isGuest: true },
          {
            bookingsAsGuest: {
              some: {}
            }
          }
        ],
        guestProfile: null // No profile exists
      },
      include: {
        bookingsAsGuest: {
          select: {
            totalPrice: true,
            numberOfNights: true,
            status: true
          }
        }
      }
    });

    console.log(`   Found ${usersNeedingGuestProfile.length} users needing GuestProfile`);

    for (const user of usersNeedingGuestProfile) {
      // Calculate guest stats from bookings
      const completedBookings = user.bookingsAsGuest.filter(b => b.status === 'COMPLETED');
      const totalBookings = completedBookings.length;
      const totalSpent = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      const totalNightsStayed = completedBookings.reduce((sum, b) => sum + b.numberOfNights, 0);

      // Calculate loyalty tier based on total spent
      let loyaltyTier = 'BRONZE';
      if (totalSpent >= 50000) loyaltyTier = 'PLATINUM';
      else if (totalSpent >= 20000) loyaltyTier = 'GOLD';
      else if (totalSpent >= 10000) loyaltyTier = 'SILVER';

      // Calculate travel points (1 point per 10 QAR spent)
      const travelPoints = Math.floor(totalSpent / 10);

      await prisma.guestProfile.create({
        data: {
          userId: user.id,
          travelPoints: travelPoints,
          pointsEarned: travelPoints,
          loyaltyTier: loyaltyTier,
          totalBookings: totalBookings,
          totalNightsStayed: totalNightsStayed,
          totalSpent: totalSpent
        }
      });

      console.log(`   ✅ Created GuestProfile for ${user.firstName} ${user.lastName}`);
      console.log(`      - Bookings: ${totalBookings}, Spent: ${totalSpent.toFixed(2)} QAR, Points: ${travelPoints}, Tier: ${loyaltyTier}`);
    }

    console.log('');

    // Step 2: Find all users who should be hosts (own properties)
    console.log('🏠 Step 2: Creating Missing Host Profiles...');

    const usersNeedingHostProfile = await prisma.user.findMany({
      where: {
        propertiesAsHost: {
          some: {}
        },
        hostProfile: null // No profile exists
      },
      include: {
        propertiesAsHost: {
          select: {
            id: true,
            status: true,
            averageRating: true
          }
        },
        bookingsAsHost: {
          select: {
            status: true,
            hostEarnings: true,
            createdAt: true,
            confirmedAt: true
          }
        },
        payouts: {
          select: {
            amount: true,
            status: true
          }
        }
      }
    });

    console.log(`   Found ${usersNeedingHostProfile.length} users needing HostProfile`);

    for (const user of usersNeedingHostProfile) {
      // Calculate host stats
      const totalProperties = user.propertiesAsHost.length;
      const activeProperties = user.propertiesAsHost.filter(p => p.status === 'PUBLISHED').length;

      const completedBookings = user.bookingsAsHost.filter(b => b.status === 'COMPLETED');
      const totalBookings = completedBookings.length;
      const totalRevenue = completedBookings.reduce((sum, b) => sum + b.hostEarnings, 0);

      // Calculate average rating across all properties
      const propertiesWithRatings = user.propertiesAsHost.filter(p => p.averageRating);
      const averageRating = propertiesWithRatings.length > 0
        ? propertiesWithRatings.reduce((sum, p) => sum + p.averageRating, 0) / propertiesWithRatings.length
        : null;

      // Calculate response rate (bookings confirmed within 24h)
      const bookingsWithResponse = user.bookingsAsHost.filter(b => b.confirmedAt);
      const quickResponses = bookingsWithResponse.filter(b => {
        const diff = new Date(b.confirmedAt) - new Date(b.createdAt);
        return diff <= 24 * 60 * 60 * 1000; // 24 hours in ms
      });
      const responseRate = bookingsWithResponse.length > 0
        ? (quickResponses.length / bookingsWithResponse.length) * 100
        : null;

      // Calculate acceptance rate (confirmed / total requests)
      const totalRequests = user.bookingsAsHost.filter(b =>
        ['REQUESTED', 'APPROVED', 'CONFIRMED', 'REJECTED', 'COMPLETED'].includes(b.status)
      ).length;
      const acceptedRequests = user.bookingsAsHost.filter(b =>
        ['APPROVED', 'CONFIRMED', 'COMPLETED'].includes(b.status)
      ).length;
      const acceptanceRate = totalRequests > 0
        ? (acceptedRequests / totalRequests) * 100
        : null;

      // Determine host type based on number of properties
      let hostType = 'INDIVIDUAL';
      if (totalProperties >= 11) hostType = 'COMPANY';
      else if (totalProperties >= 4) hostType = 'PROFESSIONAL';

      // Set isHost flag if not already set
      if (!user.isHost) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isHost: true }
        });
        console.log(`   ⚙️  Set isHost=true for ${user.firstName} ${user.lastName}`);
      }

      // Create HostProfile
      await prisma.hostProfile.create({
        data: {
          userId: user.id,
          hostType: hostType,
          totalProperties: totalProperties,
          activeProperties: activeProperties,
          totalBookings: totalBookings,
          totalRevenue: totalRevenue,
          averageRating: averageRating,
          responseRate: responseRate,
          acceptanceRate: acceptanceRate,
          isVerifiedHost: user.kycStatus === 'APPROVED'
        }
      });

      console.log(`   ✅ Created HostProfile for ${user.firstName} ${user.lastName}`);
      console.log(`      - Type: ${hostType}, Properties: ${totalProperties} (${activeProperties} active)`);
      console.log(`      - Bookings: ${totalBookings}, Revenue: ${totalRevenue.toFixed(2)} QAR`);
      if (averageRating) console.log(`      - Rating: ${averageRating.toFixed(2)}⭐`);
      if (responseRate) console.log(`      - Response Rate: ${responseRate.toFixed(1)}%, Acceptance Rate: ${acceptanceRate?.toFixed(1)}%`);
    }

    console.log('');

    // Step 3: Verify the fix
    console.log('✅ Step 3: Verifying Profiles...');

    const guestProfileCount = await prisma.guestProfile.count();
    const hostProfileCount = await prisma.hostProfile.count();
    const usersWithIsGuestTrue = await prisma.user.count({ where: { isGuest: true } });
    const usersWithIsHostTrue = await prisma.user.count({ where: { isHost: true } });
    const usersWithProperties = await prisma.user.count({
      where: {
        propertiesAsHost: {
          some: {}
        }
      }
    });

    console.log(`   Guest Profiles: ${guestProfileCount} (isGuest=true: ${usersWithIsGuestTrue})`);
    console.log(`   Host Profiles: ${hostProfileCount} (isHost=true: ${usersWithIsHostTrue}, with properties: ${usersWithProperties})`);

    if (guestProfileCount >= usersWithIsGuestTrue && hostProfileCount >= usersWithProperties) {
      console.log('   ✅ All profiles fixed successfully!');
    } else {
      console.log('   ⚠️  Some profiles may still be missing. Re-run script to verify.');
    }

    console.log('\n🎉 Profile fix completed!\n');

  } catch (error) {
    console.error('❌ Error fixing profiles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingProfiles();
