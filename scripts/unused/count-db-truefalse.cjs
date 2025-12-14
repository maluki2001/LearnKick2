#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function countDatabaseTrueFalse() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database\n');
    console.log('='.repeat(80));

    // Total count
    const totalResult = await client.query(`
      SELECT COUNT(*) as count
      FROM questions
      WHERE type = 'true-false' OR type = 'true_false' OR type = 'truefalse'
    `);
    console.log(`\nTotal true/false questions in database: ${totalResult.rows[0].count}`);

    // By language
    const langResult = await client.query(`
      SELECT language, COUNT(*) as count
      FROM questions
      WHERE type = 'true-false' OR type = 'true_false' OR type = 'truefalse'
      GROUP BY language
      ORDER BY count DESC
    `);
    console.log('\n🌍 By Language:');
    langResult.rows.forEach(row => {
      console.log(`  ${(row.language || 'unknown').padEnd(15)} ${row.count}`);
    });

    // By subject
    const subjectResult = await client.query(`
      SELECT subject, COUNT(*) as count
      FROM questions
      WHERE type = 'true-false' OR type = 'true_false' OR type = 'truefalse'
      GROUP BY subject
      ORDER BY count DESC
    `);
    console.log('\n📚 By Subject:');
    subjectResult.rows.forEach(row => {
      console.log(`  ${(row.subject || 'unknown').padEnd(20)} ${row.count}`);
    });

    // By grade
    const gradeResult = await client.query(`
      SELECT grade, COUNT(*) as count
      FROM questions
      WHERE type = 'true-false' OR type = 'true_false' OR type = 'truefalse'
      GROUP BY grade
      ORDER BY grade
    `);
    console.log('\n🎓 By Grade Level:');
    gradeResult.rows.forEach(row => {
      console.log(`  Grade ${(row.grade || 'unknown').toString().padEnd(10)} ${row.count}`);
    });

    // By validation status
    const validationResult = await client.query(`
      SELECT validation_status, COUNT(*) as count
      FROM questions
      WHERE type = 'true-false' OR type = 'true_false' OR type = 'truefalse'
      GROUP BY validation_status
      ORDER BY count DESC
    `);
    console.log('\n✅ By Validation Status:');
    validationResult.rows.forEach(row => {
      console.log(`  ${(row.validation_status || 'unknown').padEnd(15)} ${row.count}`);
    });

    // Sample questions
    const sampleResult = await client.query(`
      SELECT id, language, subject, grade, question, correct_answer
      FROM questions
      WHERE type = 'true-false' OR type = 'true_false' OR type = 'truefalse'
      ORDER BY created_at DESC
      LIMIT 5
    `);
    console.log('\n📝 Sample True/False Questions (5 most recent):');
    sampleResult.rows.forEach((row, i) => {
      console.log(`\n  ${i + 1}. [${row.language}] ${row.subject} - Grade ${row.grade}`);
      console.log(`     Q: ${row.question.substring(0, 80)}...`);
      console.log(`     A: ${row.correct_answer}`);
    });

    console.log('\n' + '='.repeat(80));

  } catch (err) {
    console.error('Error:', err.message);
    if (err.message.includes('connect')) {
      console.log('\nNote: Could not connect to database. Make sure DATABASE_URL is set in .env.local');
    }
  } finally {
    await client.end();
  }
}

countDatabaseTrueFalse();
