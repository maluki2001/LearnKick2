const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkFlagged() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const result = await pool.query(`
      SELECT id, question, answers, correct_answer, flagged_reason
      FROM questions
      WHERE language = 'de' AND subject = 'nmg' AND validation_status = 'flagged'
    `);

    console.log(`=== ${result.rows.length} FLAGGED NMG QUESTIONS ===\n`);

    result.rows.forEach((q, idx) => {
      console.log(`${idx + 1}. ID: ${q.id}`);
      console.log(`   Question: ${q.question}`);
      console.log(`   Answers: ${JSON.stringify(q.answers)}`);
      console.log(`   Correct: ${q.correct_answer}`);
      console.log(`   Flagged Reason: ${q.flagged_reason}\n`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkFlagged();
