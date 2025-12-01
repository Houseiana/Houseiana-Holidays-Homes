import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const bookingsCount = await prisma.booking.count();
    console.log(`\n✅ Total Bookings in Database: ${bookingsCount}\n`);

    const recentBookings = await prisma.booking.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        property: {
          select: {
            title: true
          }
        }
      }
    });

    if (recentBookings.length > 0) {
      console.log('📋 Recent Bookings:\n');
      recentBookings.forEach((booking, i) => {
        console.log(`${i + 1}. ${booking.guest?.firstName} ${booking.guest?.lastName}`);
        console.log(`   Property: ${booking.property?.title}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Payment: ${booking.paymentStatus}`);
        console.log(`   Check-in: ${booking.checkIn?.toISOString().split('T')[0]}`);
        console.log(`   Total: $${booking.totalPrice}\n`);
      });
    } else {
      console.log('No bookings found in the database yet.\n');
    }

    console.log('✅ Integration Status: CONNECTED');
    console.log('   - User Dashboard: https://houseiana.net');
    console.log('   - Reservation Dashboard: https://reservation.adminhouseiana.com/dashboard\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
