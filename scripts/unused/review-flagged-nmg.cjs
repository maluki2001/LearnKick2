const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkFlaggedQuestions() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const result = await pool.query(`
      SELECT id, question, answers, correct_answer, flagged_reason
      FROM questions
      WHERE id IN (
        '0213d5d9-0a48-4a14-95cc-d021d55b2fa4',
        '081b1268-0f44-45cc-a593-4656ddb0a303',
        '1f8656cd-9c75-4a9d-ba8d-38567daf24be',
        '2f5dfc18-39cf-46ce-b9a2-97516aa0be17',
        '44408d07-04ae-4708-96cd-8b25a4a8f2aa',
        '472ab405-c15d-4786-bdf3-30e5f4103934'
      )
    `);

    result.rows.forEach((q, idx) => {
      console.log(`\n=== QUESTION ${idx + 1} ===`);
      console.log(`ID: ${q.id}`);
      console.log(`Q: ${q.question}`);
      console.log(`Answers: ${JSON.stringify(q.answers, null, 2)}`);
      console.log(`Correct: ${q.correct_answer}`);
      console.log(`Flagged Reason: ${q.flagged_reason}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkFlaggedQuestions();
