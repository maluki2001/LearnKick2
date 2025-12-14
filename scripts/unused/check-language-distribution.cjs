const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('\n📊 Language Distribution Analysis\n');

    // Check all rejected questions by language
    const { rows: rejected } = await pool.query(`
      SELECT language, COUNT(*) as count
      FROM questions
      WHERE validation_status = 'rejected'
      GROUP BY language
      ORDER BY language
    `);

    console.log('Rejected questions by language:');
    rejected.forEach(row => {
      console.log(`  ${row.language}: ${row.count}`);
    });

    // Check English and French specifically
    const { rows: enFrOnly } = await pool.query(`
      SELECT language, validation_status, COUNT(*) as count
      FROM questions
      WHERE language IN ('en', 'fr')
      GROUP BY language, validation_status
      ORDER BY language, validation_status
    `);

    console.log('\n✅ English and French validation summary:');
    enFrOnly.forEach(row => {
      console.log(`  ${row.language} - ${row.validation_status}: ${row.count}`);
    });

    // Get the 2 rejected EN/FR questions
    const { rows: enFrRejected } = await pool.query(`
      SELECT id, language, question, answers, correct_answer
      FROM questions
      WHERE language IN ('en', 'fr') AND validation_status = 'rejected'
      ORDER BY language, question
    `);

    console.log(`\n❌ English/French rejected questions (${enFrRejected.length}):\n`);
    enFrRejected.forEach((q, idx) => {
      console.log(`${idx + 1}. [${q.language.toUpperCase()}] ${q.question}`);
      console.log(`   Answers: ${JSON.stringify(q.answers)}`);
      console.log(`   Correct: ${q.correct_answer}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

run();
