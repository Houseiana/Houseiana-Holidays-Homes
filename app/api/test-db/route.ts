import { NextRequest, NextResponse } from 'next/server';

/**
 * Database Connection Test API
 * Tests CRUD operations with Neon PostgreSQL database
 */

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'test';

    console.log('🔍 Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

    // Test basic connection
    if (action === 'test') {
      return await testConnection();
    }

    // Create table
    if (action === 'create-table') {
      return await createTestTable();
    }

    // Insert test data
    if (action === 'insert') {
      return await insertTestData();
    }

    // Read test data
    if (action === 'read') {
      return await readTestData();
    }

    // Update test data
    if (action === 'update') {
      return await updateTestData();
    }

    // Delete test data
    if (action === 'delete') {
      return await deleteTestData();
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use: test, create-table, insert, read, update, delete'
    });

  } catch (error: any) {
    console.error('❌ Database test error:', error);
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

// Test basic connection
async function testConnection() {
  try {
    const { Client } = await import('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    console.log('📡 Connecting to database...');
    await client.connect();

    console.log('✅ Connected! Running test query...');
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');

    await client.end();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        currentTime: result.rows[0].current_time,
        postgresVersion: result.rows[0].postgres_version,
        host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]
      }
    });
  } catch (error: any) {
    console.error('❌ Connection test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Connection failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// Create test table
async function createTestTable() {
  try {
    const { Client } = await import('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    console.log('📝 Creating test table...');

    // Drop table if exists
    await client.query('DROP TABLE IF EXISTS test_users');

    // Create table
    const createTableQuery = `
      CREATE TABLE test_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client.query(createTableQuery);

    console.log('✅ Table created successfully');

    await client.end();

    return NextResponse.json({
      success: true,
      message: 'Test table "test_users" created successfully!',
      table: 'test_users',
      columns: ['id', 'name', 'email', 'created_at', 'updated_at']
    });
  } catch (error: any) {
    console.error('❌ Create table failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Create table failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// INSERT test data
async function insertTestData() {
  try {
    const { Client } = await import('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    console.log('📝 Inserting test data...');

    const insertQuery = `
      INSERT INTO test_users (name, email)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await client.query(insertQuery, [
      'John Doe',
      `test-${Date.now()}@example.com`
    ]);

    console.log('✅ Data inserted successfully');

    await client.end();

    return NextResponse.json({
      success: true,
      message: 'Test data inserted successfully!',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('❌ Insert failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Insert failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// READ test data
async function readTestData() {
  try {
    const { Client } = await import('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    console.log('📖 Reading test data...');

    const result = await client.query('SELECT * FROM test_users ORDER BY id DESC LIMIT 10');

    console.log(`✅ Found ${result.rows.length} records`);

    await client.end();

    return NextResponse.json({
      success: true,
      message: `Found ${result.rows.length} records`,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error: any) {
    console.error('❌ Read failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Read failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// UPDATE test data
async function updateTestData() {
  try {
    const { Client } = await import('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    console.log('✏️ Updating test data...');

    // Get the latest record
    const getLatest = await client.query('SELECT id FROM test_users ORDER BY id DESC LIMIT 1');

    if (getLatest.rows.length === 0) {
      await client.end();
      return NextResponse.json({
        success: false,
        message: 'No records to update. Please insert data first.'
      }, { status: 404 });
    }

    const latestId = getLatest.rows[0].id;

    const updateQuery = `
      UPDATE test_users
      SET name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      'John Doe (Updated)',
      latestId
    ]);

    console.log('✅ Data updated successfully');

    await client.end();

    return NextResponse.json({
      success: true,
      message: 'Test data updated successfully!',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('❌ Update failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Update failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE test data
async function deleteTestData() {
  try {
    const { Client } = await import('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    console.log('🗑️ Deleting test data...');

    // Get the latest record
    const getLatest = await client.query('SELECT id FROM test_users ORDER BY id DESC LIMIT 1');

    if (getLatest.rows.length === 0) {
      await client.end();
      return NextResponse.json({
        success: false,
        message: 'No records to delete.'
      }, { status: 404 });
    }

    const latestId = getLatest.rows[0].id;

    const deleteQuery = 'DELETE FROM test_users WHERE id = $1 RETURNING *';
    const result = await client.query(deleteQuery, [latestId]);

    console.log('✅ Data deleted successfully');

    await client.end();

    return NextResponse.json({
      success: true,
      message: 'Test data deleted successfully!',
      deletedRecord: result.rows[0]
    });
  } catch (error: any) {
    console.error('❌ Delete failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Delete failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}
