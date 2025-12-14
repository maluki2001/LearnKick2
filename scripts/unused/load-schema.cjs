const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function loadSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');

    console.log('📄 Reading schema file...');
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file read successfully');

    console.log('🚀 Executing schema...');
    await client.query(schema);
    console.log('✅ Schema loaded successfully!');

    console.log('\n🎉 Database setup complete!');
    console.log('You can now run: npm run dev');

  } catch (error) {
    console.error('❌ Error loading schema:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

loadSchema();
