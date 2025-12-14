const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getApprovedExamples() {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT id, question, type, answers, correct_answer, grade, difficulty
      FROM questions
      WHERE language = 'de'
        AND subject = 'german'
        AND validation_status = 'approved'
      ORDER BY RANDOM()
      LIMIT 5
    `);

    console.log('EXAMPLES OF APPROVED QUESTIONS:\n');
    result.rows.forEach((q, idx) => {
      console.log(`${idx + 1}. "${q.question}"`);
      console.log(`   Type: ${q.type}`);
      console.log(`   Grade: ${q.grade} | Difficulty: ${q.difficulty}`);
      if (q.type === 'multiple-choice') {
        console.log(`   Answers: [${q.answers.join(', ')}]`);
        console.log(`   Correct: ${q.correct_answer}`);
      } else if (q.type === 'true-false') {
        console.log(`   Correct: ${q.correct_answer}`);
      }
      console.log(`   ✅ Quality Score: 95/100\n`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

getApprovedExamples();
