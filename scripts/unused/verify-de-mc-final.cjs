const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyImport() {
  const client = await pool.connect();

  try {
    console.log('\n='.repeat(60));
    console.log('DE-MC-FINAL IMPORT VERIFICATION');
    console.log('='.repeat(60));

    // Count all questions
    const total = await client.query('SELECT COUNT(*) FROM questions');
    console.log(`\nTotal questions in database: ${total.rows[0].count}`);

    // Count by language
    console.log('\nQuestions by Language:');
    const byLang = await client.query(
      'SELECT language, COUNT(*) FROM questions GROUP BY language ORDER BY language'
    );
    byLang.rows.forEach(row => {
      console.log(`  ${row.language}: ${row.count}`);
    });

    // Count German questions by type
    console.log('\nGerman Questions by Type:');
    const deByType = await client.query(
      `SELECT type, COUNT(*) FROM questions
       WHERE language = 'de'
       GROUP BY type ORDER BY type`
    );
    deByType.rows.forEach(row => {
      console.log(`  ${row.type}: ${row.count}`);
    });

    // Count German MC questions by subject
    console.log('\nGerman Multiple-Choice Questions by Subject:');
    const deMcBySubject = await client.query(
      `SELECT subject, COUNT(*) FROM questions
       WHERE language = 'de' AND type = 'multiple-choice'
       GROUP BY subject ORDER BY subject`
    );
    deMcBySubject.rows.forEach(row => {
      console.log(`  ${row.subject}: ${row.count}`);
    });

    // Count German MC questions by grade
    console.log('\nGerman Multiple-Choice Questions by Grade:');
    const deMcByGrade = await client.query(
      `SELECT grade, COUNT(*) FROM questions
       WHERE language = 'de' AND type = 'multiple-choice'
       GROUP BY grade ORDER BY grade`
    );
    deMcByGrade.rows.forEach(row => {
      console.log(`  Grade ${row.grade}: ${row.count}`);
    });

    // Sample some of the new questions
    console.log('\nSample of newly imported questions:');
    const samples = await client.query(
      `SELECT question, subject, grade, difficulty FROM questions
       WHERE language = 'de' AND type = 'multiple-choice'
       AND (question LIKE '%römische%' OR question LIKE '%Primzahl%' OR question LIKE '%Magnet%')
       LIMIT 5`
    );
    samples.rows.forEach((row, i) => {
      console.log(`\n  ${i + 1}. ${row.question}`);
      console.log(`     Subject: ${row.subject}, Grade: ${row.grade}, Difficulty: ${row.difficulty}`);
    });

    console.log('\n' + '='.repeat(60));

  } finally {
    client.release();
    await pool.end();
  }
}

verifyImport().catch(console.error);
