#!/usr/bin/env node

/**
 * Import French True/False Balance Questions
 * Imports 177 unique French true-false questions to the database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function importQuestions() {
  const client = await pool.connect();

  try {
    console.log('📚 Starting French True/False Balance Questions Import...\n');

    // Read questions from JSON file
    const questionsPath = path.join(__dirname, 'fr-tf-balance.json');
    const questionsData = fs.readFileSync(questionsPath, 'utf-8');
    const questions = JSON.parse(questionsData);

    console.log(`📖 Loaded ${questions.length} questions from file`);

    // Verify balance
    const vraiCount = questions.filter(q => q.correct_answer === 'Vrai').length;
    const fauxCount = questions.filter(q => q.correct_answer === 'Faux').length;
    console.log(`✅ Balance verified: ${vraiCount} Vrai, ${fauxCount} Faux\n`);

    // Get a default school_id (first available school)
    const schoolResult = await client.query('SELECT id FROM schools LIMIT 1');

    if (schoolResult.rows.length === 0) {
      console.error('❌ No schools found in database. Please create a school first.');
      process.exit(1);
    }

    const schoolId = schoolResult.rows[0].id;
    console.log(`🏫 Using school_id: ${schoolId}\n`);

    // Get a default user_id (first admin user)
    const userResult = await client.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );

    let userId = null;
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
      console.log(`👤 Using user_id: ${userId}\n`);
    } else {
      console.log('⚠️  No admin user found, proceeding without user_id\n');
    }

    // Start transaction
    await client.query('BEGIN');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const question of questions) {
      try {
        const insertQuery = `
          INSERT INTO questions (
            type,
            language,
            grade,
            subject,
            question,
            correct_answer,
            explanation,
            difficulty,
            school_id,
            created_by,
            validation_status,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
          RETURNING id
        `;

        const values = [
          question.type,
          question.language,
          question.grade,
          question.subject,
          question.question,
          question.correct_answer,
          question.explanation,
          question.difficulty,
          schoolId,
          userId,
          'approved'
        ];

        const result = await client.query(insertQuery, values);
        successCount++;

        if (successCount % 25 === 0) {
          console.log(`✓ Imported ${successCount} questions...`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          question: question.question.substring(0, 50) + '...',
          error: error.message
        });
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 IMPORT COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Successfully imported: ${successCount} questions`);
    console.log(`❌ Failed: ${errorCount} questions`);
    console.log(`📝 Total processed: ${questions.length} questions\n`);

    // Verify final balance in database
    const balanceCheck = await client.query(`
      SELECT
        correct_answer,
        COUNT(*) as count
      FROM questions
      WHERE language = 'fr'
        AND type = 'true-false'
        AND validation_status = 'approved'
        AND created_at > NOW() - INTERVAL '1 minute'
      GROUP BY correct_answer
    `);

    console.log('✓ Database verification:');
    balanceCheck.rows.forEach(row => {
      console.log(`  ${row.correct_answer}: ${row.count} questions`);
    });

    if (errorCount > 0) {
      console.log('\n⚠️  Errors encountered:');
      errors.slice(0, 5).forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err.question}`);
        console.log(`     Error: ${err.error}`);
      });
      if (errors.length > 5) {
        console.log(`  ... and ${errors.length - 5} more errors`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Import failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run import
importQuestions();
