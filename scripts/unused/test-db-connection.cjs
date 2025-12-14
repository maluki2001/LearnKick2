const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Test if tables exist
    console.log('📋 Checking tables...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('✅ Found', result.rows.length, 'tables:');
    result.rows.forEach(row => console.log('  -', row.table_name));

    // Check if there are any questions
    try {
      const questionCount = await client.query('SELECT COUNT(*) FROM questions');
      console.log('\n📝 Questions in database:', questionCount.rows[0].count);
    } catch (e) {
      console.log('\n❌ Questions table does not exist or is not accessible');
      console.log('Error:', e.message);
    }

    console.log('\n🎉 Database connection test complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testConnection();
