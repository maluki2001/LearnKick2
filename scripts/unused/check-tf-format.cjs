const { Client } = require('pg');

async function checkFormat() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT id, type, answers, correct_answer, question
      FROM questions
      WHERE type = 'true-false'
      AND language = 'de'
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      console.log('Sample true-false question:');
      console.log(JSON.stringify(result.rows[0], null, 2));
      console.log('\nAnswers type:', typeof result.rows[0].answers);
      console.log('Answers value:', result.rows[0].answers);
    } else {
      console.log('No true-false questions found');
    }

  } finally {
    await client.end();
  }
}

checkFormat().catch(console.error);
