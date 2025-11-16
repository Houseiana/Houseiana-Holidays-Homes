-- ================================================
-- Houseiana Properties Schema Extension
-- ================================================
-- Description: Properties, bookings, and accommodation management schema
-- Author: Generated for Houseiana Platform
-- Date: 2025-10-27
-- Database: PostgreSQL
-- ================================================

-- ================================================
-- CREATE ADDITIONAL ENUMS
-- ================================================

-- Property types
CREATE TYPE "PropertyType" AS ENUM (
    'APARTMENT', 'HOUSE', 'VILLA', 'CONDO', 'STUDIO',
    'LOFT', 'TOWNHOUSE', 'PENTHOUSE', 'CABIN', 'COTTAGE'
);

-- Property status
CREATE TYPE "PropertyStatus" AS ENUM (
    'DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'INACTIVE',
    'SUSPENDED', 'ARCHIVED'
);

-- Booking status
CREATE TYPE "BookingStatus" AS ENUM (
    'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT',
    'CANCELLED', 'NO_SHOW', 'REFUNDED'
);

-- Payment status
CREATE TYPE "PaymentStatus" AS ENUM (
    'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED',
    'REFUNDED', 'PARTIALLY_REFUNDED'
);

-- Review status
CREATE TYPE "ReviewStatus" AS ENUM (
    'PENDING', 'APPROVED', 'REJECTED', 'HIDDEN'
);

-- Amenity categories
CREATE TYPE "AmenityCategory" AS ENUM (
    'BASIC', 'KITCHEN', 'ENTERTAINMENT', 'OUTDOOR',
    'WELLNESS', 'SAFETY', 'ACCESSIBILITY', 'BUSINESS'
);

-- ================================================
-- CREATE PROPERTIES TABLES
-- ================================================

-- Properties table - Core property information
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',

    -- Location
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postalCode" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),

    -- Capacity and rooms
    "maxGuests" INTEGER NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" DECIMAL(2,1) NOT NULL,
    "beds" INTEGER NOT NULL,

    -- Pricing
    "basePrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "cleaningFee" DECIMAL(10,2) DEFAULT 0,
    "securityDeposit" DECIMAL(10,2) DEFAULT 0,

    -- Rules and policies
    "checkInTime" TIME,
    "checkOutTime" TIME,
    "minimumStay" INTEGER DEFAULT 1,
    "maximumStay" INTEGER,
    "instantBooking" BOOLEAN DEFAULT false,
    "smokingAllowed" BOOLEAN DEFAULT false,
    "petsAllowed" BOOLEAN DEFAULT false,
    "partiesAllowed" BOOLEAN DEFAULT false,

    -- Metadata
    "featured" BOOLEAN DEFAULT false,
    "verified" BOOLEAN DEFAULT false,
    "listingDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- Property images
CREATE TABLE "property_images" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isMain" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("id")
);

-- Amenities master list
CREATE TABLE "amenities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "category" "AmenityCategory" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN DEFAULT true,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- Property amenities (many-to-many)
CREATE TABLE "property_amenities" (
    "propertyId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,

    CONSTRAINT "property_amenities_pkey" PRIMARY KEY ("propertyId", "amenityId")
);

