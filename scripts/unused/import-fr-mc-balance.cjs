const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function importQuestions() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Loading questions from fr-mc-balance.json...');
    const questionsPath = path.join(__dirname, 'fr-mc-balance.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

    console.log(`Found ${questions.length} questions to import`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const q of questions) {
      try {
        // Validate required fields
        if (!q.type || !q.language || !q.grade || !q.subject || !q.question ||
            !q.answers || !Array.isArray(q.answers) || q.answers.length !== 4 ||
            !q.correct_answer || !q.explanation) {
          throw new Error('Missing required fields or invalid answer array');
        }

        // Insert question - PostgreSQL expects array format, not JSON string
        const result = await pool.query(
          `INSERT INTO questions (
            type, language, grade, subject, question,
            answers, correct_answer, explanation, difficulty,
            school_id, created_by, validation_status
          ) VALUES ($1, $2, $3, $4, $5, $6::text[], $7, $8, $9, $10, $11, $12)
          RETURNING id`,
          [
            q.type,
            q.language,
            q.grade,
            q.subject,
            q.question,
            q.answers, // Pass array directly, PostgreSQL will handle it
            q.correct_answer,
            q.explanation,
            q.difficulty || 3,
            null, // school_id - null for global questions
            null, // created_by - null for system-generated
            'approved' // validation_status
          ]
        );

        successCount++;
        console.log(`✓ Imported question ${successCount}: Grade ${q.grade} ${q.subject} (ID: ${result.rows[0].id})`);
      } catch (error) {
        errorCount++;
        errors.push({
          question: q.question.substring(0, 50) + '...',
          error: error.message
        });
        console.error(`✗ Failed to import question: ${error.message}`);
      }
    }

    console.log('\n=== Import Summary ===');
    console.log(`Total questions processed: ${questions.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Failed: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\n=== Errors ===');
      errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.question}`);
        console.log(`   Error: ${err.error}`);
      });
    }

    // Verify database counts
    console.log('\n=== Database Verification ===');
    const countResult = await pool.query(
      `SELECT
        language,
        grade,
        subject,
        COUNT(*) as count
      FROM questions
      WHERE language = 'fr' AND type = 'multiple-choice'
      GROUP BY language, grade, subject
      ORDER BY grade, subject`
    );

    console.log('\nFrench Multiple-Choice Questions by Grade and Subject:');
    countResult.rows.forEach(row => {
      console.log(`  Grade ${row.grade} - ${row.subject}: ${row.count} questions`);
    });

    const totalResult = await pool.query(
      `SELECT COUNT(*) as total FROM questions WHERE language = 'fr' AND type = 'multiple-choice'`
    );
    console.log(`\nTotal French Multiple-Choice Questions: ${totalResult.rows[0].total}`);

  } catch (error) {
    console.error('Fatal error during import:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set');
  console.error('Please set DATABASE_URL in your .env.local file');
  process.exit(1);
}

importQuestions();
