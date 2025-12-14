const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verify() {
  const client = await pool.connect();

  try {
    // Get count by subject for recently added questions
    const result = await client.query(`
      WITH recent_questions AS (
        SELECT subject, question
        FROM questions
        WHERE language = 'en'
        ORDER BY created_at DESC
        LIMIT 35
      )
      SELECT subject, COUNT(*) as count
      FROM recent_questions
      GROUP BY subject
      ORDER BY subject
    `);

    console.log('Last 35 English questions imported - breakdown by subject:');
    result.rows.forEach(r => console.log(`  ${r.subject}: ${r.count}`));

    const total = result.rows.reduce((sum, r) => sum + parseInt(r.count), 0);
    console.log(`  TOTAL: ${total}`);

    // Sample questions
    console.log('\nSample questions from recent import:');
    const samples = await client.query(`
      SELECT subject, question
      FROM questions
      WHERE language = 'en'
      ORDER BY created_at DESC
      LIMIT 5
    `);
    samples.rows.forEach(r => console.log(`  [${r.subject}] ${r.question.substring(0, 60)}...`));

  } finally {
    client.release();
    await pool.end();
  }
}

verify().catch(console.error);
