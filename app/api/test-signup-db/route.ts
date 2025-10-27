import { NextRequest, NextResponse } from 'next/server';

/**
 * Test Signup Flow with Real Neon Database
 * This API tests the complete signup flow storing data in Neon PostgreSQL
 */

export async function POST(request: NextRequest) {
  try {
    const {
      method,
      phoneNumber,
      email,
      password,
      firstName,
      lastName,
      idNumber,
      idCopy
    } = await request.json();

    console.log('🔐 Testing Signup with Real Database:', {
      method,
      hasPhone: !!phoneNumber,
      hasEmail: !!email,
      hasPassword: !!password,
      hasKYC: !!firstName && !!lastName
    });

    const { Client } = await import('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('✅ Connected to Neon database');

    // Create Users table if not exists
    const createTableQuery = `
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
    `;

    await client.query(createTableQuery);
    console.log('✅ Users table ready');

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = password ? await bcrypt.hash(password, 10) : '';

    // Insert user
    const insertQuery = `
      INSERT INTO users (
        first_name,
        last_name,
        email,
        phone_number,
        password_hash,
        email_verified_at,
        phone_verified_at,
        id_verified_at,
        id_number,
        id_copy_url,
        is_host,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING
        id,
        first_name,
        last_name,
        email,
        phone_number,
        email_verified_at,
        phone_verified_at,
        id_verified_at,
        id_number,
        is_host,
        created_at
    `;

    const values = [
      firstName || '',
      lastName || '',
      method === 'email' ? email : null,
      method === 'phone' ? phoneNumber : null,
      hashedPassword,
      method === 'email' ? new Date() : null,  // email_verified_at
      method === 'phone' ? new Date() : null,  // phone_verified_at
      (firstName && lastName && idNumber) ? new Date() : null,  // id_verified_at
      idNumber || null,
      idCopy || null,
      true,  // is_host (dual role)
      true   // is_active
    ];

    const result = await client.query(insertQuery, values);
    const user = result.rows[0];

    console.log('✅ User created in database:', user.id);

    await client.end();

    return NextResponse.json({
      success: true,
      message: 'User created successfully in Neon database!',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number,
        emailVerified: !!user.email_verified_at,
        phoneVerified: !!user.phone_verified_at,
        idVerified: !!user.id_verified_at,
        kycCompleted: !!user.id_number,
        isHost: user.is_host,
        createdAt: user.created_at
      }
    });

  } catch (error: any) {
    console.error('❌ Signup test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint to view all test users
export async function GET(request: NextRequest) {
  try {
    const { Client } = await import('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    const result = await client.query(`
      SELECT
        id,
        first_name,
        last_name,
        email,
        phone_number,
        email_verified_at,
        phone_verified_at,
        id_verified_at,
        id_number,
        is_host,
        is_active,
        created_at
      FROM users
      WHERE is_deleted = false
      ORDER BY created_at DESC
      LIMIT 20
    `);

    await client.end();

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      users: result.rows.map(user => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone_number,
        emailVerified: !!user.email_verified_at,
        phoneVerified: !!user.phone_verified_at,
        idVerified: !!user.id_verified_at,
        kycCompleted: !!user.id_number,
        isHost: user.is_host,
        isActive: user.is_active,
        createdAt: user.created_at
      }))
    });

  } catch (error: any) {
    console.error('❌ Get users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
