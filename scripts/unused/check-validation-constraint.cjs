const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkConstraint() {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) AS constraint_def
      FROM pg_constraint
      WHERE conrelid = 'questions'::regclass
        AND conname LIKE '%validation%'
    `);

    console.log('📋 Validation status constraints:');
    result.rows.forEach(row => {
      console.log(`\nConstraint: ${row.conname}`);
      console.log(`Definition: ${row.constraint_def}`);
    });

    // Also check current distinct values
    const values = await client.query(`
      SELECT DISTINCT validation_status
      FROM questions
      ORDER BY validation_status
    `);

    console.log('\n\n📊 Current validation_status values in use:');
    values.rows.forEach(row => {
      console.log(`  - ${row.validation_status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkConstraint();
