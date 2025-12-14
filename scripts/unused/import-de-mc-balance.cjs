const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: '.env.local' });

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Function to convert question to database schema
function convertToDbSchema(question, index, schoolId, userId) {
  // Find correct_index from answers array
  const correctIndex = question.answers.findIndex(a => a === question.correct_answer);

  return {
    id: randomUUID(),
    type: question.type,
    subject: question.subject,
    grade: question.grade,
    difficulty: question.difficulty,
    language: question.language,
    question: question.question,
    answers: question.answers,
    correct_index: correctIndex >= 0 ? correctIndex : 0,
    correct_answer: question.correct_answer,
    explanation: question.explanation,
    lehrplan21_topic: question.lehrplan21Code,
    school_id: schoolId,
    created_by: userId,
    time_limit: 18000,
    tags: [question.subject, `grade-${question.grade}`, 'swiss-german', 'mc-balance'],
  };
}

async function importQuestions() {
  const client = await pool.connect();

  try {
    console.log('📖 Reading questions from de-mc-balance.json...');
    const questionsPath = path.join(__dirname, 'de-mc-balance.json');
    const rawData = fs.readFileSync(questionsPath, 'utf8');
    const questions = JSON.parse(rawData);

    console.log(`✅ Loaded ${questions.length} questions`);

    // Get or create school and user
    let schoolResult = await client.query('SELECT id FROM schools LIMIT 1');
    let schoolId;
    if (schoolResult.rows.length === 0) {
      console.log('Creating default school...');
      schoolId = randomUUID();
      await client.query(
        `INSERT INTO schools (id, name, code, created_at, updated_at)
         VALUES ($1, 'LearnKick Default School', 'LEARNKICK', NOW(), NOW())`,
        [schoolId]
      );
    } else {
      schoolId = schoolResult.rows[0].id;
      console.log(`📍 Using existing school: ${schoolId}`);
    }

    let userResult = await client.query('SELECT id FROM users LIMIT 1');
    let userId;
    if (userResult.rows.length === 0) {
      console.log('Creating system user...');
      userId = randomUUID();
      await client.query(
        `INSERT INTO users (id, email, role, school_id, created_at, updated_at)
         VALUES ($1, 'system@learnkick.ch', 'admin', $2, NOW(), NOW())`,
        [userId, schoolId]
      );
    } else {
      userId = userResult.rows[0].id;
      console.log(`👤 Using existing user: ${userId}`);
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    await client.query('BEGIN');

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const dbQuestion = convertToDbSchema(question, i, schoolId, userId);

      try {
        // Check if question already exists (by question text and language)
        const checkResult = await client.query(
          'SELECT id FROM questions WHERE question = $1 AND language = $2',
          [dbQuestion.question, dbQuestion.language]
        );

        if (checkResult.rows.length > 0) {
          console.log(`⚠️  Question "${dbQuestion.question.substring(0, 50)}..." already exists, skipping...`);
          continue;
        }

        // Insert question
        await client.query(
          `INSERT INTO questions (
            id, school_id, created_by, type, subject, grade, difficulty, language,
            question, statement, answers, correct_index, correct_answer, explanation,
            tags, time_limit, lehrplan21_topic, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW()
          )`,
          [
            dbQuestion.id,
            dbQuestion.school_id,
            dbQuestion.created_by,
            dbQuestion.type,
            dbQuestion.subject,
            dbQuestion.grade,
            dbQuestion.difficulty,
            dbQuestion.language,
            dbQuestion.question,
            null, // statement (for true-false questions)
            dbQuestion.answers, // PostgreSQL array
            dbQuestion.correct_index,
            dbQuestion.correct_answer,
            dbQuestion.explanation,
            dbQuestion.tags, // PostgreSQL array
            dbQuestion.time_limit,
            dbQuestion.lehrplan21_topic,
          ]
        );

        successCount++;
        if ((i + 1) % 25 === 0) {
          console.log(`📊 Progress: ${i + 1}/${questions.length} questions processed...`);
        }
      } catch (error) {
        errorCount++;
        errors.push({ id: dbQuestion.id, error: error.message });
        console.error(`❌ Error importing question ${dbQuestion.id}:`, error.message);
      }
    }

    await client.query('COMMIT');

    console.log('\n📊 Import Summary:');
    console.log(`✅ Successfully imported: ${successCount} questions`);
    console.log(`❌ Failed: ${errorCount} questions`);

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(({ id, error }) => {
        console.log(`  - ${id}: ${error}`);
      });
    }

    // Display subject distribution
    console.log('\n📈 Subject Distribution:');
    const distribution = {};
    questions.forEach((q) => {
      distribution[q.subject] = (distribution[q.subject] || 0) + 1;
    });
    Object.entries(distribution).forEach(([subject, count]) => {
      console.log(`  - ${subject}: ${count} questions`);
    });

    // Display grade distribution
    console.log('\n📚 Grade Distribution:');
    const gradeDistribution = {};
    questions.forEach((q) => {
      gradeDistribution[q.grade] = (gradeDistribution[q.grade] || 0) + 1;
    });
    Object.entries(gradeDistribution)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .forEach(([grade, count]) => {
        console.log(`  - Grade ${grade}: ${count} questions`);
      });

    return successCount;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run import
importQuestions()
  .then((count) => {
    console.log(`\n✅ Import completed successfully! ${count} questions added to database.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });
