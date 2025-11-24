import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting dashboard seed...')

  // ============================================================================
  // 1. CREATE OR FIND TEST USERS
  // ============================================================================

  console.log('\n👤 Creating test users...')

  // Test guest user (for bookings, payments, etc.)
  const guestEmail = 'test.guest@houseiana.com'
  let guestUser = await prisma.user.findUnique({
    where: { email: guestEmail }
  })

  if (!guestUser) {
    const hashedPassword = await bcrypt.hash('Test123!', 10)
    guestUser = await prisma.user.create({
      data: {
        email: guestEmail,
        firstName: 'Ahmed',
        lastName: 'Al-Thani',
        password: hashedPassword,
        phone: '+97433445566',
        countryCode: '+974',
        emailVerified: true,
        isGuest: true,
        isHost: false,
        accountStatus: 'ACTIVE',
        kycStatus: 'APPROVED',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        nationality: 'Qatar',
        preferredCurrency: 'QAR',
        preferredLanguage: 'en'
      }
    })
    console.log('✅ Created test guest user:', guestUser.email)
  } else {
    console.log('✅ Found existing test guest user:', guestUser.email)
  }

  // Test host users (for properties)
  const hostData = [
    {
      email: 'host1@houseiana.com',
      firstName: 'Fatima',
      lastName: 'Al-Mansouri',
      phone: '+97455667788'
    },
    {
      email: 'host2@houseiana.com',
      firstName: 'Mohammed',
      lastName: 'Al-Kuwari',
      phone: '+97466778899'
    }
  ]

  const hosts = []
  for (const hostInfo of hostData) {
    let host = await prisma.user.findUnique({
      where: { email: hostInfo.email }
    })

    if (!host) {
      const hashedPassword = await bcrypt.hash('Test123!', 10)
      host = await prisma.user.create({
        data: {
          ...hostInfo,
          password: hashedPassword,
          countryCode: '+974',
          emailVerified: true,
          isGuest: true,
          isHost: true,
          accountStatus: 'ACTIVE',
          kycStatus: 'APPROVED',
          nationality: 'Qatar',
          preferredCurrency: 'QAR',
          preferredLanguage: 'en'
        }
      })
      console.log('✅ Created test host:', host.email)
    } else {
      console.log('✅ Found existing test host:', host.email)
    }
    hosts.push(host)
  }

  // ============================================================================
  // 2. CREATE PROPERTIES (for /api/properties?limit=6)
  // ============================================================================

  console.log('\n🏠 Creating properties...')

  const propertiesData = [
    {
      ownerId: hosts[0].id,
      title: 'Luxury Beachfront Villa in Pearl Qatar',
      description: 'Stunning 5-bedroom villa with private beach access, infinity pool, and panoramic sea views. Located in the prestigious Pearl-Qatar development, this property offers the ultimate luxury living experience.',
      propertyType: 'VILLA' as any,
      roomType: 'ENTIRE_PLACE' as any,
      country: 'Qatar',
      city: 'Doha',
      state: 'Pearl Qatar',
      address: 'Porto Arabia Drive, The Pearl',
      zipCode: '00000',
      latitude: 25.3712,
      longitude: 51.5459,
      guests: 10,
      bedrooms: 5,
      beds: 6,
      bathrooms: 4.5,
      pricePerNight: 2500,
      cleaningFee: 300,
      serviceFee: 250,
      amenities: JSON.stringify(['wifi', 'pool', 'parking', 'ac', 'kitchen', 'washer', 'beach_access', 'gym', 'security']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
      ]),
      coverPhoto: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      status: 'PUBLISHED' as any,
      isActive: true,
      ownerType: 'INDIVIDUAL' as any
    },
    {
      ownerId: hosts[1].id,
      title: 'Modern Apartment in West Bay',
      description: 'Elegant 2-bedroom apartment in the heart of West Bay with stunning city and sea views. Fully furnished with modern amenities and close to Souq Waqif.',
      propertyType: 'APARTMENT' as any,
      roomType: 'ENTIRE_PLACE' as any,
      country: 'Qatar',
      city: 'Doha',
      state: 'West Bay',
      address: 'Majlis Al Taawon Street',
      zipCode: '00000',
      latitude: 25.3181,
      longitude: 51.5310,
      guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      pricePerNight: 800,
      cleaningFee: 100,
      serviceFee: 80,
      amenities: JSON.stringify(['wifi', 'parking', 'ac', 'kitchen', 'washer', 'tv', 'elevator']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
      ]),
      coverPhoto: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      status: 'PUBLISHED' as any,
      isActive: true,
      ownerType: 'INDIVIDUAL' as any
    },
    {
      ownerId: hosts[0].id,
      title: 'Cozy Studio near Souq Waqif',
      description: 'Perfect for solo travelers or couples. Walking distance to Souq Waqif, Corniche, and Museum of Islamic Art. Fully equipped kitchen and comfortable workspace.',
      propertyType: 'STUDIO' as any,
      roomType: 'ENTIRE_PLACE' as any,
      country: 'Qatar',
      city: 'Doha',
      state: 'Mushayrib',
      address: 'Al Souq Street',
      zipCode: '00000',
      latitude: 25.2854,
      longitude: 51.5310,
      guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      pricePerNight: 350,
      cleaningFee: 50,
      serviceFee: 35,
      amenities: JSON.stringify(['wifi', 'ac', 'kitchen', 'workspace', 'coffee_maker']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
      ]),
      coverPhoto: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
      status: 'PUBLISHED' as any,
      isActive: true,
      ownerType: 'INDIVIDUAL' as any
    },
    {
      ownerId: hosts[1].id,
      title: 'Spacious Family Villa in Al Waab',
      description: 'Beautiful 4-bedroom villa perfect for families. Large garden, private pool, and BBQ area. Located in quiet residential area with easy access to schools and malls.',
      propertyType: 'VILLA' as any,
      roomType: 'ENTIRE_PLACE' as any,
      country: 'Qatar',
      city: 'Doha',
      state: 'Al Waab',
      address: 'Al Waab Street',
      zipCode: '00000',
      latitude: 25.2631,
      longitude: 51.4415,
      guests: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 3,
      pricePerNight: 1200,
      cleaningFee: 150,
      serviceFee: 120,
      amenities: JSON.stringify(['wifi', 'pool', 'parking', 'ac', 'kitchen', 'washer', 'garden', 'bbq', 'kids_friendly']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
      ]),
      coverPhoto: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      status: 'PUBLISHED' as any,
      isActive: true,
      ownerType: 'INDIVIDUAL' as any
    },
    {
      ownerId: hosts[0].id,
      title: 'Luxury Penthouse with City Views',
      description: 'Spectacular 3-bedroom penthouse on the 40th floor with 360-degree views of Doha skyline. Features a private terrace, jacuzzi, and premium furnishings.',
      propertyType: 'APARTMENT' as any,
      roomType: 'ENTIRE_PLACE' as any,
      country: 'Qatar',
      city: 'Doha',
      state: 'West Bay',
      address: 'Lusail Boulevard',
      zipCode: '00000',
      latitude: 25.3292,
      longitude: 51.5253,
      guests: 6,
      bedrooms: 3,
      beds: 3,
      bathrooms: 3,
      pricePerNight: 1800,
      cleaningFee: 200,
      serviceFee: 180,
      amenities: JSON.stringify(['wifi', 'parking', 'ac', 'kitchen', 'washer', 'tv', 'elevator', 'gym', 'concierge', 'jacuzzi']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
        'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800'
      ]),
      coverPhoto: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      status: 'PUBLISHED' as any,
      isActive: true,
      ownerType: 'INDIVIDUAL' as any
    },
    {
      ownerId: hosts[1].id,
      title: 'Traditional Qatari House in Old Doha',
      description: 'Authentic renovated Qatari house with traditional architecture. Experience local culture while enjoying modern comforts. Near cultural attractions.',
      propertyType: 'HOUSE' as any,
      roomType: 'ENTIRE_PLACE' as any,
      country: 'Qatar',
      city: 'Doha',
      state: 'Old Doha',
      address: 'Abdullah Bin Jassim Street',
      zipCode: '00000',
      latitude: 25.2867,
      longitude: 51.5328,
      guests: 6,
      bedrooms: 3,
      beds: 4,
      bathrooms: 2,
      pricePerNight: 650,
      cleaningFee: 80,
      serviceFee: 65,
      amenities: JSON.stringify(['wifi', 'ac', 'kitchen', 'parking', 'courtyard', 'traditional_decor']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800'
      ]),
      coverPhoto: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
      status: 'PUBLISHED' as any,
      isActive: true,
      ownerType: 'INDIVIDUAL' as any
    }
  ]

  const properties = []
  for (const propertyData of propertiesData) {
    const existing = await prisma.property.findFirst({
      where: {
        title: propertyData.title,
        ownerId: propertyData.ownerId
      }
    })

    if (!existing) {
      const property = await prisma.property.create({
        data: propertyData
      })
      properties.push(property)
      console.log(`✅ Created property: ${property.title}`)
    } else {
      properties.push(existing)
      console.log(`✅ Found existing property: ${existing.title}`)
    }
  }

  // ============================================================================
  // 3. CREATE REVIEWS (for property ratings)
  // ============================================================================

  console.log('\n⭐ Creating reviews...')

  const reviewsData = [
    {
      propertyId: properties[0].id,
      userId: guestUser.id,
      overallRating: 5.0,
      cleanlinessRating: 5.0,
      accuracyRating: 5.0,
      checkInRating: 5.0,
      communicationRating: 5.0,
      locationRating: 5.0,
      valueRating: 4.5,
      comment: 'Absolutely stunning villa! The beach access and pool were incredible. Host was very responsive and helpful.'
    },
    {
      propertyId: properties[1].id,
      userId: guestUser.id,
      overallRating: 4.5,
      cleanlinessRating: 5.0,
      accuracyRating: 4.5,
      checkInRating: 4.0,
      communicationRating: 4.5,
      locationRating: 5.0,
      valueRating: 4.5,
      comment: 'Great location in West Bay. Apartment was clean and well-maintained. Would definitely stay again.'
    },
    {
      propertyId: properties[2].id,
      userId: guestUser.id,
      overallRating: 4.0,
      cleanlinessRating: 4.5,
      accuracyRating: 4.0,
      checkInRating: 4.0,
      communicationRating: 4.0,
      locationRating: 5.0,
      valueRating: 4.5,
      comment: 'Perfect location near Souq Waqif. Cozy studio with everything you need for a short stay.'
    }
  ]

  for (const reviewData of reviewsData) {
    const existing = await prisma.review.findFirst({
      where: {
        propertyId: reviewData.propertyId,
        userId: reviewData.userId
      }
    })

    if (!existing) {
      await prisma.review.create({ data: reviewData })
      console.log(`✅ Created review for property ${reviewData.propertyId}`)
    } else {
      console.log(`✅ Found existing review for property ${reviewData.propertyId}`)
    }
  }

  // ============================================================================
  // 4. CREATE BOOKINGS (for /api/bookings?role=guest&limit=50)
  // ============================================================================

  console.log('\n📅 Creating bookings...')

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const bookingsData = [
    {
      propertyId: properties[0].id,
      guestId: guestUser.id,
      hostId: properties[0].ownerId,
      checkIn: new Date('2024-12-15'),
      checkOut: new Date('2024-12-20'),
      numberOfNights: 5,
      guests: 4,
      adults: 2,
      children: 2,
      infants: 0,
      nightlyRate: 2500,
      subtotal: 12500,
      cleaningFee: 300,
      serviceFee: 1250,
      taxAmount: 1650,
      totalPrice: 15700,
      platformCommission: 1570,
      hostEarnings: 14130,
      status: 'CONFIRMED' as any,
      paymentStatus: 'PAID' as any,
      paymentMethod: 'Visa ****4242',
      specialRequests: 'Early check-in if possible',
      confirmedAt: new Date('2024-11-20')
    },
    {
      propertyId: properties[1].id,
      guestId: guestUser.id,
      hostId: properties[1].ownerId,
      checkIn: new Date('2025-01-10'),
      checkOut: new Date('2025-01-15'),
      numberOfNights: 5,
      guests: 2,
      adults: 2,
      children: 0,
      infants: 0,
      nightlyRate: 800,
      subtotal: 4000,
      cleaningFee: 100,
      serviceFee: 400,
      taxAmount: 528,
      totalPrice: 5028,
      platformCommission: 502.8,
      hostEarnings: 4525.2,
      status: 'PENDING' as any,
      paymentStatus: 'PENDING' as any,
      paymentMethod: null,
      specialRequests: null
    },
    {
      propertyId: properties[3].id,
      guestId: guestUser.id,
      hostId: properties[3].ownerId,
      checkIn: new Date('2024-10-01'),
      checkOut: new Date('2024-10-07'),
      numberOfNights: 6,
      guests: 6,
      adults: 4,
      children: 2,
      infants: 0,
      nightlyRate: 1200,
      subtotal: 7200,
      cleaningFee: 150,
      serviceFee: 720,
      taxAmount: 950.4,
      totalPrice: 9020.4,
      platformCommission: 902.04,
      hostEarnings: 8118.36,
      status: 'COMPLETED' as any,
      paymentStatus: 'PAID' as any,
      paymentMethod: 'Mastercard ****5678',
      completedAt: new Date('2024-10-07')
    }
  ]

  for (const bookingData of bookingsData) {
    const existing = await prisma.booking.findFirst({
      where: {
        propertyId: bookingData.propertyId,
        guestId: bookingData.guestId,
        checkIn: bookingData.checkIn
      }
    })

    if (!existing) {
      await prisma.booking.create({ data: bookingData })
      console.log(`✅ Created booking for ${bookingData.checkIn.toDateString()}`)
    } else {
      console.log(`✅ Found existing booking for ${bookingData.checkIn.toDateString()}`)
    }
  }

  // ============================================================================
  // 5. CREATE PAYMENT METHODS (for /api/payments)
  // ============================================================================

  console.log('\n💳 Creating payment methods...')

  const paymentMethodsData = [
    {
      userId: guestUser.id,
      brand: 'Visa',
      last4: '4242',
      expiry: '12/2026',
      isDefault: true
    },
    {
      userId: guestUser.id,
      brand: 'Mastercard',
      last4: '5678',
      expiry: '09/2025',
      isDefault: false
    }
  ]

  for (const pmData of paymentMethodsData) {
    const existing = await prisma.paymentMethod.findFirst({
      where: {
        userId: pmData.userId,
        last4: pmData.last4
      }
    })

    if (!existing) {
      await prisma.paymentMethod.create({ data: pmData })
      console.log(`✅ Created payment method: ${pmData.brand} ****${pmData.last4}`)
    } else {
      console.log(`✅ Found existing payment method: ${pmData.brand} ****${pmData.last4}`)
    }
  }

  // ============================================================================
  // 6. CREATE TRANSACTIONS (for /api/payments)
  // ============================================================================

  console.log('\n💰 Creating transactions...')

  const transactionsData = [
    {
      userId: guestUser.id,
      description: 'Payment for Luxury Beachfront Villa in Pearl Qatar',
      amount: 15700,
      status: 'PAID' as any,
      type: 'PAYMENT' as any,
      paymentMethod: 'Visa ****4242',
      date: new Date('2024-11-20')
    },
    {
      userId: guestUser.id,
      description: 'Payment for Spacious Family Villa in Al Waab',
      amount: 9020.4,
      status: 'PAID' as any,
      type: 'PAYMENT' as any,
      paymentMethod: 'Mastercard ****5678',
      date: new Date('2024-09-15')
    },
    {
      userId: guestUser.id,
      description: 'Pending payment for Modern Apartment in West Bay',
      amount: 5028,
      status: 'PENDING' as any,
      type: 'PAYMENT' as any,
      paymentMethod: 'Visa ****4242',
      date: new Date()
    }
  ]

  for (const txData of transactionsData) {
    const existing = await prisma.transaction.findFirst({
      where: {
        userId: txData.userId,
        description: txData.description,
        amount: txData.amount
      }
    })

    if (!existing) {
      await prisma.transaction.create({ data: txData })
      console.log(`✅ Created transaction: ${txData.description.substring(0, 50)}...`)
    } else {
      console.log(`✅ Found existing transaction: ${txData.description.substring(0, 50)}...`)
    }
  }

  // ============================================================================
  // 7. CREATE PROPERTY KYC DATA (for host console)
  // ============================================================================

  console.log('\n📋 Creating property KYC records...')

  const kycData = [
    {
      propertyId: properties[0].id,
      hostName: 'Fatima Al-Mansouri',
      hostIdType: 'QID',
      hostIdNumber: '28112345678',
      hostIdExpiry: new Date('2027-12-31'),
      hostDob: new Date('1985-05-15'),
      companyName: null,
      crNumber: null,
      verificationStatus: 'APPROVED' as any,
      verifiedAt: new Date('2024-11-01')
    },
    {
      propertyId: properties[1].id,
      hostName: 'Mohammed Al-Kuwari',
      hostIdType: 'QID',
      hostIdNumber: '28187654321',
      hostIdExpiry: new Date('2028-06-30'),
      hostDob: new Date('1982-08-22'),
      companyName: null,
      crNumber: null,
      verificationStatus: 'APPROVED' as any,
      verifiedAt: new Date('2024-10-15')
    },
    {
      propertyId: properties[2].id,
      hostName: 'Fatima Al-Mansouri',
      hostIdType: 'QID',
      hostIdNumber: '28112345678',
      hostIdExpiry: new Date('2027-12-31'),
      hostDob: new Date('1985-05-15'),
      companyName: null,
      crNumber: null,
      verificationStatus: 'APPROVED' as any,
      verifiedAt: new Date('2024-11-05')
    },
    {
      propertyId: properties[3].id,
      hostName: 'Mohammed Al-Kuwari',
      hostIdType: 'QID',
      hostIdNumber: '28187654321',
      hostIdExpiry: new Date('2028-06-30'),
      hostDob: new Date('1982-08-22'),
      companyName: null,
      crNumber: null,
      verificationStatus: 'IN_REVIEW' as any,
      verifiedAt: null
    }
  ]

  for (const kycItem of kycData) {
    const existing = await prisma.propertyKYC.findUnique({
      where: { propertyId: kycItem.propertyId }
    })

    if (!existing) {
      await prisma.propertyKYC.create({ data: kycItem })
      console.log(`✅ Created KYC record for property ${kycItem.propertyId}`)
    } else {
      console.log(`✅ Found existing KYC record for property ${kycItem.propertyId}`)
    }
  }

  // ============================================================================
  // 8. CREATE PAYOUTS (for host earnings)
  // ============================================================================

  console.log('\n💵 Creating payouts for hosts...')

  const payoutsData = [
    {
      hostId: hosts[0].id,
      amount: 14130.00,
      currency: 'QAR',
      status: 'PAID' as any,
      method: 'Bank Transfer',
      scheduledDate: new Date('2024-11-25'),
      paidDate: new Date('2024-11-26'),
      periodStart: new Date('2024-11-01'),
      periodEnd: new Date('2024-11-30'),
      bookingIds: [],
      metadata: JSON.stringify({ note: 'November earnings' })
    },
    {
      hostId: hosts[0].id,
      amount: 22000.00,
      currency: 'QAR',
      status: 'SCHEDULED' as any,
      method: 'Bank Transfer',
      scheduledDate: new Date('2024-12-27'),
      paidDate: null,
      periodStart: new Date('2024-12-01'),
      periodEnd: new Date('2024-12-31'),
      bookingIds: [],
      metadata: JSON.stringify({ note: 'December earnings (pending)' })
    },
    {
      hostId: hosts[1].id,
      amount: 8118.36,
      currency: 'QAR',
      status: 'PAID' as any,
      method: 'Bank Transfer',
      scheduledDate: new Date('2024-10-25'),
      paidDate: new Date('2024-10-26'),
      periodStart: new Date('2024-10-01'),
      periodEnd: new Date('2024-10-31'),
      bookingIds: [],
      metadata: JSON.stringify({ note: 'October earnings' })
    },
    {
      hostId: hosts[1].id,
      amount: 4525.20,
      currency: 'QAR',
      status: 'SCHEDULED' as any,
      method: 'Bank Transfer',
      scheduledDate: new Date('2025-01-27'),
      paidDate: null,
      periodStart: new Date('2025-01-01'),
      periodEnd: new Date('2025-01-31'),
      bookingIds: [],
      metadata: JSON.stringify({ note: 'January earnings (scheduled)' })
    }
  ]

  for (const payoutData of payoutsData) {
    const existing = await prisma.payout.findFirst({
      where: {
        hostId: payoutData.hostId,
        scheduledDate: payoutData.scheduledDate,
        amount: payoutData.amount
      }
    })

    if (!existing) {
      await prisma.payout.create({ data: payoutData })
      console.log(`✅ Created payout: ${payoutData.amount} QAR (${payoutData.status})`)
    } else {
      console.log(`✅ Found existing payout: ${payoutData.amount} QAR`)
    }
  }

  console.log('\n✨ Dashboard seed completed!')
  console.log('\n📋 Summary:')
  console.log(`   Test Guest: ${guestUser.email} (password: Test123!)`)
  console.log(`   Test Hosts: ${hosts.length}`)
  console.log(`   Properties: ${properties.length} published`)
  console.log(`   KYC Records: ${kycData.length}`)
  console.log(`   Bookings: ${bookingsData.length} for test guest`)
  console.log(`   Transactions: ${transactionsData.length}`)
  console.log(`   Payment Methods: ${paymentMethodsData.length}`)
  console.log(`   Payouts: ${payoutsData.length}`)
  console.log('\n🔗 Test the APIs:')
  console.log(`   GET /api/properties?limit=6`)
  console.log(`   GET /api/bookings?role=guest&limit=50 (with auth)`)
  console.log(`   GET /api/bookings?role=host (with auth)`)
  console.log(`   GET /api/payments (with auth)`)
  console.log(`   GET /api/earnings (with auth)`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
