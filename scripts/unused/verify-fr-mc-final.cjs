#!/usr/bin/env node

const { Pool } = require('pg');

async function verifyImport() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Get total count
    const total = await pool.query(
      `SELECT COUNT(*) as count FROM questions WHERE language = 'fr'`
    );

    // Get breakdown by subject for the newly imported questions
    const subjects = await pool.query(`
      SELECT subject, COUNT(*) as count, type
      FROM questions
      WHERE language = 'fr'
        AND created_at > NOW() - INTERVAL '5 minutes'
      GROUP BY subject, type
      ORDER BY subject, type
    `);

    // Get breakdown by grade for new questions
    const grades = await pool.query(`
      SELECT grade, COUNT(*) as count
      FROM questions
      WHERE language = 'fr'
        AND created_at > NOW() - INTERVAL '5 minutes'
      GROUP BY grade
      ORDER BY grade
    `);

    // Sample a few questions
    const samples = await pool.query(`
      SELECT question, subject, grade, difficulty, answers
      FROM questions
      WHERE language = 'fr'
        AND created_at > NOW() - INTERVAL '5 minutes'
      LIMIT 5
    `);

    console.log('🇫🇷 FRENCH QUESTIONS VERIFICATION REPORT\n');
    console.log(`📊 Total French Questions: ${total.rows[0].count}\n`);

    console.log('📚 Newly Imported Questions (last 5 minutes):');
    console.log('   By Subject & Type:');
    subjects.rows.forEach(row => {
      console.log(`   - ${row.subject} (${row.type}): ${row.count}`);
    });

    console.log('\n   By Grade:');
    grades.rows.forEach(row => {
      console.log(`   - Grade ${row.grade}: ${row.count}`);
    });

    console.log('\n📝 Sample Questions:');
    samples.rows.forEach((q, i) => {
      console.log(`\n   ${i + 1}. ${q.question}`);
      console.log(`      Subject: ${q.subject} | Grade: ${q.grade} | Difficulty: ${q.difficulty}`);
      console.log(`      Answers: ${q.answers.join(', ')}`);
    });

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await pool.end();
  }
}

verifyImport();
