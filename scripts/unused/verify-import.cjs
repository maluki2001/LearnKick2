const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyImport() {
  const client = await pool.connect();

  try {
    // Get total count of English multiple-choice questions
    const totalResult = await client.query(
      `SELECT COUNT(*) as total FROM questions
       WHERE language = 'en' AND type = 'multiple-choice'`
    );

    console.log('='.repeat(60));
    console.log('ENGLISH MULTIPLE-CHOICE QUESTIONS IN DATABASE');
    console.log('='.repeat(60));
    console.log(`Total: ${totalResult.rows[0].total} questions`);
    console.log('');

    // Get breakdown by subject
    const subjectResult = await client.query(
      `SELECT subject, COUNT(*) as count
       FROM questions
       WHERE language = 'en' AND type = 'multiple-choice'
       GROUP BY subject
       ORDER BY subject`
    );

    console.log('Breakdown by Subject:');
    console.log('-'.repeat(60));
    subjectResult.rows.forEach(row => {
      console.log(`  ${row.subject.padEnd(30)} ${row.count.toString().padStart(4)} questions`);
    });
    console.log('');

    // Get breakdown by grade
    const gradeResult = await client.query(
      `SELECT grade, COUNT(*) as count
       FROM questions
       WHERE language = 'en' AND type = 'multiple-choice'
       GROUP BY grade
       ORDER BY grade`
    );

    console.log('Breakdown by Grade:');
    console.log('-'.repeat(60));
    gradeResult.rows.forEach(row => {
      console.log(`  Grade ${row.grade}                          ${row.count.toString().padStart(4)} questions`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

verifyImport().catch(console.error);
