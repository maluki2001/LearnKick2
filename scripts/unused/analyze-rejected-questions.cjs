const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function analyzeRejected() {
  const client = await pool.connect();

  try {
    // Get sample rejected questions with their QC reports
    const result = await client.query(`
      SELECT id, question, type, answers, correct_answer, qc_agent_report
      FROM questions
      WHERE language = 'de'
        AND subject = 'german'
        AND validation_status = 'rejected'
      LIMIT 10
    `);

    console.log('📊 SAMPLE OF REJECTED QUESTIONS\n');
    console.log('='.repeat(80));

    result.rows.forEach((q, idx) => {
      console.log(`\n${idx + 1}. Question ID: ${q.id}`);
      console.log(`   Type: ${q.type}`);
      console.log(`   Question: "${q.question}"`);
      console.log(`   Correct Answer: ${q.correct_answer}`);

      if (q.answers) {
        console.log(`   Answers:`, q.answers);
      }

      if (q.qc_agent_report) {
        console.log(`   QC Report Errors:`);
        q.qc_agent_report.errors.forEach(err => {
          console.log(`     - ${err}`);
        });
      }
    });

    // Get statistics on error types
    console.log('\n\n' + '='.repeat(80));
    console.log('ERROR STATISTICS');
    console.log('='.repeat(80) + '\n');

    const errorStats = {};
    result.rows.forEach(q => {
      if (q.qc_agent_report && q.qc_agent_report.errors) {
        q.qc_agent_report.errors.forEach(err => {
          errorStats[err] = (errorStats[err] || 0) + 1;
        });
      }
    });

    Object.entries(errorStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([error, count]) => {
        console.log(`${count}x - ${error}`);
      });

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

analyzeRejected();
