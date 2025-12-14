const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkNMGTotals() {
  const client = await pool.connect();

  try {
    console.log('NMG Question Validation Status:\n');

    // Total count
    const totalResult = await client.query(`
      SELECT COUNT(*) as count
      FROM questions
      WHERE language = 'de' AND subject = 'nmg'
    `);
    console.log(`Total NMG questions: ${totalResult.rows[0].count}`);

    // By validation status
    const statusResult = await client.query(`
      SELECT validation_status, COUNT(*) as count
      FROM questions
      WHERE language = 'de' AND subject = 'nmg'
      GROUP BY validation_status
      ORDER BY validation_status
    `);
    console.log('\nBy validation status:');
    statusResult.rows.forEach(row => {
      console.log(`  ${row.validation_status || 'NULL'}: ${row.count}`);
    });

    // Approved count
    const approvedResult = await client.query(`
      SELECT COUNT(*) as count
      FROM questions
      WHERE language = 'de' AND subject = 'nmg' AND validation_status = 'approved'
    `);
    console.log(`\nTotal approved: ${approvedResult.rows[0].count}`);

    // Failed count
    const failedResult = await client.query(`
      SELECT COUNT(*) as count
      FROM questions
      WHERE language = 'de' AND subject = 'nmg' AND validation_status = 'qc_failed'
    `);
    console.log(`Total failed: ${failedResult.rows[0].count}`);

    // Get some examples of failed questions if any
    if (parseInt(failedResult.rows[0].count) > 0) {
      const examplesResult = await client.query(`
        SELECT id, question, correct_answer, flagged_reason
        FROM questions
        WHERE language = 'de' AND subject = 'nmg' AND validation_status = 'qc_failed'
        LIMIT 10
      `);
      console.log('\nFailed question examples:');
      examplesResult.rows.forEach(row => {
        console.log(`\nID: ${row.id}`);
        console.log(`Question: ${row.question}`);
        console.log(`Answer: ${row.correct_answer}`);
        console.log(`Reason: ${row.flagged_reason}`);
      });
    }

  } finally {
    client.release();
    await pool.end();
  }
}

checkNMGTotals()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