-- Bookings table
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,

    -- Booking details
    "checkInDate" DATE NOT NULL,
    "checkOutDate" DATE NOT NULL,
    "nights" INTEGER NOT NULL,
    "guests" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',

    -- Pricing breakdown
    "baseAmount" DECIMAL(10,2) NOT NULL,
    "cleaningFee" DECIMAL(10,2) DEFAULT 0,
    "serviceFee" DECIMAL(10,2) DEFAULT 0,
    "taxes" DECIMAL(10,2) DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',

    -- Special requests and notes
    "guestNotes" TEXT,
    "hostNotes" TEXT,
    "specialRequests" TEXT,

    -- Check-in/out details
    "actualCheckIn" TIMESTAMP(3),
    "actualCheckOut" TIMESTAMP(3),
    "confirmationCode" TEXT UNIQUE,

    -- Cancellation
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "cancellationReason" TEXT,
    "refundAmount" DECIMAL(10,2),

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- Payments table
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    -- Payment details
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentMethod" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',

    -- External payment processor data
    "stripePaymentIntentId" TEXT,
    "paypalTransactionId" TEXT,
    "transactionId" TEXT,

    -- Refund information
    "refundedAmount" DECIMAL(10,2) DEFAULT 0,
    "refundReason" TEXT,
    "refundedAt" TIMESTAMP(3),

    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Reviews table
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL, -- 'GUEST_TO_HOST' or 'HOST_TO_GUEST'

    -- Rating (1-5 scale)
    "overallRating" INTEGER NOT NULL,
    "cleanlinessRating" INTEGER,
    "accuracyRating" INTEGER,
    "communicationRating" INTEGER,
    "locationRating" INTEGER,
    "checkInRating" INTEGER,
    "valueRating" INTEGER,

    -- Review content
    "title" TEXT,
    "comment" TEXT,
    "publicComment" TEXT,
    "privateComment" TEXT,

    -- Status and moderation
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedBy" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "moderationNotes" TEXT,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- Availability calendar
CREATE TABLE "property_availability" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "price" DECIMAL(10,2),
    "minimumStay" INTEGER,
    "notes" TEXT,

    CONSTRAINT "property_availability_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "property_availability_unique" UNIQUE ("propertyId", "date")
);

-- Blocked dates (maintenance, personal use, etc.)
CREATE TABLE "blocked_dates" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "reason" TEXT,
    "blockType" TEXT NOT NULL, -- 'MAINTENANCE', 'PERSONAL', 'BOOKED', 'OTHER'
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_dates_pkey" PRIMARY KEY ("id")
);

-- Messages between hosts and guests
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "propertyId" TEXT,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "messageType" TEXT DEFAULT 'GENERAL', -- 'BOOKING', 'INQUIRY', 'GENERAL', 'SUPPORT'
    "attachments" TEXT[], -- Array of file URLs
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- Favorites/Wishlist
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "listName" TEXT DEFAULT 'Wishlist',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "favorites_unique" UNIQUE ("userId", "propertyId")
);

-- ================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ================================================

-- Properties indexes
CREATE INDEX "properties_hostId_idx" ON "properties"("hostId");
CREATE INDEX "properties_status_idx" ON "properties"("status");
CREATE INDEX "properties_propertyType_idx" ON "properties"("propertyType");
CREATE INDEX "properties_city_idx" ON "properties"("city");
CREATE INDEX "properties_country_idx" ON "properties"("country");
CREATE INDEX "properties_location_idx" ON "properties"("latitude", "longitude");
CREATE INDEX "properties_price_idx" ON "properties"("basePrice");
CREATE INDEX "properties_featured_idx" ON "properties"("featured");
CREATE INDEX "properties_verified_idx" ON "properties"("verified");

-- Property images indexes
CREATE INDEX "property_images_propertyId_idx" ON "property_images"("propertyId");
CREATE INDEX "property_images_main_idx" ON "property_images"("isMain");

-- Bookings indexes
CREATE INDEX "bookings_propertyId_idx" ON "bookings"("propertyId");
CREATE INDEX "bookings_guestId_idx" ON "bookings"("guestId");
CREATE INDEX "bookings_hostId_idx" ON "bookings"("hostId");
CREATE INDEX "bookings_status_idx" ON "bookings"("status");
CREATE INDEX "bookings_dates_idx" ON "bookings"("checkInDate", "checkOutDate");
CREATE INDEX "bookings_confirmation_idx" ON "bookings"("confirmationCode");

-- Payments indexes
CREATE INDEX "payments_bookingId_idx" ON "payments"("bookingId");
CREATE INDEX "payments_userId_idx" ON "payments"("userId");
CREATE INDEX "payments_status_idx" ON "payments"("status");
CREATE INDEX "payments_stripe_idx" ON "payments"("stripePaymentIntentId");

