const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('🔍 Checking rejected questions in detail...\n');

    const { rows: rejected } = await pool.query(`
      SELECT id, question, type, answers, correct_answer, grade, language, subject, difficulty
      FROM questions
      WHERE language IN ('en', 'fr') AND validation_status = 'rejected'
      ORDER BY language, grade
    `);

    console.log(`Found ${rejected.length} rejected questions:\n`);

    rejected.forEach((q, idx) => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`${idx + 1}. [${q.language.toUpperCase()}] Grade ${q.grade} - ${q.subject}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`ID: ${q.id}`);
      console.log(`Type: ${q.type}`);
      console.log(`Difficulty: ${q.difficulty}`);
      console.log(`\nQuestion:`);
      console.log(`  "${q.question}"`);
      console.log(`\nAnswers:`);
      if (q.answers && Array.isArray(q.answers)) {
        q.answers.forEach((ans, i) => {
          const marker = ans === q.correct_answer ? '✓' : ' ';
          console.log(`  [${marker}] ${i + 1}. "${ans}"`);
        });

        // Check for duplicates
        const seen = new Set();
        const duplicates = [];
        q.answers.forEach((ans, i) => {
          if (seen.has(ans)) {
            duplicates.push(`Answer ${i + 1}: "${ans}"`);
          }
          seen.add(ans);
        });

        if (duplicates.length > 0) {
          console.log(`\n  🚨 DUPLICATES FOUND:`);
          duplicates.forEach(dup => console.log(`     ${dup}`));
        }
      } else {
        console.log(`  ${JSON.stringify(q.answers)}`);
      }
      console.log(`\nCorrect Answer: "${q.correct_answer}"`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

run();
