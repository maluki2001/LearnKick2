const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function getStats() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const stats = await pool.query(`
      SELECT
        validation_status,
        COUNT(*) as count
      FROM questions
      WHERE language = 'de' AND subject = 'nmg'
      GROUP BY validation_status
      ORDER BY validation_status
    `);

    console.log('=== NMG QUESTIONS VALIDATION STATUS ===\n');
    stats.rows.forEach(row => {
      console.log(`${row.validation_status.padEnd(20)}: ${row.count}`);
    });

    const total = await pool.query(`
      SELECT COUNT(*) as total FROM questions WHERE language = 'de' AND subject = 'nmg'
    `);
    console.log(`\nTotal NMG questions: ${total.rows[0].total}`);

    const approved = await pool.query(`
      SELECT COUNT(*) as approved FROM questions WHERE language = 'de' AND subject = 'nmg' AND validation_status = 'approved'
    `);
    console.log(`Approved: ${approved.rows[0].approved}`);
    console.log(`Approval rate: ${(approved.rows[0].approved / total.rows[0].total * 100).toFixed(2)}%`);

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

getStats();
