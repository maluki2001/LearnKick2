const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getFlaggedQuestion() {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT id, question, type, answers, correct_answer, grade, difficulty,
             validation_status, flagged_reason, lehrplan21_topic
      FROM questions
      WHERE id = '73afb7c2-1dac-452c-b047-62fdd7525a8c'
    `);

    if (result.rows.length > 0) {
      const q = result.rows[0];
      console.log('📋 FLAGGED QUESTION DETAILS');
      console.log('='.repeat(60));
      console.log(`ID: ${q.id}`);
      console.log(`Grade: ${q.grade}`);
      console.log(`Difficulty: ${q.difficulty}`);
      console.log(`Type: ${q.type}`);
      console.log(`Lehrplan21: ${q.lehrplan21_topic}`);
      console.log(`\nQuestion: ${q.question}`);
      console.log(`\nAnswers: ${JSON.stringify(q.answers, null, 2)}`);
      console.log(`\nCorrect Answer: ${q.correct_answer}`);
      console.log(`\nValidation Status: ${q.validation_status}`);
      console.log(`Flagged Reason: ${q.flagged_reason}`);
    } else {
      console.log('Question not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

getFlaggedQuestion();
