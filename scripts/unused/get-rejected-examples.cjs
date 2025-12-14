const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getRejectedExamples() {
  const client = await pool.connect();

  try {
    // Get examples of each type of error
    const punctuationExample = await client.query(`
      SELECT id, question, type, answers, correct_answer, qc_agent_report
      FROM questions
      WHERE language = 'de'
        AND subject = 'german'
        AND validation_status = 'rejected'
        AND qc_agent_report->>'errors' LIKE '%Missing punctuation%'
      LIMIT 3
    `);

    console.log('EXAMPLES OF PUNCTUATION ERRORS:\n');
    punctuationExample.rows.forEach((q, idx) => {
      console.log(`${idx + 1}. "${q.question}"`);
      console.log(`   Type: ${q.type}`);
      console.log(`   Fix: Add punctuation mark at the end\n`);
    });

    const duplicateExample = await client.query(`
      SELECT id, question, type, answers, correct_answer, qc_agent_report
      FROM questions
      WHERE language = 'de'
        AND subject = 'german'
        AND validation_status = 'rejected'
        AND qc_agent_report->>'errors' LIKE '%duplicate%'
      LIMIT 3
    `);

    console.log('\nEXAMPLES OF DUPLICATE ANSWER ERRORS:\n');
    duplicateExample.rows.forEach((q, idx) => {
      console.log(`${idx + 1}. "${q.question}"`);
      console.log(`   Answers: [${q.answers.join(', ')}]`);
      console.log(`   Issue: Contains duplicate answer options`);
      console.log(`   Fix: Replace duplicates with unique alternatives\n`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

getRejectedExamples();
