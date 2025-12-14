#!/usr/bin/env node
const fs = require('fs');
const { Client } = require('pg');

async function importQuestions() {
  const questions = JSON.parse(fs.readFileSync('/Users/arisejupi/Desktop/LearnKick-LeanMVP/false-truefalse-questions.json', 'utf8'));
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log('Importing', questions.length, 'FALSE true/false questions...');

  let imported = 0;
  for (const q of questions) {
    try {
      await client.query(`
        INSERT INTO questions (
          type, language, grade, subject, question, correct_answer,
          explanation, difficulty, lehrplan21_topic, is_active, validation_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        q.type, q.language, q.grade, q.subject, q.question, q.correct_answer,
        q.explanation, q.difficulty, q.lehrplan21_topic, q.is_active, 'approved'
      ]);
      imported++;
      if (imported % 100 === 0) console.log(`  Imported ${imported}/${questions.length}`);
    } catch (err) {
      console.error('Error importing question:', q.question.substring(0, 50), err.message);
    }
  }

  console.log(`\n✓ Successfully imported ${imported}/${questions.length} questions`);

  // Verify balance
  const result = await client.query(`
    SELECT
      CASE
        WHEN correct_answer ILIKE '%true%' OR correct_answer ILIKE '%wahr%' OR correct_answer ILIKE '%richtig%' OR correct_answer ILIKE '%vrai%' THEN 'TRUE'
        ELSE 'FALSE'
      END as answer_type,
      COUNT(*) as count
    FROM questions
    WHERE type = 'true-false'
    GROUP BY answer_type
  `);

  console.log('\n=== New TRUE/FALSE Distribution ===');
  console.table(result.rows);

  await client.end();
}

importQuestions().catch(console.error);
