
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting debug script...');

  const propertyId = 'cmik8z3yl0001ld04qis4v232';
  const checkIn = '2025-12-04';
  const checkOut = '2025-12-06';
  const guests = 1;
  const adults = 1;

  try {
    // 1. Get a valid user to act as guest
    const guest = await prisma.user.findFirst();
    if (!guest) {
      console.error('No users found in database');
      return;
    }
    console.log(`Using guest: ${guest.id} (${guest.email})`);

    // 2. Get property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { owner: true }
    });

    if (!property) {
      console.error('Property not found');
      return;
    }
    console.log(`Property found: ${property.title}, Status: ${property.status}`);

    // 3. Simulate the logic from route.ts
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    console.log(`Dates: ${checkInDate.toISOString()} to ${checkOutDate.toISOString()}`);

    // Transaction
    const booking = await prisma.$transaction(async (tx) => {
      console.log('Inside transaction...');
      
      // Check conflicts
      const conflicts = await tx.booking.findMany({
        where: {
          propertyId,
          status: { in: ['AWAITING_PAYMENT', 'REQUESTED', 'CONFIRMED', 'CHECKED_IN'] },
          OR: [
            { AND: [{ checkIn: { lte: checkInDate } }, { checkOut: { gt: checkInDate } }] },
            { AND: [{ checkIn: { lt: checkOutDate } }, { checkOut: { gte: checkOutDate } }] },
            { AND: [{ checkIn: { gte: checkInDate } }, { checkOut: { lte: checkOutDate } }] }
          ]
        }
      });
      console.log(`Found ${conflicts.length} potential conflicts`);

      // Calculate pricing (simplified for debug)
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const nightlyRate = property.pricePerNight || 0;
      const subtotal = nights * nightlyRate;
      const cleaningFee = property.cleaningFee || 0;
      const serviceFee = subtotal * 0.1;
      const taxAmount = (subtotal + serviceFee) * 0.12;
      const totalPrice = subtotal + cleaningFee + serviceFee + taxAmount;
      const platformCommission = subtotal * 0.15;
      const hostEarnings = subtotal - platformCommission;

      console.log('Creating booking object...');
      
      const newBooking = await tx.booking.create({
        data: {
          guestId: guest.id,
          propertyId,
          hostId: property.ownerId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          numberOfNights: nights,
          guests,
          adults,
          children: 0,
          infants: 0,
          nightlyRate,
          subtotal,
          cleaningFee,
          serviceFee,
          taxAmount,
          totalPrice,
          platformCommission,
          hostEarnings,
          specialRequests: '',
          status: 'AWAITING_PAYMENT',
          paymentStatus: 'PENDING',
          cancellationPolicyType: property.cancellationPolicy || 'FLEXIBLE',
          // Note: cancellationDeadline might be missing in my simplified logic if it's required?
          // In route.ts it was calculated.
          cancellationDeadline: new Date(checkInDate) 
        }
      });
      
      console.log('Booking created successfully:', newBooking.id);
      return newBooking;
    });

  } catch (error) {
    console.error('ERROR CAUGHT:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
