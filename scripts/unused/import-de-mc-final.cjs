const { Pool } = require('pg');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function importQuestions() {
  const filename = 'de-mc-final.json';
  console.log(`Reading questions from ${filename}...`);
  const questions = JSON.parse(fs.readFileSync(filename, 'utf8'));
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
        // Our questions already have the correct format
        await client.query(
          `INSERT INTO questions (
            id, school_id, created_by, type, subject, grade, difficulty, language,
            question, answers, correct_index, tags, time_limit, lehrplan21_topic,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
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
            q.question,
            q.answers || null,
            q.correctIndex,
            q.tags || [],
            18000, // time limit
            q.curriculumCode || null
          ]
        );

        imported++;
        if (imported % 10 === 0) {
          console.log(`  Imported ${imported}/${questions.length} questions...`);
        }
      } catch (err) {
        errors++;
        if (errors <= 5) {
          console.error(`Error importing question:`, err.message);
          console.error(`Question:`, q.question);
        }
      }
    }

    console.log('');
    console.log('='.repeat(50));
    console.log(`IMPORT COMPLETE`);
    console.log(`  Successfully imported: ${imported}`);
    console.log(`  Errors: ${errors}`);
    console.log('='.repeat(50));

    // Get total question count
    const result = await client.query('SELECT COUNT(*) FROM questions');
    console.log(`Total questions in database: ${result.rows[0].count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

importQuestions().catch(console.error);
