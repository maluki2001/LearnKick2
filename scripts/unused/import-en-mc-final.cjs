const { Pool } = require('pg');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function importQuestions() {
  console.log('Reading questions from en-mc-final.json...');
  const questions = JSON.parse(fs.readFileSync('en-mc-final.json', 'utf8'));
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

    // Map difficulty text to numbers
    const difficultyMap = {
      'easy': 1,
      'medium': 3,
      'hard': 5
    };

    for (const q of questions) {
      try {
        // Check for duplicate
        const existing = await client.query(
          'SELECT id FROM questions WHERE question = $1 AND language = $2 LIMIT 1',
          [q.question_text, q.language]
        );

        if (existing.rows.length > 0) {
          console.log(`  Skipping duplicate: ${q.question_text.substring(0, 50)}...`);
          continue;
        }

        const difficultyNum = difficultyMap[q.difficulty] || 3;

        await client.query(
          `INSERT INTO questions (
            id, school_id, created_by, type, subject, grade, difficulty, language,
            question, answers, correct_answer, explanation,
            tags, time_limit, validation_status, quality_score, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())`,
          [
            crypto.randomUUID(),
            schoolId,
            userId,
            q.question_type,
            q.subject,
            q.grade_level,
            difficultyNum,
            q.language,
            q.question_text,
            q.answer_options,
            q.correct_answer,
            q.explanation,
            q.curriculum_tags || [],
            q.time_limit * 1000, // Convert to milliseconds
            q.validation_status,
            95 // quality_score
          ]
        );

        imported++;
        if (imported % 10 === 0) {
          console.log(`  Imported ${imported}/${questions.length} questions...`);
        }
      } catch (err) {
        errors++;
        console.error(`Error importing question:`, err.message);
        console.error('Question:', q.question_text);
      }
    }

    console.log('');
    console.log('='.repeat(50));
    console.log(`IMPORT COMPLETE`);
    console.log(`  Successfully imported: ${imported}`);
    console.log(`  Errors: ${errors}`);
    console.log('='.repeat(50));

    // Get final count by subject
    const countResult = await client.query(`
      SELECT subject, COUNT(*) as count
      FROM questions
      WHERE language = 'en'
      GROUP BY subject
      ORDER BY subject
    `);

    console.log('\nTotal English questions by subject:');
    countResult.rows.forEach(row => {
      console.log(`  ${row.subject}: ${row.count}`);
    });

    const totalResult = await client.query(`
      SELECT COUNT(*) as total
      FROM questions
      WHERE language = 'en'
    `);
    console.log(`\nGrand Total English Questions: ${totalResult.rows[0].total}`);

  } finally {
    client.release();
    await pool.end();
  }
}

importQuestions().catch(console.error);
