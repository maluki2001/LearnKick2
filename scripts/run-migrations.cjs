#!/usr/bin/env node
/**
 * Migration Runner - Executes SQL migrations on Neon database
 * Runs all migration files in order
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load DATABASE_URL from .env.local
require('dotenv').config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

async function runMigrations() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    console.log('🔌 Connecting to Neon database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Get all migration files in order
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📋 Found ${files.length} migration files:\n`);

    for (const file of files) {
      console.log(`▶️  Running ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await client.query(sql);
        console.log(`   ✅ ${file} completed successfully\n`);
      } catch (error) {
        console.error(`   ❌ ${file} failed:`);
        console.error(`   Error: ${error.message}\n`);
        // Continue with other migrations
      }
    }

    console.log('🎉 All migrations processed!');

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run migrations
runMigrations().catch(console.error);
