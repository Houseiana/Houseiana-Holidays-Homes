/**
 * Setup Chat System Tables
 * This script creates the chat, messaging, and support ticket tables
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupChatTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🚀 Setting up Chat System tables...\n');

    await client.connect();
    console.log('✓ Connected to database');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../prisma/add-chat-tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    // Execute the SQL
    console.log('📋 Creating chat system tables and enums...');
    await client.query(sql);

    console.log('✅ Chat system tables created successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 CHAT SYSTEM READY:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✓ Conversations table');
    console.log('✓ Messages table');
    console.log('✓ Support Tickets table');
    console.log('✓ All chat enums');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n🌐 Chat features now available in both apps!\n');

  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('ℹ️  Chat tables already exist. Skipping...\n');
    } else {
      console.error('❌ Error setting up chat tables:', error.message);
      throw error;
    }
  } finally {
    await client.end();
  }
}

setupChatTables()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
