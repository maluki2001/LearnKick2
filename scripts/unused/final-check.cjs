const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('\n🔍 Final Database Check\n');

    // Check all validation statuses
    const { rows: allStatuses } = await pool.query(`
      SELECT validation_status, COUNT(*) as count
      FROM questions
      WHERE language IN ('en', 'fr')
      GROUP BY validation_status
      ORDER BY validation_status
    `);

    console.log('All validation statuses in database:');
    allStatuses.forEach(row => {
      console.log(`  ${row.validation_status || '(null)'}: ${row.count}`);
    });

    // Get breakdown by language and status
    console.log('\nBreakdown by language:');
    const { rows: breakdown } = await pool.query(`
      SELECT language, validation_status, COUNT(*) as count
      FROM questions
      WHERE language IN ('en', 'fr')
      GROUP BY language, validation_status
      ORDER BY language, validation_status
    `);

    breakdown.forEach(row => {
      console.log(`  ${row.language} - ${row.validation_status || '(null)'}: ${row.count}`);
    });

    // Show the 2 flagged questions
    console.log('\n🔍 Flagged Questions (need fixing):');
    const { rows: flagged } = await pool.query(`
      SELECT id, question, answers, correct_answer, validation_status
      FROM questions
      WHERE validation_status = 'rejected'
      ORDER BY grade
    `);

    flagged.forEach((q, idx) => {
      console.log(`\n${idx + 1}. ID: ${q.id}`);
      console.log(`   Status: ${q.validation_status}`);
      console.log(`   Question: ${q.question}`);
      console.log(`   Answers: ${JSON.stringify(q.answers)}`);
      console.log(`   Correct: ${q.correct_answer}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

run();
