const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('📊 Checking question statistics...\n');

    // Get total count by language
    const { rows: counts } = await pool.query(`
      SELECT language, COUNT(*) as count
      FROM questions
      GROUP BY language
      ORDER BY language
    `);

    console.log('Questions by language:');
    counts.forEach(row => {
      console.log(`  ${row.language}: ${row.count}`);
    });

    // Get validation status breakdown
    const { rows: validationStats } = await pool.query(`
      SELECT language, validation_status, COUNT(*) as count
      FROM questions
      WHERE language IN ('en', 'fr')
      GROUP BY language, validation_status
      ORDER BY language, validation_status
    `);

    console.log('\nValidation status by language:');
    validationStats.forEach(row => {
      console.log(`  ${row.language} - ${row.validation_status}: ${row.count}`);
    });

    // Get the flagged questions in detail
    const { rows: flagged } = await pool.query(`
      SELECT id, question, type, answers, correct_answer, grade, language, subject
      FROM questions
      WHERE language IN ('en', 'fr') AND validation_status = 'flagged'
    `);

    if (flagged.length > 0) {
      console.log('\n🔍 Flagged questions (full details):\n');
      flagged.forEach((q, idx) => {
        console.log(`${idx + 1}. [${q.language.toUpperCase()}] Grade ${q.grade} - ${q.subject}`);
        console.log(`   ID: ${q.id}`);
        console.log(`   Type: ${q.type}`);
        console.log(`   Question: "${q.question}"`);
        if (q.answers) {
          console.log(`   Answers: ${JSON.stringify(q.answers)}`);
        }
        console.log(`   Correct: "${q.correct_answer}"`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

run();