-- Reviews indexes
CREATE INDEX "reviews_bookingId_idx" ON "reviews"("bookingId");
CREATE INDEX "reviews_propertyId_idx" ON "reviews"("propertyId");
CREATE INDEX "reviews_reviewerId_idx" ON "reviews"("reviewerId");
CREATE INDEX "reviews_status_idx" ON "reviews"("status");
CREATE INDEX "reviews_rating_idx" ON "reviews"("overallRating");

-- Availability indexes
CREATE INDEX "property_availability_propertyId_idx" ON "property_availability"("propertyId");
CREATE INDEX "property_availability_date_idx" ON "property_availability"("date");
CREATE INDEX "property_availability_available_idx" ON "property_availability"("available");

-- Messages indexes
CREATE INDEX "messages_bookingId_idx" ON "messages"("bookingId");
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");
CREATE INDEX "messages_recipientId_idx" ON "messages"("recipientId");
CREATE INDEX "messages_readAt_idx" ON "messages"("readAt");

-- Favorites indexes
CREATE INDEX "favorites_userId_idx" ON "favorites"("userId");
CREATE INDEX "favorites_propertyId_idx" ON "favorites"("propertyId");

-- ================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ================================================

-- Properties foreign keys
ALTER TABLE "properties" ADD CONSTRAINT "properties_hostId_fkey"
    FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Property images foreign keys
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Property amenities foreign keys
ALTER TABLE "property_amenities" ADD CONSTRAINT "property_amenities_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "property_amenities" ADD CONSTRAINT "property_amenities_amenityId_fkey"
    FOREIGN KEY ("amenityId") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Bookings foreign keys
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guestId_fkey"
    FOREIGN KEY ("guestId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_hostId_fkey"
    FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Payments foreign keys
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Reviews foreign keys
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewerId_fkey"
    FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_revieweeId_fkey"
    FOREIGN KEY ("revieweeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Property availability foreign keys
ALTER TABLE "property_availability" ADD CONSTRAINT "property_availability_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Blocked dates foreign keys
ALTER TABLE "blocked_dates" ADD CONSTRAINT "blocked_dates_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "blocked_dates" ADD CONSTRAINT "blocked_dates_createdBy_fkey"
    FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Messages foreign keys
ALTER TABLE "messages" ADD CONSTRAINT "messages_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey"
    FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_recipientId_fkey"
    FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Favorites foreign keys
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "favorites" ADD CONSTRAINT "favorites_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ================================================
-- INSERT DEFAULT AMENITIES
-- ================================================

INSERT INTO "amenities" ("id", "name", "icon", "category", "description") VALUES
-- Basic amenities
('wifi', 'WiFi', 'wifi', 'BASIC', 'Wireless internet connection'),
('ac', 'Air Conditioning', 'snowflake', 'BASIC', 'Climate control cooling'),
('heating', 'Heating', 'thermometer', 'BASIC', 'Climate control heating'),
('tv', 'Television', 'tv', 'ENTERTAINMENT', 'TV with cable/streaming'),
('washer', 'Washer', 'washing-machine', 'BASIC', 'Washing machine'),
('dryer', 'Dryer', 'shirt', 'BASIC', 'Clothes dryer'),

-- Kitchen amenities
('kitchen', 'Full Kitchen', 'chef-hat', 'KITCHEN', 'Complete kitchen facilities'),
('refrigerator', 'Refrigerator', 'refrigerator', 'KITCHEN', 'Full-size refrigerator'),
('microwave', 'Microwave', 'microwave', 'KITCHEN', 'Microwave oven'),
('dishwasher', 'Dishwasher', 'utensils', 'KITCHEN', 'Automatic dishwasher'),
('coffee_maker', 'Coffee Maker', 'coffee', 'KITCHEN', 'Coffee making facilities'),

-- Entertainment
('streaming', 'Streaming Services', 'play', 'ENTERTAINMENT', 'Netflix, Hulu, etc.'),
('games', 'Board Games', 'puzzle-piece', 'ENTERTAINMENT', 'Board games and puzzles'),
('books', 'Books', 'book', 'ENTERTAINMENT', 'Reading materials'),

-- Outdoor
('parking', 'Free Parking', 'car', 'OUTDOOR', 'Free parking on premises'),
('pool', 'Swimming Pool', 'swimming-pool', 'OUTDOOR', 'Swimming pool access'),
('hot_tub', 'Hot Tub', 'hot-tub', 'WELLNESS', 'Hot tub or jacuzzi'),
('garden', 'Garden', 'tree', 'OUTDOOR', 'Garden or outdoor space'),
('balcony', 'Balcony', 'balcony', 'OUTDOOR', 'Private balcony'),
('bbq', 'BBQ Grill', 'grill', 'OUTDOOR', 'Barbecue grill'),

-- Safety
('smoke_detector', 'Smoke Detector', 'shield-check', 'SAFETY', 'Smoke detection system'),
('carbon_detector', 'Carbon Monoxide Detector', 'shield-alert', 'SAFETY', 'CO detection system'),
('first_aid', 'First Aid Kit', 'first-aid', 'SAFETY', 'Basic first aid supplies'),
('fire_extinguisher', 'Fire Extinguisher', 'fire-extinguisher', 'SAFETY', 'Fire safety equipment'),

-- Accessibility
('wheelchair', 'Wheelchair Accessible', 'wheelchair', 'ACCESSIBILITY', 'Wheelchair accessible'),
('elevator', 'Elevator', 'elevator', 'ACCESSIBILITY', 'Elevator access'),

-- Business
('workspace', 'Dedicated Workspace', 'desk', 'BUSINESS', 'Desk and chair for working'),
('printer', 'Printer', 'printer', 'BUSINESS', 'Printer access');

-- ================================================
-- USEFUL VIEWS
-- ================================================

-- Property summary view with ratings
CREATE OR REPLACE VIEW "property_summary" AS
SELECT
    p."id",
    p."title",
    p."propertyType",
    p."status",
    p."city",
    p."country",
    p."maxGuests",
    p."bedrooms",
    p."bathrooms",
    p."basePrice",
    p."currency",
    p."featured",
    p."verified",
    u."firstName" as "hostFirstName",
    u."lastName" as "hostLastName",
    COUNT(DISTINCT r."id") as "reviewCount",
    ROUND(AVG(r."overallRating")::numeric, 2) as "averageRating",
    COUNT(DISTINCT b."id") as "totalBookings",
    COUNT(DISTINCT CASE WHEN b."status" = 'CONFIRMED' THEN b."id" END) as "confirmedBookings"
FROM "properties" p
LEFT JOIN "users" u ON p."hostId" = u."id"
LEFT JOIN "reviews" r ON p."id" = r."propertyId" AND r."status" = 'APPROVED'
LEFT JOIN "bookings" b ON p."id" = b."propertyId"
GROUP BY p."id", u."firstName", u."lastName";

-- Booking summary view
CREATE OR REPLACE VIEW "booking_summary" AS
SELECT
    b."id",
    b."confirmationCode",
    b."checkInDate",
    b."checkOutDate",
    b."nights",
    b."guests",
    b."status",
    b."totalAmount",
    b."currency",
    p."title" as "propertyTitle",
    p."city" as "propertyCity",
    host."firstName" as "hostFirstName",
    host."lastName" as "hostLastName",
    guest."firstName" as "guestFirstName",
    guest."lastName" as "guestLastName",
    pay."status" as "paymentStatus"
FROM "bookings" b
JOIN "properties" p ON b."propertyId" = p."id"
JOIN "users" host ON b."hostId" = host."id"
JOIN "users" guest ON b."guestId" = guest."id"
LEFT JOIN "payments" pay ON b."id" = pay."bookingId";

-- ================================================
-- UTILITY FUNCTIONS
-- ================================================

-- Function to calculate property availability
CREATE OR REPLACE FUNCTION check_property_availability(
    property_id TEXT,
    check_in DATE,
    check_out DATE
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if property exists and is active
    IF NOT EXISTS (
        SELECT 1 FROM "properties"
        WHERE "id" = property_id AND "status" = 'ACTIVE'
    ) THEN
        RETURN FALSE;
    END IF;

    -- Check for existing bookings
    IF EXISTS (
        SELECT 1 FROM "bookings"
        WHERE "propertyId" = property_id
        AND "status" IN ('CONFIRMED', 'CHECKED_IN')
        AND (
            (check_in >= "checkInDate" AND check_in < "checkOutDate") OR
            (check_out > "checkInDate" AND check_out <= "checkOutDate") OR
            (check_in <= "checkInDate" AND check_out >= "checkOutDate")
        )
    ) THEN
        RETURN FALSE;
    END IF;

    -- Check for blocked dates
    IF EXISTS (
        SELECT 1 FROM "blocked_dates"
        WHERE "propertyId" = property_id
        AND (
            (check_in >= "startDate" AND check_in <= "endDate") OR
            (check_out >= "startDate" AND check_out <= "endDate") OR
            (check_in <= "startDate" AND check_out >= "endDate")
        )
    ) THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate booking total
CREATE OR REPLACE FUNCTION calculate_booking_total(
    property_id TEXT,
    check_in DATE,
    check_out DATE,
    guests INTEGER
)
RETURNS TABLE(
    base_amount DECIMAL(10,2),
    cleaning_fee DECIMAL(10,2),
    service_fee DECIMAL(10,2),
    taxes DECIMAL(10,2),
    total_amount DECIMAL(10,2)
) AS $$
DECLARE
    nights INTEGER;
    base_price DECIMAL(10,2);
    property_cleaning_fee DECIMAL(10,2);
    calculated_service_fee DECIMAL(10,2);
    calculated_taxes DECIMAL(10,2);
BEGIN
    -- Calculate nights
    nights := check_out - check_in;

    -- Get property pricing
    SELECT p."basePrice", p."cleaningFee"
    INTO base_price, property_cleaning_fee
    FROM "properties" p
    WHERE p."id" = property_id;

    -- Calculate amounts
    base_amount := base_price * nights;
    cleaning_fee := COALESCE(property_cleaning_fee, 0);
    service_fee := ROUND((base_amount * 0.12)::numeric, 2); -- 12% service fee
    taxes := ROUND(((base_amount + cleaning_fee + service_fee) * 0.08)::numeric, 2); -- 8% tax
    total_amount := base_amount + cleaning_fee + service_fee + taxes;

    RETURN QUERY SELECT
        base_amount,
        cleaning_fee,
        service_fee,
        taxes,
        total_amount;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- COMMENTS ON TABLES
-- ================================================

COMMENT ON TABLE "properties" IS 'Property listings with details, pricing, and policies';
COMMENT ON TABLE "property_images" IS 'Images associated with properties';
COMMENT ON TABLE "amenities" IS 'Master list of available amenities';
COMMENT ON TABLE "property_amenities" IS 'Many-to-many relationship between properties and amenities';
COMMENT ON TABLE "bookings" IS 'Guest reservations and booking details';
COMMENT ON TABLE "payments" IS 'Payment transactions for bookings';
COMMENT ON TABLE "reviews" IS 'Guest and host reviews after completed stays';
COMMENT ON TABLE "property_availability" IS 'Daily availability and pricing calendar';
COMMENT ON TABLE "blocked_dates" IS 'Dates when properties are unavailable';
COMMENT ON TABLE "messages" IS 'Communication between hosts and guests';
COMMENT ON TABLE "favorites" IS 'User wishlist/favorites for properties';

-- ================================================
-- PROPERTIES SCHEMA COMPLETE
-- ================================================