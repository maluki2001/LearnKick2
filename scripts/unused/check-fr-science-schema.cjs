const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    const query = `
      SELECT id, question, answers, correct_answer, language, subject, grade
      FROM questions
      WHERE language = 'fr' AND subject = 'science'
      LIMIT 3
    `;

    const { rows } = await pool.query(query);

    console.log('Sample French Science Questions:');
    console.log(JSON.stringify(rows, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSchema();
