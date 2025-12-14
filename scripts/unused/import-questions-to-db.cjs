const { Pool } = require('pg');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function importQuestions() {
  console.log('Reading questions from complete-question-bank.json...');
  const questions = JSON.parse(fs.readFileSync('complete-question-bank.json', 'utf8'));
  console.log(`Found ${questions.length} questions to import`);

  const client = await pool.connect();

  try {
    // Check for existing school or create one
    let schoolResult = await client.query('SELECT id FROM schools LIMIT 1');
    let schoolId;

    if (schoolResult.rows.length === 0) {
      console.log('Creating default school...');
      schoolId = crypto.randomUUID();
      await client.query(
        `INSERT INTO schools (id, name, code, created_at, updated_at)
         VALUES ($1, 'LearnKick Default School', 'LEARNKICK', NOW(), NOW())`,
        [schoolId]
      );
    } else {
      schoolId = schoolResult.rows[0].id;
      console.log('Using existing school:', schoolId);
    }

    // Check for existing user or create one
    let userResult = await client.query('SELECT id FROM users LIMIT 1');
    let userId;

    if (userResult.rows.length === 0) {
      console.log('Creating system user...');
      userId = crypto.randomUUID();
      await client.query(
        `INSERT INTO users (id, email, role, school_id, created_at, updated_at)
         VALUES ($1, 'system@learnkick.ch', 'admin', $2, NOW(), NOW())`,
        [userId, schoolId]
      );
    } else {
      userId = userResult.rows[0].id;
      console.log('Using existing user:', userId);
    }

    let imported = 0;
    let errors = 0;

    console.log('Starting import...');

    for (const q of questions) {
      try {
        // Transform question format
        const answers = q.options || (q.type === 'true-false' ? ['Richtig', 'Falsch'] : null);
        let correctIndex = null;

        if (answers && q.correctAnswer) {
          correctIndex = answers.findIndex(a =>
            a.toLowerCase() === q.correctAnswer.toString().toLowerCase()
          );
          if (correctIndex === -1) correctIndex = 0;
        }

        await client.query(
          `INSERT INTO questions (
            id, school_id, created_by, type, subject, grade, difficulty, language,
            question, statement, answers, correct_index, correct_answer, explanation,
            tags, time_limit, lehrplan21_topic, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING`,
          [
            crypto.randomUUID(),
            schoolId,
            userId,
            q.type,
            q.subject,
            q.grade,
            q.difficulty,
            q.language,
            q.question || null,
            q.type === 'true-false' ? q.question : null,
            answers || null,
            correctIndex,
            q.correctAnswer,
            null, // explanation
            q.curriculumCode ? `{${q.curriculumCode}}` : '{}',
            15000, // time limit
            q.curriculumCode || null
          ]
        );

        imported++;
        if (imported % 500 === 0) {
          console.log(`  Imported ${imported}/${questions.length} questions...`);
        }
      } catch (err) {
        errors++;
        if (errors <= 5) {
          console.error(`Error importing question ${q.id}:`, err.message);
        }
      }
    }

    console.log('');
    console.log('='.repeat(50));
    console.log(`IMPORT COMPLETE`);
    console.log(`  Successfully imported: ${imported}`);
    console.log(`  Errors: ${errors}`);
    console.log('='.repeat(50));

  } finally {
    client.release();
    await pool.end();
  }
}

importQuestions().catch(console.error);
