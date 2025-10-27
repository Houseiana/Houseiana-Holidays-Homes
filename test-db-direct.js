// Direct database test script
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const DATABASE_URL = "postgresql://neondb_owner:npg_CL2brY4ZJHIE@ep-ancient-dew-a9me2kbl-pooler.gwc.azure.neon.tech/neondb?sslmode=require";

async function testSignup() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
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
    console.log('✅ Users table created/verified');

    // Test data
    const testUser = {
      method: 'phone',
      phoneNumber: '+97430424433',
      password: 'Test1234!',
      firstName: 'John',
      lastName: 'Doe',
      idNumber: 'QID123456789',
      idCopy: '/uploads/test-id.jpg'
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(testUser.password, 10);

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
      testUser.firstName,
      testUser.lastName,
      testUser.method === 'email' ? testUser.phoneNumber : null,
      testUser.method === 'phone' ? testUser.phoneNumber : null,
      hashedPassword,
      testUser.method === 'email' ? new Date() : null,  // email_verified_at
      testUser.method === 'phone' ? new Date() : null,  // phone_verified_at
      (testUser.firstName && testUser.lastName && testUser.idNumber) ? new Date() : null,  // id_verified_at
      testUser.idNumber,
      testUser.idCopy,
      true,  // is_host (dual role)
      true   // is_active
    ];

    const result = await client.query(insertQuery, values);
    const user = result.rows[0];

    console.log('\n✅ User created successfully!');
    console.log(JSON.stringify({
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
    }, null, 2));

    // Query all users
    const allUsersResult = await client.query(`
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
      LIMIT 10
    `);

    console.log(`\n✅ Total users in database: ${allUsersResult.rows.length}`);
    console.log('\nRecent users:');
    allUsersResult.rows.forEach((u, idx) => {
      console.log(`${idx + 1}. ${u.first_name} ${u.last_name} - ${u.phone_number || u.email} (${u.id})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('\n✅ Connection closed');
  }
}

testSignup();
