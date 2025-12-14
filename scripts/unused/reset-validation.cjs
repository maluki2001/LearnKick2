const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetValidation() {
  const client = await pool.connect();

  try {
    console.log('🔄 Resetting validation status for German questions...\n');

    const result = await client.query(`
      UPDATE questions
      SET validation_status = 'qc_passed',
          quality_score = NULL,
          qc_agent_report = NULL,
          review_date = NULL
      WHERE language = 'de'
        AND subject = 'german'
        AND validation_status IN ('approved', 'rejected')
      RETURNING id
    `);

    console.log(`✅ Reset ${result.rowCount} questions back to 'qc_passed' status\n`);

    // Show current status
    const statusResult = await client.query(`
      SELECT validation_status, COUNT(*) as count
      FROM questions
      WHERE language = 'de' AND subject = 'german'
      GROUP BY validation_status
      ORDER BY count DESC
    `);

    console.log('Current validation statuses:');
    statusResult.rows.forEach(row => {
      console.log(`  ${row.validation_status || 'NULL'}: ${row.count} questions`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

resetValidation();
