/**
 * Database Client for Neon PostgreSQL
 * Replaces the mock Prisma client with real database operations
 */

import { Client, Pool } from 'pg';

// Connection pool for better performance
let pool: Pool | null = null;

/**
 * Get or create database connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

/**
 * Get a new database client (for one-off queries)
 */
export async function getClient(): Promise<Client> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  return client;
}

/**
 * Initialize database tables
 */
export async function initializeTables() {
  const client = await getClient();

  try {
    // Create Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255) UNIQUE,
        phone_number VARCHAR(20) UNIQUE,
        password_hash TEXT,
        google_id VARCHAR(255),

        -- Profile
        avatar VARCHAR(500),
        date_of_birth DATE,
        bio VARCHAR(1000),
        languages TEXT[],

        -- Verification
        email_verified_at TIMESTAMP,
        phone_verified_at TIMESTAMP,
        id_verified_at TIMESTAMP,
        last_login_at TIMESTAMP,

        -- KYC
        id_number VARCHAR(50),
        id_copy_url VARCHAR(500),

        -- Host
        is_host BOOLEAN DEFAULT false,
        is_superhost BOOLEAN DEFAULT false,
        host_since TIMESTAMP,
        response_rate DECIMAL(5,2) DEFAULT 0,
        response_time INTEGER DEFAULT 0,

        -- Statistics
        total_bookings INTEGER DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        average_rating DECIMAL(3,2) DEFAULT 0,

        -- Loyalty
        travel_points INTEGER DEFAULT 0,
        loyalty_tier INTEGER DEFAULT 0,

        -- Status
        is_active BOOLEAN DEFAULT true,

        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        is_deleted BOOLEAN DEFAULT false
      )
    `);

    // Create index on phone_number for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
    `);

    // Create index on email for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Create index on google_id for OAuth
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    `);

    // Create Properties table
    await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        -- Basic Info
        title VARCHAR(255) NOT NULL,
        description TEXT,
        property_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',

        -- Location
        street_address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        zip_code VARCHAR(20),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),

        -- Property Details
        bedrooms INTEGER DEFAULT 0,
        bathrooms DECIMAL(3,1) DEFAULT 0,
        max_guests INTEGER DEFAULT 1,

        -- Pricing
        base_price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        cleaning_fee DECIMAL(10,2) DEFAULT 0,
        service_fee DECIMAL(10,2) DEFAULT 0,
        weekly_discount DECIMAL(5,2) DEFAULT 0,
        monthly_discount DECIMAL(5,2) DEFAULT 0,
        minimum_nights INTEGER DEFAULT 1,
        maximum_nights INTEGER DEFAULT 365,

        -- Rules
        check_in_time VARCHAR(10) DEFAULT '15:00',
        check_out_time VARCHAR(10) DEFAULT '11:00',
        allow_pets BOOLEAN DEFAULT false,
        allow_smoking BOOLEAN DEFAULT false,
        allow_parties BOOLEAN DEFAULT false,
        quiet_hours_start VARCHAR(10) DEFAULT '22:00',
        quiet_hours_end VARCHAR(10) DEFAULT '08:00',

        -- Availability
        minimum_advance_notice INTEGER DEFAULT 1,
        preparation_time INTEGER DEFAULT 1,

        -- Statistics
        total_bookings INTEGER DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        average_rating DECIMAL(3,2) DEFAULT 0,
        total_earnings DECIMAL(12,2) DEFAULT 0,
        views_count INTEGER DEFAULT 0,

        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT false
      )
    `);

    // Create Property Photos table
    await client.query(`
      CREATE TABLE IF NOT EXISTS property_photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        url VARCHAR(500) NOT NULL,
        caption VARCHAR(255),
        is_main BOOLEAN DEFAULT false,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Property Amenities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS property_amenities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        amenity_name VARCHAR(100) NOT NULL,
        amenity_category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for properties
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_properties_host_id ON properties(host_id);
      CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
      CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
      CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
      CREATE INDEX IF NOT EXISTS idx_property_photos_property_id ON property_photos(property_id);
      CREATE INDEX IF NOT EXISTS idx_property_amenities_property_id ON property_amenities(property_id);
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Error initializing tables:', error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Database operations for Users
 */
export const db = {
  user: {
    /**
     * Find user by email
     */
    async findByEmail(email: string) {
      const pool = getPool();
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND is_deleted = false',
        [email]
      );
      return result.rows[0] || null;
    },

    /**
     * Find user by phone number
     */
    async findByPhone(phoneNumber: string) {
      const pool = getPool();
      const result = await pool.query(
        'SELECT * FROM users WHERE phone_number = $1 AND is_deleted = false',
        [phoneNumber]
      );
      return result.rows[0] || null;
    },

    /**
     * Find user by Google ID
     */
    async findByGoogleId(googleId: string) {
      const pool = getPool();
      const result = await pool.query(
        'SELECT * FROM users WHERE google_id = $1 AND is_deleted = false',
        [googleId]
      );
      return result.rows[0] || null;
    },

    /**
     * Find user by ID
     */
    async findById(id: string) {
      const pool = getPool();
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1 AND is_deleted = false',
        [id]
      );
      return result.rows[0] || null;
    },

    /**
     * Create new user
     */
    async create(data: {
      email?: string;
      phoneNumber?: string;
      passwordHash?: string;
      googleId?: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
      emailVerifiedAt?: Date | null;
      phoneVerifiedAt?: Date | null;
      idVerifiedAt?: Date | null;
      idNumber?: string;
      idCopyUrl?: string;
      isHost?: boolean;
      isActive?: boolean;
    }) {
      const pool = getPool();
      const result = await pool.query(
        `INSERT INTO users (
          email,
          phone_number,
          password_hash,
          google_id,
          first_name,
          last_name,
          avatar,
          email_verified_at,
          phone_verified_at,
          id_verified_at,
          id_number,
          id_copy_url,
          is_host,
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          data.email || null,
          data.phoneNumber || null,
          data.passwordHash || null,
          data.googleId || null,
          data.firstName || null,
          data.lastName || null,
          data.avatar || null,
          data.emailVerifiedAt || null,
          data.phoneVerifiedAt || null,
          data.idVerifiedAt || null,
          data.idNumber || null,
          data.idCopyUrl || null,
          data.isHost !== undefined ? data.isHost : false,
          data.isActive !== undefined ? data.isActive : true
        ]
      );
      return result.rows[0];
    },

    /**
     * Update user
     */
    async update(id: string, data: Partial<{
      email: string;
      phoneNumber: string;
      passwordHash: string;
      firstName: string;
      lastName: string;
      avatar: string;
      dateOfBirth: Date;
      bio: string;
      languages: string[];
      emailVerifiedAt: Date;
      phoneVerifiedAt: Date;
      idVerifiedAt: Date;
      lastLoginAt: Date;
      idNumber: string;
      idCopyUrl: string;
      isHost: boolean;
      isSuperhost: boolean;
      hostSince: Date;
      responseRate: number;
      responseTime: number;
      totalBookings: number;
      totalReviews: number;
      averageRating: number;
      travelPoints: number;
      loyaltyTier: number;
      isActive: boolean;
    }>) {
      const pool = getPool();

      // Build dynamic UPDATE query
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data.email !== undefined) {
        fields.push(`email = $${paramCount++}`);
        values.push(data.email);
      }
      if (data.phoneNumber !== undefined) {
        fields.push(`phone_number = $${paramCount++}`);
        values.push(data.phoneNumber);
      }
      if (data.passwordHash !== undefined) {
        fields.push(`password_hash = $${paramCount++}`);
        values.push(data.passwordHash);
      }
      if (data.firstName !== undefined) {
        fields.push(`first_name = $${paramCount++}`);
        values.push(data.firstName);
      }
      if (data.lastName !== undefined) {
        fields.push(`last_name = $${paramCount++}`);
        values.push(data.lastName);
      }
      if (data.avatar !== undefined) {
        fields.push(`avatar = $${paramCount++}`);
        values.push(data.avatar);
      }
      if (data.dateOfBirth !== undefined) {
        fields.push(`date_of_birth = $${paramCount++}`);
        values.push(data.dateOfBirth);
      }
      if (data.bio !== undefined) {
        fields.push(`bio = $${paramCount++}`);
        values.push(data.bio);
      }
      if (data.languages !== undefined) {
        fields.push(`languages = $${paramCount++}`);
        values.push(data.languages);
      }
      if (data.emailVerifiedAt !== undefined) {
        fields.push(`email_verified_at = $${paramCount++}`);
        values.push(data.emailVerifiedAt);
      }
      if (data.phoneVerifiedAt !== undefined) {
        fields.push(`phone_verified_at = $${paramCount++}`);
        values.push(data.phoneVerifiedAt);
      }
      if (data.idVerifiedAt !== undefined) {
        fields.push(`id_verified_at = $${paramCount++}`);
        values.push(data.idVerifiedAt);
      }
      if (data.lastLoginAt !== undefined) {
        fields.push(`last_login_at = $${paramCount++}`);
        values.push(data.lastLoginAt);
      }
      if (data.idNumber !== undefined) {
        fields.push(`id_number = $${paramCount++}`);
        values.push(data.idNumber);
      }
      if (data.idCopyUrl !== undefined) {
        fields.push(`id_copy_url = $${paramCount++}`);
        values.push(data.idCopyUrl);
      }
      if (data.isHost !== undefined) {
        fields.push(`is_host = $${paramCount++}`);
        values.push(data.isHost);
      }
      if (data.isSuperhost !== undefined) {
        fields.push(`is_superhost = $${paramCount++}`);
        values.push(data.isSuperhost);
      }
      if (data.hostSince !== undefined) {
        fields.push(`host_since = $${paramCount++}`);
        values.push(data.hostSince);
      }
      if (data.responseRate !== undefined) {
        fields.push(`response_rate = $${paramCount++}`);
        values.push(data.responseRate);
      }
      if (data.responseTime !== undefined) {
        fields.push(`response_time = $${paramCount++}`);
        values.push(data.responseTime);
      }
      if (data.totalBookings !== undefined) {
        fields.push(`total_bookings = $${paramCount++}`);
        values.push(data.totalBookings);
      }
      if (data.totalReviews !== undefined) {
        fields.push(`total_reviews = $${paramCount++}`);
        values.push(data.totalReviews);
      }
      if (data.averageRating !== undefined) {
        fields.push(`average_rating = $${paramCount++}`);
        values.push(data.averageRating);
      }
      if (data.travelPoints !== undefined) {
        fields.push(`travel_points = $${paramCount++}`);
        values.push(data.travelPoints);
      }
      if (data.loyaltyTier !== undefined) {
        fields.push(`loyalty_tier = $${paramCount++}`);
        values.push(data.loyaltyTier);
      }
      if (data.isActive !== undefined) {
        fields.push(`is_active = $${paramCount++}`);
        values.push(data.isActive);
      }

      // Always update updated_at
      fields.push(`updated_at = $${paramCount++}`);
      values.push(new Date());

      // Add ID to values
      values.push(id);

      const query = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${paramCount} AND is_deleted = false
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return result.rows[0] || null;
    },

    /**
     * Delete user (soft delete)
     */
    async delete(id: string) {
      const pool = getPool();
      const result = await pool.query(
        `UPDATE users SET is_deleted = true, updated_at = $1 WHERE id = $2 RETURNING *`,
        [new Date(), id]
      );
      return result.rows[0] || null;
    },

    /**
     * Find all users
     */
    async findAll(limit: number = 50, offset: number = 0) {
      const pool = getPool();
      const result = await pool.query(
        `SELECT * FROM users WHERE is_deleted = false ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    }
  },

  property: {
    /**
     * Create new property
     */
    async create(data: {
      hostId: string;
      title: string;
      description?: string;
      propertyType: string;
      status?: string;
      streetAddress?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
      latitude?: number;
      longitude?: number;
      bedrooms?: number;
      bathrooms?: number;
      maxGuests?: number;
      basePrice: number;
      currency?: string;
      cleaningFee?: number;
      serviceFee?: number;
      weeklyDiscount?: number;
      monthlyDiscount?: number;
      minimumNights?: number;
      maximumNights?: number;
      checkInTime?: string;
      checkOutTime?: string;
      allowPets?: boolean;
      allowSmoking?: boolean;
      allowParties?: boolean;
      quietHoursStart?: string;
      quietHoursEnd?: string;
      minimumAdvanceNotice?: number;
      preparationTime?: number;
    }) {
      const pool = getPool();
      const result = await pool.query(
        `INSERT INTO properties (
          host_id, title, description, property_type, status,
          street_address, city, state, country, zip_code,
          latitude, longitude, bedrooms, bathrooms, max_guests,
          base_price, currency, cleaning_fee, service_fee,
          weekly_discount, monthly_discount, minimum_nights, maximum_nights,
          check_in_time, check_out_time, allow_pets, allow_smoking, allow_parties,
          quiet_hours_start, quiet_hours_end, minimum_advance_notice, preparation_time
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, $26, $27, $28,
          $29, $30, $31, $32
        ) RETURNING *`,
        [
          data.hostId,
          data.title,
          data.description || null,
          data.propertyType,
          data.status || 'draft',
          data.streetAddress || null,
          data.city || null,
          data.state || null,
          data.country || null,
          data.zipCode || null,
          data.latitude || null,
          data.longitude || null,
          data.bedrooms || 0,
          data.bathrooms || 0,
          data.maxGuests || 1,
          data.basePrice,
          data.currency || 'USD',
          data.cleaningFee || 0,
          data.serviceFee || 0,
          data.weeklyDiscount || 0,
          data.monthlyDiscount || 0,
          data.minimumNights || 1,
          data.maximumNights || 365,
          data.checkInTime || '15:00',
          data.checkOutTime || '11:00',
          data.allowPets || false,
          data.allowSmoking || false,
          data.allowParties || false,
          data.quietHoursStart || '22:00',
          data.quietHoursEnd || '08:00',
          data.minimumAdvanceNotice || 1,
          data.preparationTime || 1
        ]
      );
      return result.rows[0];
    },

    /**
     * Find properties by host ID
     */
    async findByHostId(hostId: string) {
      const pool = getPool();
      const result = await pool.query(
        `SELECT p.*,
         array_agg(DISTINCT jsonb_build_object(
           'id', pp.id,
           'url', pp.url,
           'caption', pp.caption,
           'isMain', pp.is_main,
           'displayOrder', pp.display_order
         )) FILTER (WHERE pp.id IS NOT NULL) as photos,
         array_agg(DISTINCT pa.amenity_name) FILTER (WHERE pa.amenity_name IS NOT NULL) as amenities
         FROM properties p
         LEFT JOIN property_photos pp ON p.id = pp.property_id
         LEFT JOIN property_amenities pa ON p.id = pa.property_id
         WHERE p.host_id = $1 AND p.is_deleted = false
         GROUP BY p.id
         ORDER BY p.created_at DESC`,
        [hostId]
      );
      return result.rows;
    },

    /**
     * Find property by ID
     */
    async findById(id: string) {
      const pool = getPool();
      const result = await pool.query(
        `SELECT p.*,
         array_agg(DISTINCT jsonb_build_object(
           'id', pp.id,
           'url', pp.url,
           'caption', pp.caption,
           'isMain', pp.is_main,
           'displayOrder', pp.display_order
         )) FILTER (WHERE pp.id IS NOT NULL) as photos,
         array_agg(DISTINCT pa.amenity_name) FILTER (WHERE pa.amenity_name IS NOT NULL) as amenities
         FROM properties p
         LEFT JOIN property_photos pp ON p.id = pp.property_id
         LEFT JOIN property_amenities pa ON p.id = pa.property_id
         WHERE p.id = $1 AND p.is_deleted = false
         GROUP BY p.id`,
        [id]
      );
      return result.rows[0] || null;
    },

    /**
     * Update property
     */
    async update(id: string, data: any) {
      const pool = getPool();

      // Build dynamic UPDATE query
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
          // Convert camelCase to snake_case for database
          const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          fields.push(`${dbKey} = $${paramCount++}`);
          values.push(data[key]);
        }
      });

      // Always update updated_at
      fields.push(`updated_at = $${paramCount++}`);
      values.push(new Date());

      // Add ID to values
      values.push(id);

      const query = `
        UPDATE properties
        SET ${fields.join(', ')}
        WHERE id = $${paramCount} AND is_deleted = false
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return result.rows[0] || null;
    },

    /**
     * Delete property (soft delete)
     */
    async delete(id: string) {
      const pool = getPool();
      const result = await pool.query(
        `UPDATE properties SET is_deleted = true, updated_at = $1 WHERE id = $2 RETURNING *`,
        [new Date(), id]
      );
      return result.rows[0] || null;
    },

    /**
     * Add photo to property
     */
    async addPhoto(propertyId: string, url: string, caption?: string, isMain: boolean = false, displayOrder: number = 0) {
      const pool = getPool();
      const result = await pool.query(
        `INSERT INTO property_photos (property_id, url, caption, is_main, display_order)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [propertyId, url, caption || null, isMain, displayOrder]
      );
      return result.rows[0];
    },

    /**
     * Add amenity to property
     */
    async addAmenity(propertyId: string, amenityName: string, amenityCategory?: string) {
      const pool = getPool();
      const result = await pool.query(
        `INSERT INTO property_amenities (property_id, amenity_name, amenity_category)
         VALUES ($1, $2, $3) RETURNING *`,
        [propertyId, amenityName, amenityCategory || null]
      );
      return result.rows[0];
    },

    /**
     * Remove all amenities for a property (for bulk update)
     */
    async removeAllAmenities(propertyId: string) {
      const pool = getPool();
      await pool.query(
        `DELETE FROM property_amenities WHERE property_id = $1`,
        [propertyId]
      );
    }
  }
};

// DO NOT initialize tables - Prisma handles schema management
// Tables are created via: npx prisma db push
// if (process.env.DATABASE_URL) {
//   initializeTables().catch(console.error);
// }
